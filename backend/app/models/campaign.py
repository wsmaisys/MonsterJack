from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class EmailSubscriber(SQLModel, table=True):
    __tablename__ = "email_subscribers"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    email: str = Field(index=True)
    name: Optional[str] = None
    status: str = Field(default="active")  # "active" | "unsubscribed" | "bounced"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EmailCampaign(SQLModel, table=True):
    __tablename__ = "email_campaigns"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    source_blog_post_id: Optional[int] = Field(default=None, foreign_key="blog_posts.id")
    
    subject: str
    preview_text: Optional[str] = None
    content_html: str
    status: str = Field(default="draft")  # "draft" | "scheduled" | "sent" | "failed"
    
    scheduled_for: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    total_recipients: int = Field(default=0)
    open_count: int = Field(default=0)
    click_count: int = Field(default=0)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
