from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SocialPostCreate(BaseModel):
    social_connection_id: Optional[int] = None
    platform: str  # "linkedin" | "twitter" | "instagram"
    content: str
    media_urls: Optional[str] = None
    source_blog_post_id: Optional[int] = None
    scheduled_for: Optional[datetime] = None
    publish_now: bool = False

class SocialPostResponse(BaseModel):
    id: int
    workspace_id: int
    social_connection_id: Optional[int]
    platform: str
    content: str
    media_urls: Optional[str]
    source_blog_post_id: Optional[int]
    status: str
    scheduled_for: Optional[datetime]
    published_at: Optional[datetime]
    remote_post_id: Optional[str]
    created_at: datetime
