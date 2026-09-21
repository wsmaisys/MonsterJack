from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class SocialPost(SQLModel, table=True):
    __tablename__ = "social_posts"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    social_connection_id: Optional[int] = Field(default=None, foreign_key="social_connections.id")
    platform: str = Field(index=True)  # "linkedin" | "twitter" | "instagram"
    
    content: str
    media_urls: Optional[str] = None  # Comma-separated media URLs
    
    # Optional link back to the originating blog post if repurposed
    source_blog_post_id: Optional[int] = Field(default=None, foreign_key="blog_posts.id")

    status: str = Field(default="draft", index=True)  # "draft" | "scheduled" | "published" | "failed"
    scheduled_for: Optional[datetime] = None
    published_at: Optional[datetime] = None
    remote_post_id: Optional[str] = None
    error_message: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
