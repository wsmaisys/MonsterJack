import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.schemas.auth import UserRegister, UserLogin, TokenResponse
from app.api.deps import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == data.email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    base_slug = data.workspace_name.lower().replace(" ", "-")[:24]
    stmt_slug = select(Workspace).where(Workspace.slug == base_slug)
    res_slug = await db.execute(stmt_slug)
    if res_slug.scalar_one_or_none():
        slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
    else:
        slug = base_slug
    workspace = Workspace(name=data.workspace_name, slug=slug)
    db.add(workspace)
    await db.commit()
    await db.refresh(workspace)

    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=get_password_hash(data.password),
        workspace_id=workspace.id
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email, "workspace_id": workspace.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "workspace_id": workspace.id
    }

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == data.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "email": user.email, "workspace_id": user.workspace_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "workspace_id": user.workspace_id
    }

@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "workspace_id": current_user.workspace_id
    }
