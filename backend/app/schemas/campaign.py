from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class SubscriberCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class SubscriberResponse(BaseModel):
    id: int
    workspace_id: int
    email: str
    name: Optional[str]
    status: str
    created_at: datetime

class CampaignCreate(BaseModel):
    subject: str
    preview_text: Optional[str] = None
    content_html: str
    source_blog_post_id: Optional[int] = None
    send_now: bool = False

class CampaignResponse(BaseModel):
    id: int
    workspace_id: int
    subject: str
    preview_text: Optional[str]
    content_html: str
    status: str
    total_recipients: int
    sent_at: Optional[datetime]
    created_at: datetime
