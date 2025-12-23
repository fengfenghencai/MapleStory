"""
Personal Website Backend
基于 FastAPI 构建的后端服务
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# 导入 GitHub 模块
from github import router as github_router, startup_event, shutdown_event
# 导入博客管理模块
from blog import router as blog_router
# 导入生活模块
from life import router as life_router


# 生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    await startup_event()
    yield
    # 关闭时执行
    await shutdown_event()


# 创建 FastAPI 应用
app = FastAPI(
    title="Personal Website API",
    description="个人网站后端 API 服务",
    version="1.0.0",
    lifespan=lifespan,
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://yourdomain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册 GitHub 路由
app.include_router(github_router)
# 注册博客管理路由
app.include_router(blog_router)
# 注册生活模块路由
app.include_router(life_router)


# ========== 数据模型 ==========

class ContactMessage(BaseModel):
    """联系表单消息模型"""
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactResponse(BaseModel):
    """联系表单响应模型"""
    success: bool
    message: str


# ========== API 路由 ==========

@app.get("/")
async def root():
    """根路由"""
    return {
        "message": "Welcome to Personal Website API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
    }


# ========== 联系表单 ==========

@app.post("/api/contact", response_model=ContactResponse)
async def submit_contact(message: ContactMessage):
    """
    提交联系表单

    实际项目中可以：
    - 发送邮件通知
    - 存储到数据库
    - 发送到 Slack/Discord
    """
    print(f"收到联系消息: {message.name} <{message.email}>")
    print(f"主题: {message.subject}")
    print(f"内容: {message.message}")

    return ContactResponse(
        success=True,
        message="消息已发送成功！我会尽快回复您。"
    )


# ========== 启动配置 ==========

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # 禁用热重载，避免调度器重复启动
        workers=1,
    )
