from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class SocialConnection(SQLModel, table=True):
    __tablename__ = "social_connections"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    platform: str = Field(index=True)  # "linkedin" | "twitter" | "instagram"
    account_name: str
    account_id: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
