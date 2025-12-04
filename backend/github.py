"""
GitHub 数据同步模块
- 定时从 GitHub API 拉取数据
- 存储到本地 SQLite 数据库
- 提供 API 从数据库返回数据
"""

import traceback
from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import aiohttp
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
import logging
import os
from typing import Optional

from db import init_db, get_db, UserInfo, Repo, SyncStatus, AsyncSessionLocal
from config import (
    GITHUB_USERNAME, GITHUB_TOKEN, FETCH_INTERVAL_HOURS,
    GITHUB_REST_API
)

# 路由和日志配置
router = APIRouter(prefix="/api/github", tags=["GitHub"])
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("github_sync")

# 全局调度器
scheduler: Optional[AsyncIOScheduler] = None


# ------------------------------
# GitHub API 请求工具
# ------------------------------
def get_github_headers() -> dict:
    """获取GitHub API请求头"""
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "MapleStory-Website"
    }
    # 只有当 token 是有效的非空字符串时才添加认证头
    if GITHUB_TOKEN and GITHUB_TOKEN.strip():
        headers["Authorization"] = f"token {GITHUB_TOKEN.strip()}"
    return headers


async def fetch_rest_api(session: aiohttp.ClientSession, url: str) -> dict:
    """异步请求GitHub REST API"""
    try:
        async with session.get(url, headers=get_github_headers(), timeout=15) as resp:
            if resp.status != 200:
                raise Exception(f"HTTP {resp.status}: {await resp.text()}")

            link_header = resp.headers.get("Link")
            data = await resp.json()
            return {
                "data": data,
                "link": link_header
            }
    except Exception as e:
        logger.error(f"REST请求失败（{url}）: {str(e)}")
        raise


# ------------------------------
# 核心同步逻辑
# ------------------------------
async def sync_github_to_db(db: AsyncSession) -> None:
    """从GitHub拉取数据，写入数据库"""
    if not GITHUB_USERNAME:
        logger.error('GITHUB_USERNAME缺失，请在config.py中设置')
        return

    sync_status = SyncStatus(sync_time=datetime.now(), status="processing")

    try:
        async with aiohttp.ClientSession() as session:
            # 1. 拉取用户信息
            user_raw = await fetch_rest_api(
                session,
                f"{GITHUB_REST_API}/users/{GITHUB_USERNAME}"
            )
            user_raw = user_raw['data']

            # 2. 拉取仓库列表
            repos_raw = await fetch_rest_api(
                session,
                f"{GITHUB_REST_API}/users/{GITHUB_USERNAME}/repos?sort=pushed&per_page=100"
            )
            repos_raw = repos_raw['data']
            # 过滤掉 fork 的仓库
            repos_raw = [repo for repo in repos_raw if not repo.get("fork", False)]

            # 3. 批量获取每个仓库的 commit 数
            repo_commit_tasks = []
            for repo in repos_raw:
                repo_full_name = repo["full_name"]
                default_branch = repo.get("default_branch", "main")
                task = fetch_rest_api(
                    session,
                    f"{GITHUB_REST_API}/repos/{repo_full_name}/commits?sha={default_branch}&per_page=1&author={GITHUB_USERNAME}"
                )
                repo_commit_tasks.append((repo, task))

            # 处理仓库 commit 数结果
            repos_processed = []
            total_commits = 0
            for repo, task in repo_commit_tasks:
                try:
                    commit_resp = await task
                    link_header = commit_resp.get('link', '')
                    commit_count = 0
                    if link_header and 'rel="last"' in link_header:
                        last_page = link_header.split("page=")[-1].split(">")[0]
                        commit_count = int(last_page)
                    elif commit_resp.get('data'):
                        commit_count = 1
                except Exception:
                    logger.debug(traceback.format_exc())
                    commit_count = 0

                total_commits += commit_count
                repos_processed.append({
                    "github_repo_id": repo["id"],
                    "name": repo["name"],
                    "description": repo.get("description"),
                    "html_url": repo["html_url"],
                    "language": repo.get("language"),
                    "stargazers_count": repo["stargazers_count"],
                    "forks_count": repo["forks_count"],
                    "updated_at": repo["updated_at"],
                    "created_at": repo["created_at"],
                    "pushed_at": repo["pushed_at"],
                    "default_branch": repo.get("default_branch", "main"),
                    "commit_count": commit_count
                })

            # 4. 写入数据库（先删旧数据，再插入新数据）
            old_user = await db.execute(
                select(UserInfo).where(UserInfo.login == GITHUB_USERNAME)
            )
            old_user = old_user.scalars().first()
            if old_user:
                await db.delete(old_user)
                await db.flush()

            # 插入新用户信息
            new_user = UserInfo(
                login=user_raw["login"],
                name=user_raw.get("name"),
                avatar_url=user_raw["avatar_url"],
                bio=user_raw.get("bio"),
                location=user_raw.get("location"),
                blog=user_raw.get("blog"),
                html_url=user_raw["html_url"],
                public_repos=user_raw["public_repos"],
                followers=user_raw.get("followers", 0),
                following=user_raw.get("following", 0),
                updated_at=datetime.now()
            )
            db.add(new_user)
            await db.flush()

            # 插入新仓库信息
            for repo in repos_processed:
                new_repo = Repo(
                    github_repo_id=repo["github_repo_id"],
                    name=repo["name"],
                    description=repo["description"],
                    html_url=repo["html_url"],
                    language=repo["language"],
                    stargazers_count=repo["stargazers_count"],
                    forks_count=repo["forks_count"],
                    updated_at=repo["updated_at"],
                    created_at=repo["created_at"],
                    pushed_at=repo["pushed_at"],
                    default_branch=repo["default_branch"],
                    commit_count=repo["commit_count"],
                    owner_id=new_user.id
                )
                db.add(new_repo)

            # 5. 记录同步成功状态
            sync_status.status = "success"
            sync_status.message = "数据同步完成"
            sync_status.total_commits = total_commits
            logger.info(f"同步成功：总commit={total_commits}")

    except Exception as e:
        sync_status.status = "failed"
        sync_status.message = str(e)
        logger.error(f"同步失败: {str(e)}")
        logger.error(traceback.format_exc())

    db.add(sync_status)
    await db.commit()


# ------------------------------
# 定时任务
# ------------------------------
async def run_sync_task():
    """定时同步任务执行函数"""
    async with AsyncSessionLocal() as db:
        await sync_github_to_db(db)


async def init_scheduler():
    """初始化定时调度器"""
    global scheduler

    if scheduler and scheduler.running:
        logger.warning("调度器已运行，无需重复启动")
        return

    if os.getenv("UVICORN_WORKER_ID") is not None:
        logger.info("跳过调度器启动（当前为uvicorn子进程）")
        return

    scheduler = AsyncIOScheduler()
    # 立即执行一次同步
    scheduler.add_job(run_sync_task, "date", run_date=datetime.now(), id="sync_immediate")
    # 按间隔执行同步
    scheduler.add_job(
        run_sync_task,
        "interval",
        hours=FETCH_INTERVAL_HOURS,
        id="sync_interval",
        replace_existing=True
    )
    scheduler.start()
    logger.info(f"定时调度器启动成功，同步间隔：{FETCH_INTERVAL_HOURS}小时")


# ------------------------------
# 生命周期事件
# ------------------------------
async def startup_event():
    """服务启动时执行"""
    await init_db()
    await init_scheduler()


async def shutdown_event():
    """服务关闭时执行"""
    if scheduler and scheduler.running:
        scheduler.shutdown()
        logger.info("调度器已关闭")


# ------------------------------
# API 路由
# ------------------------------
@router.get("/data", summary="获取GitHub数据")
async def get_github_data(db: AsyncSession = Depends(get_db)):
    """返回用户信息、仓库列表、总commit数"""
    # 查询用户信息（含关联的仓库）
    user_result = await db.execute(
        select(UserInfo)
        .where(UserInfo.login == GITHUB_USERNAME)
        .options(selectinload(UserInfo.repos))
    )
    user = user_result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="数据库中无GitHub用户数据，请等待同步完成"
        )

    # 查询最新同步状态
    sync_result = await db.execute(
        select(SyncStatus).order_by(SyncStatus.sync_time.desc()).limit(1)
    )
    latest_sync = sync_result.scalars().first()
    if not latest_sync or latest_sync.status != "success":
        raise HTTPException(
            status_code=503,
            detail="暂无有效同步数据，请稍后重试"
        )

    return {
        "user_info": {
            "login": user.login,
            "name": user.name,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "location": user.location,
            "blog": user.blog,
            "html_url": user.html_url,
            "public_repos": user.public_repos,
            "followers": user.followers,
            "following": user.following
        },
        "repos": [
            {
                "id": repo.github_repo_id,
                "name": repo.name,
                "description": repo.description,
                "html_url": repo.html_url,
                "language": repo.language,
                "stargazers_count": repo.stargazers_count,
                "forks_count": repo.forks_count,
                "updated_at": repo.updated_at,
                "created_at": repo.created_at,
                "pushed_at": repo.pushed_at,
                "commit_count": repo.commit_count
            }
            for repo in user.repos
        ],
        "total_commits": latest_sync.total_commits or 0,
        "last_sync_time": latest_sync.sync_time.strftime("%Y-%m-%d %H:%M:%S")
    }


@router.get("/sync/status", summary="获取同步状态")
async def get_sync_status(db: AsyncSession = Depends(get_db)):
    """返回同步状态信息"""
    latest_sync = await db.execute(
        select(SyncStatus).order_by(SyncStatus.sync_time.desc()).limit(1)
    )
    latest_sync = latest_sync.scalars().first()

    next_sync_time = None
    if scheduler and scheduler.running:
        interval_job = scheduler.get_job("sync_interval")
        if interval_job:
            next_sync_time = interval_job.next_run_time.strftime("%Y-%m-%d %H:%M:%S")

    if not latest_sync:
        return {
            "status": "no_data",
            "message": "尚未执行过同步",
            "next_sync_time": next_sync_time
        }

    return {
        "status": latest_sync.status,
        "last_sync_time": latest_sync.sync_time.strftime("%Y-%m-%d %H:%M:%S"),
        "next_sync_time": next_sync_time,
        "message": latest_sync.message,
        "total_commits": latest_sync.total_commits
    }
