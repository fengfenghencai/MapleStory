"""
博客文章管理 API
仅通过 API Key 认证的后端接口，用于文章的增删改查
"""

import os
import re
import shutil
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from pydantic import BaseModel

from config import BLOG_API_KEY, BLOG_CONTENT_DIR, BLOG_IMAGES_DIR

router = APIRouter(prefix="/api/blog", tags=["博客管理"])


# ========== 数据模型 ==========

class ArticleMeta(BaseModel):
    """文章元数据"""
    slug: str
    title: str
    date: str
    description: str
    tags: List[str]
    cover: Optional[str] = None


class ArticleCreate(BaseModel):
    """创建文章请求"""
    slug: str
    title: str
    description: str
    tags: List[str]
    content: str
    cover: Optional[str] = None


class ArticleUpdate(BaseModel):
    """更新文章请求"""
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    content: Optional[str] = None
    cover: Optional[str] = None


class ArticleResponse(BaseModel):
    """文章响应"""
    slug: str
    title: str
    date: str
    description: str
    tags: List[str]
    content: str
    cover: Optional[str] = None


# ========== 工具函数 ==========

def verify_api_key(api_key: str = Header(..., alias="X-API-Key")):
    """验证 API Key"""
    if api_key != BLOG_API_KEY:
        raise HTTPException(status_code=401, detail="无效的 API Key")
    return api_key


def get_blog_dir() -> str:
    """获取博客内容目录的绝对路径"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    blog_dir = os.path.normpath(os.path.join(base_dir, BLOG_CONTENT_DIR))
    os.makedirs(blog_dir, exist_ok=True)
    return blog_dir


def get_images_dir() -> str:
    """获取博客图片目录的绝对路径"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.normpath(os.path.join(base_dir, BLOG_IMAGES_DIR))
    os.makedirs(images_dir, exist_ok=True)
    return images_dir


def slugify(text: str) -> str:
    """将文本转换为 URL 友好的 slug"""
    # 移除非字母数字字符（保留中文）
    text = re.sub(r'[^\w\s\u4e00-\u9fff-]', '', text)
    # 将空格替换为连字符
    text = re.sub(r'[\s]+', '-', text)
    # 转小写
    return text.lower().strip('-')


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """解析 Markdown frontmatter"""
    if not content.startswith('---'):
        return {}, content

    parts = content.split('---', 2)
    if len(parts) < 3:
        return {}, content

    frontmatter_str = parts[1].strip()
    body = parts[2].strip()

    # 简单解析 YAML frontmatter
    meta = {}
    current_key = None
    current_list = None

    for line in frontmatter_str.split('\n'):
        line = line.rstrip()
        if not line:
            continue

        # 检查是否是列表项
        if line.startswith('  - '):
            if current_list is not None:
                current_list.append(line[4:].strip())
            continue

        # 保存之前的列表
        if current_key and current_list is not None:
            meta[current_key] = current_list
            current_list = None

        # 解析键值对
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()

            if value == '':
                # 可能是列表的开始
                current_key = key
                current_list = []
            else:
                meta[key] = value
                current_key = None

    # 保存最后的列表
    if current_key and current_list is not None:
        meta[current_key] = current_list

    return meta, body


def create_frontmatter(meta: dict) -> str:
    """创建 Markdown frontmatter"""
    lines = ['---']

    for key, value in meta.items():
        if isinstance(value, list):
            lines.append(f'{key}:')
            for item in value:
                lines.append(f'  - {item}')
        else:
            lines.append(f'{key}: {value}')

    lines.append('---')
    lines.append('')

    return '\n'.join(lines)


# ========== API 路由 ==========

@router.get("/latest", response_model=List[ArticleMeta])
async def get_latest_articles(limit: int = 3):
    """获取最新文章（公开接口，无需认证）"""
    blog_dir = get_blog_dir()
    articles = []

    if not os.path.exists(blog_dir):
        return articles

    for filename in os.listdir(blog_dir):
        if not filename.endswith('.md'):
            continue

        filepath = os.path.join(blog_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        meta, _ = parse_frontmatter(content)
        slug = filename[:-3]

        articles.append(ArticleMeta(
            slug=slug,
            title=meta.get('title', slug),
            date=meta.get('date', ''),
            description=meta.get('description', ''),
            tags=meta.get('tags', []),
            cover=meta.get('cover')
        ))

    # 按日期降序排序，取前N篇
    articles.sort(key=lambda x: x.date, reverse=True)
    return articles[:limit]


@router.get("/articles", response_model=List[ArticleMeta])
async def list_articles(api_key: str = Header(..., alias="X-API-Key")):
    """获取所有文章列表"""
    verify_api_key(api_key)

    blog_dir = get_blog_dir()
    articles = []

    if not os.path.exists(blog_dir):
        return articles

    for filename in os.listdir(blog_dir):
        if not filename.endswith('.md'):
            continue

        filepath = os.path.join(blog_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        meta, _ = parse_frontmatter(content)
        slug = filename[:-3]  # 移除 .md 后缀

        articles.append(ArticleMeta(
            slug=slug,
            title=meta.get('title', slug),
            date=meta.get('date', ''),
            description=meta.get('description', ''),
            tags=meta.get('tags', []),
            cover=meta.get('cover')
        ))

    # 按日期降序排序
    articles.sort(key=lambda x: x.date, reverse=True)
    return articles


@router.get("/articles/{slug}", response_model=ArticleResponse)
async def get_article(slug: str, api_key: str = Header(..., alias="X-API-Key")):
    """获取单篇文章"""
    verify_api_key(api_key)

    blog_dir = get_blog_dir()
    filepath = os.path.join(blog_dir, f'{slug}.md')

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文章不存在")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    meta, body = parse_frontmatter(content)

    return ArticleResponse(
        slug=slug,
        title=meta.get('title', slug),
        date=meta.get('date', ''),
        description=meta.get('description', ''),
        tags=meta.get('tags', []),
        content=body,
        cover=meta.get('cover')
    )


@router.post("/articles", response_model=ArticleResponse)
async def create_article(article: ArticleCreate, api_key: str = Header(..., alias="X-API-Key")):
    """创建新文章"""
    verify_api_key(api_key)

    blog_dir = get_blog_dir()
    slug = slugify(article.slug)
    filepath = os.path.join(blog_dir, f'{slug}.md')

    if os.path.exists(filepath):
        raise HTTPException(status_code=400, detail="文章已存在，请使用不同的 slug")

    # 创建 frontmatter
    date = datetime.now().strftime('%Y-%m-%d')
    meta = {
        'title': article.title,
        'date': date,
        'description': article.description,
        'tags': article.tags,
    }
    if article.cover:
        meta['cover'] = article.cover

    # 组合文章内容
    frontmatter = create_frontmatter(meta)
    full_content = frontmatter + article.content

    # 写入文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(full_content)

    # 创建文章图片目录
    images_dir = get_images_dir()
    article_images_dir = os.path.join(images_dir, slug)
    os.makedirs(article_images_dir, exist_ok=True)

    return ArticleResponse(
        slug=slug,
        title=article.title,
        date=date,
        description=article.description,
        tags=article.tags,
        content=article.content,
        cover=article.cover
    )


@router.put("/articles/{slug}", response_model=ArticleResponse)
async def update_article(slug: str, article: ArticleUpdate, api_key: str = Header(..., alias="X-API-Key")):
    """更新文章"""
    verify_api_key(api_key)

    blog_dir = get_blog_dir()
    filepath = os.path.join(blog_dir, f'{slug}.md')

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文章不存在")

    # 读取现有文章
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    meta, body = parse_frontmatter(content)

    # 更新字段
    if article.title is not None:
        meta['title'] = article.title
    if article.description is not None:
        meta['description'] = article.description
    if article.tags is not None:
        meta['tags'] = article.tags
    if article.content is not None:
        body = article.content
    if article.cover is not None:
        meta['cover'] = article.cover

    # 组合文章内容
    frontmatter = create_frontmatter(meta)
    full_content = frontmatter + body

    # 写入文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(full_content)

    return ArticleResponse(
        slug=slug,
        title=meta.get('title', slug),
        date=meta.get('date', ''),
        description=meta.get('description', ''),
        tags=meta.get('tags', []),
        content=body,
        cover=meta.get('cover')
    )


@router.delete("/articles/{slug}")
async def delete_article(slug: str, api_key: str = Header(..., alias="X-API-Key")):
    """删除文章"""
    verify_api_key(api_key)

    blog_dir = get_blog_dir()
    filepath = os.path.join(blog_dir, f'{slug}.md')

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文章不存在")

    # 删除文章文件
    os.remove(filepath)

    # 删除文章图片目录（如果存在）
    images_dir = get_images_dir()
    article_images_dir = os.path.join(images_dir, slug)
    if os.path.exists(article_images_dir):
        shutil.rmtree(article_images_dir)

    return {"success": True, "message": f"文章 '{slug}' 已删除"}


@router.post("/articles/{slug}/images")
async def upload_image(
    slug: str,
    file: UploadFile = File(...),
    api_key: str = Header(..., alias="X-API-Key")
):
    """上传文章图片"""
    verify_api_key(api_key)

    # 验证文件类型
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="不支持的图片格式，仅支持 JPEG、PNG、GIF、WebP")

    # 确保图片目录存在
    images_dir = get_images_dir()
    article_images_dir = os.path.join(images_dir, slug)
    os.makedirs(article_images_dir, exist_ok=True)

    # 生成安全的文件名
    filename = file.filename
    if filename:
        # 移除不安全字符
        filename = re.sub(r'[^\w\.\-]', '_', filename)
    else:
        ext = file.content_type.split('/')[-1]
        filename = f"image_{datetime.now().strftime('%Y%m%d%H%M%S')}.{ext}"

    filepath = os.path.join(article_images_dir, filename)

    # 保存文件
    with open(filepath, 'wb') as f:
        content = await file.read()
        f.write(content)

    # 返回图片 URL
    image_url = f"/images/blog/{slug}/{filename}"

    return {
        "success": True,
        "filename": filename,
        "url": image_url,
        "markdown": f"![{filename}]({image_url})"
    }


@router.get("/articles/{slug}/images")
async def list_images(slug: str, api_key: str = Header(..., alias="X-API-Key")):
    """获取文章的所有图片"""
    verify_api_key(api_key)

    images_dir = get_images_dir()
    article_images_dir = os.path.join(images_dir, slug)

    if not os.path.exists(article_images_dir):
        return {"images": []}

    images = []
    for filename in os.listdir(article_images_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            images.append({
                "filename": filename,
                "url": f"/images/blog/{slug}/{filename}"
            })

    return {"images": images}


@router.delete("/articles/{slug}/images/{filename}")
async def delete_image(slug: str, filename: str, api_key: str = Header(..., alias="X-API-Key")):
    """删除文章图片"""
    verify_api_key(api_key)

    images_dir = get_images_dir()
    filepath = os.path.join(images_dir, slug, filename)

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="图片不存在")

    os.remove(filepath)

    return {"success": True, "message": f"图片 '{filename}' 已删除"}
