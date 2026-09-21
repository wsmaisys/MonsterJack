from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class BlogConnectionCreate(BaseModel):
    name: str
    cms_type: str  # "wordpress" | "webhook" | "ghost"
    site_url: str
    api_endpoint: Optional[str] = None
    username: Optional[str] = None
    auth_secret: Optional[str] = None

class BlogConnectionResponse(BaseModel):
    id: int
    workspace_id: int
    name: str
    cms_type: str
    site_url: str
    api_endpoint: Optional[str] = None
    username: Optional[str] = None
    is_active: bool
    last_synced_at: Optional[datetime] = None
    created_at: datetime

class BlogPostCreate(BaseModel):
    blog_connection_id: Optional[int] = None
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: str
    featured_image_url: Optional[str] = None
    tags: Optional[str] = None
    categories: Optional[str] = None
    seo_keywords: Optional[str] = None
    status: str = "draft"  # "draft" | "published" | "scheduled"
    publish_now: bool = False

class BlogPostResponse(BaseModel):
    id: int
    workspace_id: int
    blog_connection_id: Optional[int]
    title: str
    slug: Optional[str]
    excerpt: Optional[str]
    content: str
    featured_image_url: Optional[str]
    tags: Optional[str]
    categories: Optional[str]
    seo_keywords: Optional[str]
    status: str
    remote_post_id: Optional[str]
    remote_url: Optional[str]
    created_at: datetime
    published_at: Optional[datetime]
