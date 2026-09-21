from datetime import datetime
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, JSON, Column

class BlogConnection(SQLModel, table=True):
    __tablename__ = "blog_connections"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    name: str  # e.g., "My Tech Blog"
    cms_type: str = Field(index=True)  # "wordpress" | "webhook" | "ghost"
    site_url: str  # e.g., "https://myblog.com"
    api_endpoint: Optional[str] = None  # e.g., "https://myblog.com/wp-json/wp/v2" or custom webhook URL
    username: Optional[str] = None  # WordPress username
    auth_secret: Optional[str] = None  # WP Application Password or Webhook Secret Key
    is_active: bool = Field(default=True)
    last_synced_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BlogPost(SQLModel, table=True):
    __tablename__ = "blog_posts"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    blog_connection_id: Optional[int] = Field(default=None, foreign_key="blog_connections.id")
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: str  # Markdown or HTML body
    featured_image_url: Optional[str] = None
    tags: Optional[str] = None  # Comma-separated tags
    categories: Optional[str] = None  # Comma-separated categories
    seo_keywords: Optional[str] = None
    
    # Status: draft | scheduled | published | failed
    status: str = Field(default="draft", index=True)
    remote_post_id: Optional[str] = None  # Post ID on WordPress / remote CMS
    remote_url: Optional[str] = None  # Live URL on user's blog
    
    scheduled_for: Optional[datetime] = None
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
