from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.api.deps import get_current_user

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

@router.get("/current")
async def get_current_workspace(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workspace).where(Workspace.id == current_user.workspace_id)
    res = await db.execute(stmt)
    ws = res.scalar_one_or_none()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws
