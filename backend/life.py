"""
生活照片管理 API
支持照片的增删改查，以及多图上传
"""

import os
import re
import shutil
import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update

from config import LIFE_API_KEY, LIFE_IMAGES_DIR
from db import get_db, LifePhoto, LifePhotoImage

router = APIRouter(prefix="/api/life", tags=["生活管理"])


# ========== 数据模型 ==========

class PhotoImage(BaseModel):
    """照片图片"""
    id: int
    url: str
    is_cover: bool
    order: int


class PhotoCreate(BaseModel):
    """创建照片请求"""
    title: str
    description: Optional[str] = None
    content: Optional[str] = None  # 详细内容
    date: Optional[str] = None  # 日期，格式：YYYY-MM-DD


class PhotoUpdate(BaseModel):
    """更新照片请求"""
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    date: Optional[str] = None


class PhotoResponse(BaseModel):
    """照片响应"""
    id: int
    title: str
    description: Optional[str]
    content: Optional[str]
    date: str
    images: List[PhotoImage]
    created_at: str
    updated_at: str


class PhotoListItem(BaseModel):
    """照片列表项"""
    id: int
    title: str
    description: Optional[str]
    date: str
    cover_image: Optional[str]


# ========== 工具函数 ==========

def verify_api_key(api_key: str = Header(..., alias="X-API-Key")):
    """验证 API Key"""
    if api_key != LIFE_API_KEY:
        raise HTTPException(status_code=401, detail="无效的 API Key")
    return api_key


def get_images_dir() -> str:
    """获取生活照片目录的绝对路径"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.normpath(os.path.join(base_dir, LIFE_IMAGES_DIR))
    os.makedirs(images_dir, exist_ok=True)
    return images_dir


# ========== API 路由 ==========

@router.get("/photos", response_model=List[PhotoListItem])
async def list_photos(db: AsyncSession = Depends(get_db)):
    """获取所有照片列表（公开接口，无需认证）"""
    result = await db.execute(
        select(LifePhoto).order_by(LifePhoto.date.desc())
    )
    photos = result.scalars().all()

    items = []
    for photo in photos:
        # 获取封面图片
        img_result = await db.execute(
            select(LifePhotoImage)
            .where(LifePhotoImage.photo_id == photo.id)
            .where(LifePhotoImage.is_cover == 1)
        )
        cover_img = img_result.scalar_one_or_none()

        items.append(PhotoListItem(
            id=photo.id,
            title=photo.title,
            description=photo.description,
            date=photo.date,
            cover_image=cover_img.url if cover_img else None
        ))

    return items


@router.get("/photos/{photo_id}", response_model=PhotoResponse)
async def get_photo(photo_id: int, db: AsyncSession = Depends(get_db)):
    """获取单张照片详情（公开接口，无需认证）"""
    result = await db.execute(
        select(LifePhoto).where(LifePhoto.id == photo_id)
    )
    photo = result.scalar_one_or_none()

    if not photo:
        raise HTTPException(status_code=404, detail="照片不存在")

    # 获取所有图片
    img_result = await db.execute(
        select(LifePhotoImage)
        .where(LifePhotoImage.photo_id == photo_id)
        .order_by(LifePhotoImage.order)
    )
    images = img_result.scalars().all()

    return PhotoResponse(
        id=photo.id,
        title=photo.title,
        description=photo.description,
        content=photo.content,
        date=photo.date,
        images=[PhotoImage(
            id=img.id,
            url=img.url,
            is_cover=bool(img.is_cover),
            order=img.order
        ) for img in images],
        created_at=photo.created_at.isoformat() if photo.created_at else "",
        updated_at=photo.updated_at.isoformat() if photo.updated_at else ""
    )


# ========== 管理接口（需要认证） ==========

@router.get("/admin/photos", response_model=List[PhotoListItem])
async def admin_list_photos(
    api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db)
):
    """获取所有照片列表（管理接口）"""
    verify_api_key(api_key)
    return await list_photos(db)


@router.post("/admin/photos", response_model=PhotoResponse)
async def create_photo(
    photo: PhotoCreate,
    api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db)
):
    """创建新照片"""
    verify_api_key(api_key)

    # 设置日期
    date = photo.date or datetime.now().strftime('%Y-%m-%d')

    # 创建照片记录
    new_photo = LifePhoto(
        title=photo.title,
        description=photo.description,
        content=photo.content,
        date=date
    )
    db.add(new_photo)
    await db.commit()
    await db.refresh(new_photo)

    # 创建照片目录
    images_dir = get_images_dir()
    photo_dir = os.path.join(images_dir, str(new_photo.id))
    os.makedirs(photo_dir, exist_ok=True)

    return PhotoResponse(
        id=new_photo.id,
        title=new_photo.title,
        description=new_photo.description,
        content=new_photo.content,
        date=new_photo.date,
        images=[],
        created_at=new_photo.created_at.isoformat() if new_photo.created_at else "",
        updated_at=new_photo.updated_at.isoformat() if new_photo.updated_at else ""
    )


@router.put("/admin/photos/{photo_id}", response_model=PhotoResponse)
async def update_photo(
    photo_id: int,
    photo: PhotoUpdate,
    api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db)
):
    """更新照片"""
    verify_api_key(api_key)

    result = await db.execute(
        select(LifePhoto).where(LifePhoto.id == photo_id)
    )
    existing_photo = result.scalar_one_or_none()

    if not existing_photo:
        raise HTTPException(status_code=404, detail="照片不存在")

    # 更新字段
    if photo.title is not None:
        existing_photo.title = photo.title
    if photo.description is not None:
        existing_photo.description = photo.description
    if photo.content is not None:
        existing_photo.content = photo.content
    if photo.date is not None:
        existing_photo.date = photo.date

    existing_photo.updated_at = datetime.now()
    await db.commit()
    await db.refresh(existing_photo)  # 刷新对象，避免 MissingGreenlet 错误

    # 获取所有图片
    img_result = await db.execute(
        select(LifePhotoImage)
        .where(LifePhotoImage.photo_id == photo_id)
        .order_by(LifePhotoImage.order)
    )
    images = img_result.scalars().all()

    return PhotoResponse(
        id=existing_photo.id,
        title=existing_photo.title,
        description=existing_photo.description,
        content=existing_photo.content,
        date=existing_photo.date,
        images=[PhotoImage(
            id=img.id,
            url=img.url,
            is_cover=bool(img.is_cover),
            order=img.order
        ) for img in images],
        created_at=existing_photo.created_at.isoformat() if existing_photo.created_at else "",
        updated_at=existing_photo.updated_at.isoformat() if existing_photo.updated_at else ""
    )


@router.delete("/admin/photos/{photo_id}")
async def delete_photo(
    photo_id: int,
    api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db)
):
    """删除照片"""
    verify_api_key(api_key)

    result = await db.execute(
        select(LifePhoto).where(LifePhoto.id == photo_id)
    )
    photo = result.scalar_one_or_none()

    if not photo:
        raise HTTPException(status_code=404, detail="照片不存在")

    # 删除照片目录
    images_dir = get_images_dir()
    photo_dir = os.path.join(images_dir, str(photo_id))
    if os.path.exists(photo_dir):
        shutil.rmtree(photo_dir)

    # 删除相关图片记录
    await db.execute(
        delete(LifePhotoImage).where(LifePhotoImage.photo_id == photo_id)
    )

    # 删除照片记录
    await db.delete(photo)
    await db.commit()

    return {"success": True, "message": f"照片 '{photo.title}' 已删除"}


@router.post("/admin/photos/{photo_id}/images")
async def upload_image(
    photo_id: int,
    file: UploadFile = File(...),
    is_cover: bool = Form(False),
    api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db)
):
    """上传照片图片"""
    verify_api_key(api_key)

    # 验证照片存在
    result = await db.execute(
        select(LifePhoto).where(LifePhoto.id == photo_id)
    )
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="照片不存在")

    # 验证文件类型
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="不支持的图片格式，仅支持 JPEG、PNG、GIF、WebP")

    # 确保图片目录存在
    images_dir = get_images_dir()
    photo_dir = os.path.join(images_dir, str(photo_id))
    os.makedirs(photo_dir, exist_ok=True)

    # 生成安全的文件名（添加时间戳避免重复）
    original_filename = file.filename
    if original_filename:
        # 添加时间戳避免文件名冲突
        name, ext = os.path.splitext(original_filename)
        name = re.sub(r'[^\w\.\-]', '_', name)
        filename = f"{name}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}{ext}"
    else:
        ext = '.' + file.content_type.split('/')[-1]
        filename = f"image_{datetime.now().strftime('%Y%m%d%H%M%S%f')}{ext}"

    filepath = os.path.join(photo_dir, filename)

    # 读取文件内容
    content = await file.read()

    # 保存文件
    try:
        with open(filepath, 'wb') as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")

    try:
        # 获取当前最大 order - 使用 scalars().first() 避免多结果问题
        img_result = await db.execute(
            select(LifePhotoImage)
            .where(LifePhotoImage.photo_id == photo_id)
            .order_by(LifePhotoImage.order.desc())
            .limit(1)
        )
        last_img = img_result.scalars().first()
        next_order = (last_img.order + 1) if last_img else 0

        # 如果是封面图片，取消其他图片的封面状态
        if is_cover:
            await db.execute(
                update(LifePhotoImage)
                .where(LifePhotoImage.photo_id == photo_id)
                .values(is_cover=0)
            )
            await db.flush()
        # 如果是第一张图片，自动设为封面
        elif next_order == 0:
            is_cover = True

        # 创建图片记录
        image_url = f"/images/life/{photo_id}/{filename}"
        new_image = LifePhotoImage(
            photo_id=photo_id,
            url=image_url,
            filename=filename,
            is_cover=1 if is_cover else 0,
            order=next_order
        )
        db.add(new_image)
        await db.flush()
        await db.commit()
        await db.refresh(new_image)

        return {
            "success": True,
            "id": new_image.id,
            "filename": filename,
            "url": image_url,
            "is_cover": is_cover
        }
    except Exception as e:
        # 数据库操作失败，删除已保存的文件
        if os.path.exists(filepath):
            os.remove(filepath)
        try:
            await db.rollback()
        except Exception:
            pass
        import traceback
        print(f"图片上传数据库错误: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"数据库操作失败: {str(e)}")


@router.delete("/admin/photos/{photo_id}/images/{image_id}")
async def delete_image(
    photo_id: int,
    image_id: int,
    api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db)
):
    """删除照片图片"""
    verify_api_key(api_key)

    result = await db.execute(
        select(LifePhotoImage)
        .where(LifePhotoImage.id == image_id)
        .where(LifePhotoImage.photo_id == photo_id)
    )
    image = result.scalar_one_or_none()

    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")

    # 删除文件
    images_dir = get_images_dir()
    filepath = os.path.join(images_dir, str(photo_id), image.filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    was_cover = image.is_cover

    # 删除记录
    await db.delete(image)
    await db.commit()

    # 如果删除的是封面，将第一张图片设为封面
    if was_cover:
        img_result = await db.execute(
            select(LifePhotoImage)
            .where(LifePhotoImage.photo_id == photo_id)
            .order_by(LifePhotoImage.order)
        )
        first_img = img_result.scalar_one_or_none()
        if first_img:
            first_img.is_cover = 1
            await db.commit()

    return {"success": True, "message": "图片已删除"}


@router.put("/admin/photos/{photo_id}/images/{image_id}/cover")
async def set_cover_image(
    photo_id: int,
    image_id: int,
    api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db)
):
    """设置封面图片"""
    verify_api_key(api_key)

    result = await db.execute(
        select(LifePhotoImage)
        .where(LifePhotoImage.id == image_id)
        .where(LifePhotoImage.photo_id == photo_id)
    )
    image = result.scalar_one_or_none()

    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")

    # 取消其他图片的封面状态
    await db.execute(
        update(LifePhotoImage)
        .where(LifePhotoImage.photo_id == photo_id)
        .values(is_cover=0)
    )

    # 设置当前图片为封面
    image.is_cover = 1
    await db.commit()

    return {"success": True, "message": "封面已设置"}
