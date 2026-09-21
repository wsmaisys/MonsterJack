import base64
import httpx
from typing import Dict, Any, Optional
from app.services.integrations.base import BaseBlogConnector

class WordPressConnector(BaseBlogConnector):
    """
    Integrates with WordPress sites via the WordPress REST API (/wp-json/wp/v2)
    using Application Passwords authentication.
    """

    def __init__(self, site_url: str, username: str, app_password: str):
        self.site_url = site_url.rstrip("/")
        self.api_base = f"{self.site_url}/wp-json/wp/v2"
        self.username = username
        self.app_password = app_password.strip()

    def _get_auth_headers(self) -> Dict[str, str]:
        # Application passwords in WordPress use HTTP Basic Auth
        token = base64.b64encode(f"{self.username}:{self.app_password}".encode()).decode()
        return {
            "Authorization": f"Basic {token}",
            "Content-Type": "application/json",
            "User-Agent": "RelayHub-Marketing-Hub/1.0"
        }

    async def test_connection(self) -> Dict[str, Any]:
        """Validates credentials by fetching the authenticated user's profile."""
        url = f"{self.api_base}/users/me"
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, headers=self._get_auth_headers())
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "message": f"Connected to WordPress as {data.get('name', self.username)}",
                        "user_id": data.get("id"),
                        "site_name": data.get("name")
                    }
                else:
                    return {
                        "success": False,
                        "message": f"WordPress returned status {response.status_code}: {response.text[:200]}"
                    }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Connection failed: {str(e)}"
                }

    async def publish_post(
        self,
        title: str,
        content: str,
        status: str = "draft",  # "publish", "draft", "future", "pending"
        excerpt: Optional[str] = None,
        slug: Optional[str] = None,
        tags: Optional[str] = None,
        categories: Optional[str] = None,
        featured_image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Creates or schedules a post on the WordPress website."""
        url = f"{self.api_base}/posts"
        wp_status = "publish" if status == "published" else "draft"

        payload: Dict[str, Any] = {
            "title": title,
            "content": content,
            "status": wp_status,
        }

        if excerpt:
            payload["excerpt"] = excerpt
        if slug:
            payload["slug"] = slug

        async with httpx.AsyncClient(timeout=25.0) as client:
            try:
                response = await client.post(url, json=payload, headers=self._get_auth_headers())
                if response.status_code in (200, 201):
                    post_data = response.json()
                    return {
                        "success": True,
                        "remote_post_id": str(post_data.get("id")),
                        "remote_url": post_data.get("link"),
                        "status": post_data.get("status"),
                        "title": post_data.get("title", {}).get("rendered", title)
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Failed to create post. Status {response.status_code}: {response.text[:300]}"
                    }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Request error when publishing to WordPress: {str(e)}"
                }
