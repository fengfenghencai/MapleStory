"""
Personal Website Backend
基于 FastAPI 构建的后端服务
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import httpx

# 创建 FastAPI 应用
app = FastAPI(
    title="Personal Website API",
    description="个人网站后端 API 服务",
    version="1.0.0",
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


class GitHubRepo(BaseModel):
    """GitHub 仓库模型"""
    name: str
    description: Optional[str]
    html_url: str
    stargazers_count: int
    forks_count: int
    language: Optional[str]
    topics: list[str]
    updated_at: str


class CSDNArticle(BaseModel):
    """CSDN 文章模型"""
    title: str
    url: str
    description: Optional[str]
    created_at: str
    view_count: int


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
    # TODO: 实现实际的消息处理逻辑
    # 例如发送邮件或存储到数据库

    print(f"收到联系消息: {message.name} <{message.email}>")
    print(f"主题: {message.subject}")
    print(f"内容: {message.message}")

    return ContactResponse(
        success=True,
        message="消息已发送成功！我会尽快回复您。"
    )


# ========== GitHub API 集成 ==========

GITHUB_API_BASE = "https://api.github.com"
GITHUB_USERNAME = "your-username"  # 替换为你的 GitHub 用户名


@app.get("/api/github/repos", response_model=list[GitHubRepo])
async def get_github_repos(
    limit: int = Query(default=10, ge=1, le=100),
    sort: str = Query(default="updated", enum=["updated", "stars", "name"]),
):
    """
    获取 GitHub 仓库列表

    Args:
        limit: 返回数量限制
        sort: 排序方式
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{GITHUB_API_BASE}/users/{GITHUB_USERNAME}/repos",
                params={
                    "per_page": limit,
                    "sort": "updated" if sort == "updated" else "full_name",
                },
                headers={
                    "Accept": "application/vnd.github.v3+json",
                    # 如果有 token，可以添加：
                    # "Authorization": f"token {GITHUB_TOKEN}"
                },
            )
            response.raise_for_status()

            repos = response.json()

            # 如果按 stars 排序
            if sort == "stars":
                repos = sorted(repos, key=lambda x: x.get("stargazers_count", 0), reverse=True)

            return [
                GitHubRepo(
                    name=repo["name"],
                    description=repo.get("description"),
                    html_url=repo["html_url"],
                    stargazers_count=repo.get("stargazers_count", 0),
                    forks_count=repo.get("forks_count", 0),
                    language=repo.get("language"),
                    topics=repo.get("topics", []),
                    updated_at=repo.get("updated_at", ""),
                )
                for repo in repos[:limit]
            ]

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"GitHub API 请求失败: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"获取仓库列表失败: {str(e)}"
            )


@app.get("/api/github/user")
async def get_github_user():
    """获取 GitHub 用户信息"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{GITHUB_API_BASE}/users/{GITHUB_USERNAME}",
                headers={"Accept": "application/vnd.github.v3+json"},
            )
            response.raise_for_status()

            user = response.json()
            return {
                "login": user["login"],
                "name": user.get("name"),
                "avatar_url": user["avatar_url"],
                "bio": user.get("bio"),
                "public_repos": user["public_repos"],
                "followers": user["followers"],
                "following": user["following"],
                "html_url": user["html_url"],
            }

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"GitHub API 请求失败: {str(e)}"
            )


# ========== CSDN API 集成（示例）==========

# 注意：CSDN 没有官方公开 API，以下为示例结构
# 实际使用时可能需要通过爬虫或其他方式获取数据

@app.get("/api/csdn/articles", response_model=list[CSDNArticle])
async def get_csdn_articles(limit: int = Query(default=10, ge=1, le=50)):
    """
    获取 CSDN 文章列表（示例数据）

    注意：CSDN 没有官方公开 API
    实际项目中需要：
    1. 使用 CSDN 开放平台 API（如果有）
    2. 或者自行爬取数据
    3. 或者手动维护文章列表
    """
    # 示例数据
    sample_articles = [
        CSDNArticle(
            title="深入理解 Python 异步编程",
            url="https://blog.csdn.net/username/article/details/123456",
            description="本文深入探讨 Python 的异步编程模型，包括 asyncio、协程等核心概念。",
            created_at="2024-01-20",
            view_count=1520,
        ),
        CSDNArticle(
            title="Docker 容器化最佳实践",
            url="https://blog.csdn.net/username/article/details/123457",
            description="分享 Docker 容器化部署的最佳实践和常见问题解决方案。",
            created_at="2024-01-15",
            view_count=2340,
        ),
        CSDNArticle(
            title="FastAPI 快速入门教程",
            url="https://blog.csdn.net/username/article/details/123458",
            description="手把手教你使用 FastAPI 构建高性能 API 服务。",
            created_at="2024-01-10",
            view_count=3100,
        ),
    ]

    return sample_articles[:limit]


# ========== 启动配置 ==========

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
