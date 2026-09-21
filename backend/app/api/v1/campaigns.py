from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_db
from app.models.user import User
from app.models.campaign import EmailSubscriber, EmailCampaign
from app.schemas.campaign import (
    SubscriberCreate,
    SubscriberResponse,
    CampaignCreate,
    CampaignResponse
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/campaigns", tags=["Email Campaigns"])

@router.get("/subscribers", response_model=List[SubscriberResponse])
async def list_subscribers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(EmailSubscriber).where(EmailSubscriber.workspace_id == current_user.workspace_id)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/subscribers", response_model=SubscriberResponse)
async def add_subscriber(
    data: SubscriberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    sub = EmailSubscriber(
        workspace_id=current_user.workspace_id,
        email=data.email,
        name=data.name,
        status="active"
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub

@router.get("", response_model=List[CampaignResponse])
async def list_campaigns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(EmailCampaign).where(EmailCampaign.workspace_id == current_user.workspace_id).order_by(EmailCampaign.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=CampaignResponse)
async def create_campaign(
    data: CampaignCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Count subscribers
    sub_stmt = select(EmailSubscriber).where(
        EmailSubscriber.workspace_id == current_user.workspace_id,
        EmailSubscriber.status == "active"
    )
    sub_res = await db.execute(sub_stmt)
    subscribers = sub_res.scalars().all()
    count = len(subscribers)

    campaign = EmailCampaign(
        workspace_id=current_user.workspace_id,
        source_blog_post_id=data.source_blog_post_id,
        subject=data.subject,
        preview_text=data.preview_text,
        content_html=data.content_html,
        status="sent" if data.send_now else "draft",
        total_recipients=count if data.send_now else 0,
        sent_at=datetime.utcnow() if data.send_now else None
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return campaign
