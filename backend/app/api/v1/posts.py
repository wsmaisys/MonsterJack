from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_db
from app.models.user import User
from app.models.post import SocialPost
from app.schemas.post import SocialPostCreate, SocialPostResponse
from app.api.deps import get_current_user
from app.services.integrations.social import LinkedInConnector, TwitterConnector

router = APIRouter(prefix="/posts", tags=["Social Posts"])

@router.get("", response_model=List[SocialPostResponse])
async def list_posts(
    platform: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SocialPost).where(SocialPost.workspace_id == current_user.workspace_id)
    if platform:
        stmt = stmt.where(SocialPost.platform == platform)
    if status:
        stmt = stmt.where(SocialPost.status == status)
    stmt = stmt.order_by(SocialPost.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=SocialPostResponse)
async def create_post(
    data: SocialPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    post = SocialPost(
        workspace_id=current_user.workspace_id,
        social_connection_id=data.social_connection_id,
        platform=data.platform,
        content=data.content,
        media_urls=data.media_urls,
        source_blog_post_id=data.source_blog_post_id,
        scheduled_for=data.scheduled_for,
        status="published" if data.publish_now else ("scheduled" if data.scheduled_for else "draft"),
        published_at=datetime.utcnow() if data.publish_now else None
    )

    if data.publish_now:
        if data.platform == "linkedin":
            client = LinkedInConnector(access_token="demo_token")
            res = await client.publish(post.content)
            if res.get("success"):
                post.remote_post_id = res.get("remote_post_id")
        elif data.platform in ("twitter", "x"):
            client = TwitterConnector(access_token="demo_token")
            res = await client.publish(post.content)
            if res.get("success"):
                post.remote_post_id = res.get("remote_post_id")

    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post

@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SocialPost).where(
        SocialPost.id == post_id,
        SocialPost.workspace_id == current_user.workspace_id
    )
    res = await db.execute(stmt)
    post = res.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(post)
    await db.commit()
    return {"message": "Post deleted"}
