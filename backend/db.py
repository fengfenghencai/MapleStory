"""
数据库模型定义
使用 SQLAlchemy 异步模式 + SQLite
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, desc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from datetime import datetime

from config import DATABASE_URL

# 1. 初始化异步引擎和会话
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # 生产环境设为False，避免打印SQL日志
    connect_args={
        "check_same_thread": False,  # SQLite必填，避免线程问题
        "timeout": 30  # 数据库锁等待超时时间（秒）
    },
    pool_pre_ping=True,  # 连接前检查连接是否有效
    pool_recycle=3600,  # 连接池回收时间
)

# 异步会话工厂
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
    expire_on_commit=True  # 提交后过期对象，确保下次查询获取新数据
)

# 2. 基础模型类
Base = declarative_base()


class Repo(Base):
    """GitHub仓库信息表"""
    __tablename__ = "repo"

    id = Column(Integer, primary_key=True, index=True)
    github_repo_id = Column(Integer, unique=True, nullable=False)  # GitHub官方仓库ID
    name = Column(String(100), nullable=False)  # 仓库名
    description = Column(Text, nullable=True)  # 仓库描述
    html_url = Column(String(255), nullable=False)  # 仓库URL
    language = Column(String(50), nullable=True)  # 主要开发语言
    stargazers_count = Column(Integer, default=0)  # 星标数
    forks_count = Column(Integer, default=0)  # Fork数
    updated_at = Column(String(50), nullable=False)  # GitHub更新时间
    pushed_at = Column(String(50), nullable=False)  # 最后推送时间
    created_at = Column(String(50), nullable=False)  # 仓库创建时间
    default_branch = Column(String(50), default="main")  # 默认分支
    commit_count = Column(Integer, default=0)  # 默认分支commit总数
    owner_id = Column(Integer, ForeignKey("user_info.id"), nullable=False)  # 关联用户表

    # 关联：多个仓库属于一个用户
    owner = relationship("UserInfo", back_populates="repos")


class UserInfo(Base):
    """GitHub用户信息表"""
    __tablename__ = "user_info"

    id = Column(Integer, primary_key=True, index=True)
    login = Column(String(50), unique=True, nullable=False)  # GitHub用户名
    name = Column(String(100), nullable=True)  # 真实姓名
    avatar_url = Column(String(255), nullable=False)  # 头像URL
    bio = Column(Text, nullable=True)  # 个人简介
    location = Column(String(100), nullable=True)  # 地理位置
    blog = Column(String(255), nullable=True)  # 个人博客
    html_url = Column(String(255), nullable=False)  # GitHub主页URL
    public_repos = Column(Integer, default=0)  # 公开仓库数
    followers = Column(Integer, default=0)  # 粉丝数
    following = Column(Integer, default=0)  # 关注数
    updated_at = Column(DateTime, default=datetime.now)  # 数据更新时间

    # 关联：一个用户对应多个仓库
    repos = relationship(
        "Repo",
        back_populates="owner",
        cascade="all, delete-orphan",
        order_by=desc(Repo.stargazers_count)
    )


class SyncStatus(Base):
    """同步状态表"""
    __tablename__ = "sync_status"

    id = Column(Integer, primary_key=True, index=True)
    sync_time = Column(DateTime, default=datetime.now)  # 同步时间
    status = Column(String(20), nullable=False)  # 同步状态：success/failed/processing
    message = Column(Text, nullable=True)  # 成功/失败信息
    total_commits = Column(Integer, nullable=True)  # 本次同步的总commit数


class LifePhoto(Base):
    """生活照片表"""
    __tablename__ = "life_photo"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)  # 照片标题
    description = Column(Text, nullable=True)  # 简短描述
    content = Column(Text, nullable=True)  # 详细内容
    date = Column(String(20), nullable=False)  # 日期，格式：YYYY-MM-DD
    likes = Column(Integer, default=0)  # 点赞数
    created_at = Column(DateTime, default=datetime.now)  # 创建时间
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)  # 更新时间

    # 关联：一个照片对应多张图片
    images = relationship(
        "LifePhotoImage",
        back_populates="photo",
        cascade="all, delete-orphan",
        order_by="LifePhotoImage.order"
    )


class LifePhotoImage(Base):
    """生活照片图片表"""
    __tablename__ = "life_photo_image"

    id = Column(Integer, primary_key=True, index=True)
    photo_id = Column(Integer, ForeignKey("life_photo.id"), nullable=False)  # 关联照片
    url = Column(String(255), nullable=False)  # 图片URL
    filename = Column(String(255), nullable=False)  # 文件名
    is_cover = Column(Integer, default=0)  # 是否为封面图片，0否1是
    order = Column(Integer, default=0)  # 排序

    # 关联：多张图片属于一个照片
    photo = relationship("LifePhoto", back_populates="images")

    @property
    def is_cover_bool(self) -> bool:
        return bool(self.is_cover)


# 4. 数据库依赖（获取异步会话）
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# 5. 初始化数据库表结构
async def init_db():
    from sqlalchemy import text
    async with engine.begin() as conn:
        # 启用WAL模式，提高并发写入性能
        await conn.execute(text("PRAGMA journal_mode=WAL"))
        await conn.run_sync(Base.metadata.create_all)
    print("数据库表结构初始化完成！")
