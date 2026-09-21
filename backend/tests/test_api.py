import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import init_db

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

import uuid

@pytest.mark.asyncio
async def test_auth_and_blog_flow():
    await init_db()
    test_email = f"test_{uuid.uuid4().hex[:6]}@monsterjackdemo.com"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register
        reg_res = await ac.post("/api/v1/auth/register", json={
            "email": test_email,
            "password": "securepassword123",
            "full_name": "Sarah Connor",
            "workspace_name": f"Sarah Media {uuid.uuid4().hex[:4]}"
        })
        assert reg_res.status_code == 200
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Add Blog Connection (WordPress demo)
        blog_conn = await ac.post("/api/v1/blogs/connections", json={
            "name": "Sarah Tech Blog",
            "cms_type": "wordpress",
            "site_url": "https://sarahtech.example.com",
            "username": "sarah_admin",
            "auth_secret": "abcd efgh ijkl mnop"
        }, headers=headers)
        assert blog_conn.status_code == 200
        conn_id = blog_conn.json()["id"]

        # 3. Create Blog Post
        post_res = await ac.post("/api/v1/blogs/posts", json={
            "blog_connection_id": conn_id,
            "title": "Scaling Content Distribution with AI",
            "content": "Full article body markdown...",
            "excerpt": "How to scale distribution.",
            "tags": "AI, Marketing, SaaS",
            "publish_now": False
        }, headers=headers)
        assert post_res.status_code == 200
        assert post_res.json()["title"] == "Scaling Content Distribution with AI"
        assert post_res.json()["status"] == "draft"

        # 4. AI Content Repurposing
        rep_res = await ac.post("/api/v1/ai/repurpose", json={
            "blog_title": "Scaling Content Distribution with AI",
            "blog_content": "Full article body markdown...",
            "blog_url": "https://sarahtech.example.com/scaling-content"
        }, headers=headers)
        assert rep_res.status_code == 200
        data = rep_res.json()
        assert "linkedin" in data
        assert "twitter" in data
        assert "email_subject" in data
