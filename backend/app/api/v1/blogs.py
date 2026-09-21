from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_db
from app.models.user import User
from app.models.blog import BlogConnection, BlogPost
from app.schemas.blog import (
    BlogConnectionCreate,
    BlogConnectionResponse,
    BlogPostCreate,
    BlogPostResponse
)
from app.api.deps import get_current_user
from app.services.integrations.wordpress import WordPressConnector
from app.services.integrations.webhook import WebhookConnector

router = APIRouter(prefix="/blogs", tags=["Blogs"])

@router.get("/connections", response_model=List[BlogConnectionResponse])
async def list_blog_connections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(BlogConnection).where(BlogConnection.workspace_id == current_user.workspace_id)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/connections", response_model=BlogConnectionResponse)
async def create_blog_connection(
    data: BlogConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify connection live before saving
    test_result = {"success": True}
    if data.cms_type == "wordpress":
        if not data.username or not data.auth_secret:
            raise HTTPException(status_code=400, detail="WordPress requires username and Application Password")
        wp = WordPressConnector(data.site_url, data.username, data.auth_secret)
        test_result = await wp.test_connection()
        if not test_result.get("success"):
            # We still allow saving if user wants to retry, but warn or return
            pass
    elif data.cms_type == "webhook":
        endpoint = data.api_endpoint or data.site_url
        wh = WebhookConnector(endpoint, data.auth_secret)
        test_result = await wh.test_connection()

    connection = BlogConnection(
        workspace_id=current_user.workspace_id,
        name=data.name,
        cms_type=data.cms_type,
        site_url=data.site_url,
        api_endpoint=data.api_endpoint or data.site_url,
        username=data.username,
        auth_secret=data.auth_secret,
        is_active=True,
        last_synced_at=datetime.utcnow() if test_result.get("success") else None
    )
    db.add(connection)
    await db.commit()
    await db.refresh(connection)
    return connection

@router.post("/connections/{connection_id}/test")
async def test_blog_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(BlogConnection).where(
        BlogConnection.id == connection_id,
        BlogConnection.workspace_id == current_user.workspace_id
    )
    res = await db.execute(stmt)
    conn = res.scalar_one_or_none()
    if not conn:
        raise HTTPException(status_code=404, detail="Blog connection not found")

    if conn.cms_type == "wordpress":
        wp = WordPressConnector(conn.site_url, conn.username or "", conn.auth_secret or "")
        result = await wp.test_connection()
    elif conn.cms_type == "webhook":
        wh = WebhookConnector(conn.api_endpoint or conn.site_url, conn.auth_secret)
        result = await wh.test_connection()
    else:
        result = {"success": True, "message": f"Connection {conn.cms_type} is active"}

    if result.get("success"):
        conn.last_synced_at = datetime.utcnow()
        await db.commit()

    return result

@router.delete("/connections/{connection_id}")
async def delete_blog_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(BlogConnection).where(
        BlogConnection.id == connection_id,
        BlogConnection.workspace_id == current_user.workspace_id
    )
    res = await db.execute(stmt)
    conn = res.scalar_one_or_none()
    if not conn:
        raise HTTPException(status_code=404, detail="Blog connection not found")

    await db.delete(conn)
    await db.commit()
    return {"message": "Blog connection removed"}

@router.get("/posts", response_model=List[BlogPostResponse])
async def list_blog_posts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(BlogPost).where(BlogPost.workspace_id == current_user.workspace_id).order_by(BlogPost.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/posts", response_model=BlogPostResponse)
async def create_blog_post(
    data: BlogPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    post = BlogPost(
        workspace_id=current_user.workspace_id,
        blog_connection_id=data.blog_connection_id,
        title=data.title,
        slug=data.slug,
        excerpt=data.excerpt,
        content=data.content,
        featured_image_url=data.featured_image_url,
        tags=data.tags,
        categories=data.categories,
        seo_keywords=data.seo_keywords,
        status="published" if data.publish_now else data.status,
        published_at=datetime.utcnow() if data.publish_now else None
    )

    # If publish_now is requested and blog_connection_id is set, trigger remote push!
    if data.publish_now and data.blog_connection_id:
        stmt = select(BlogConnection).where(
            BlogConnection.id == data.blog_connection_id,
            BlogConnection.workspace_id == current_user.workspace_id
        )
        res = await db.execute(stmt)
        conn = res.scalar_one_or_none()
        if conn:
            if conn.cms_type == "wordpress":
                wp = WordPressConnector(conn.site_url, conn.username or "", conn.auth_secret or "")
                wp_res = await wp.publish_post(
                    title=post.title,
                    content=post.content,
                    status="published",
                    excerpt=post.excerpt,
                    slug=post.slug,
                    tags=post.tags,
                    categories=post.categories,
                    featured_image_url=post.featured_image_url
                )
                if wp_res.get("success"):
                    post.remote_post_id = wp_res.get("remote_post_id")
                    post.remote_url = wp_res.get("remote_url")
            elif conn.cms_type == "webhook":
                wh = WebhookConnector(conn.api_endpoint or conn.site_url, conn.auth_secret)
                wh_res = await wh.publish_post(
                    title=post.title,
                    content=post.content,
                    status="published",
                    excerpt=post.excerpt,
                    slug=post.slug,
                    tags=post.tags,
                    categories=post.categories,
                    featured_image_url=post.featured_image_url
                )
                if wh_res.get("success"):
                    post.remote_post_id = wh_res.get("remote_post_id")
                    post.remote_url = wh_res.get("remote_url")

    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post

@router.post("/posts/{post_id}/publish", response_model=BlogPostResponse)
async def publish_existing_blog_post(
    post_id: int,
    connection_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(BlogPost).where(
        BlogPost.id == post_id,
        BlogPost.workspace_id == current_user.workspace_id
    )
    res = await db.execute(stmt)
    post = res.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    target_conn_id = connection_id or post.blog_connection_id
    if not target_conn_id:
        # Check if there is any connected blog in workspace
        conn_stmt = select(BlogConnection).where(BlogConnection.workspace_id == current_user.workspace_id)
        conn_res = await db.execute(conn_stmt)
        conn = conn_res.scalars().first()
    else:
        conn_stmt = select(BlogConnection).where(
            BlogConnection.id == target_conn_id,
            BlogConnection.workspace_id == current_user.workspace_id
        )
        conn_res = await db.execute(conn_stmt)
        conn = conn_res.scalar_one_or_none()

    if not conn:
        raise HTTPException(status_code=400, detail="No blog connection configured. Connect your WordPress or Webhook first.")

    if conn.cms_type == "wordpress":
        wp = WordPressConnector(conn.site_url, conn.username or "", conn.auth_secret or "")
        wp_res = await wp.publish_post(
            title=post.title,
            content=post.content,
            status="published",
            excerpt=post.excerpt,
            slug=post.slug,
            tags=post.tags,
            categories=post.categories,
            featured_image_url=post.featured_image_url
        )
        if not wp_res.get("success"):
            raise HTTPException(status_code=502, detail=wp_res.get("message", "Failed to publish to WordPress"))
        post.remote_post_id = wp_res.get("remote_post_id")
        post.remote_url = wp_res.get("remote_url")
    elif conn.cms_type == "webhook":
        wh = WebhookConnector(conn.api_endpoint or conn.site_url, conn.auth_secret)
        wh_res = await wh.publish_post(
            title=post.title,
            content=post.content,
            status="published",
            excerpt=post.excerpt,
            slug=post.slug,
            tags=post.tags,
            categories=post.categories,
            featured_image_url=post.featured_image_url
        )
        if not wh_res.get("success"):
            raise HTTPException(status_code=502, detail=wh_res.get("message", "Failed to dispatch webhook"))
        post.remote_post_id = wh_res.get("remote_post_id")
        post.remote_url = wh_res.get("remote_url")

    post.status = "published"
    post.published_at = datetime.utcnow()
    post.blog_connection_id = conn.id
    await db.commit()
    await db.refresh(post)
    return post
