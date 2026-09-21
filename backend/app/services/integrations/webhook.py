import hmac
import hashlib
import json
import httpx
from datetime import datetime
from typing import Dict, Any, Optional
from app.services.integrations.base import BaseBlogConnector

class WebhookConnector(BaseBlogConnector):
    """
    Integrates with custom CMS, static site generators (Next.js ISR, Astro),
    or headless backends by sending signed JSON payloads over HTTP POST.
    """

    def __init__(self, endpoint_url: str, secret_key: Optional[str] = None):
        self.endpoint_url = endpoint_url
        self.secret_key = secret_key

    def _sign_payload(self, body: str) -> str:
        if not self.secret_key:
            return ""
        return hmac.new(
            self.secret_key.encode("utf-8"),
            body.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    async def test_connection(self) -> Dict[str, Any]:
        """Pings the webhook endpoint with a test ping event."""
        payload = {
            "event": "ping",
            "timestamp": datetime.utcnow().isoformat(),
            "source": "MonsterJack"
        }
        body = json.dumps(payload)
        headers = {
            "Content-Type": "application/json",
            "X-MonsterJack-Event": "ping",
            "X-MonsterJack-Signature": self._sign_payload(body)
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(self.endpoint_url, content=body, headers=headers)
                if response.status_code in (200, 201, 204):
                    return {
                        "success": True,
                        "message": f"Webhook endpoint responded with status {response.status_code}"
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Webhook returned status {response.status_code}: {response.text[:200]}"
                    }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Webhook ping failed: {str(e)}"
                }

    async def publish_post(
        self,
        title: str,
        content: str,
        status: str = "draft",
        excerpt: Optional[str] = None,
        slug: Optional[str] = None,
        tags: Optional[str] = None,
        categories: Optional[str] = None,
        featured_image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Dispatches the post payload to the custom CMS or webhook receiver."""
        payload = {
            "event": "blog_post.published" if status == "published" else "blog_post.drafted",
            "timestamp": datetime.utcnow().isoformat(),
            "post": {
                "title": title,
                "slug": slug,
                "excerpt": excerpt,
                "content": content,
                "status": status,
                "tags": [t.strip() for t in tags.split(",")] if tags else [],
                "categories": [c.strip() for c in categories.split(",")] if categories else [],
                "featured_image_url": featured_image_url
            }
        }
        body = json.dumps(payload)
        headers = {
            "Content-Type": "application/json",
            "X-MonsterJack-Event": payload["event"],
            "X-MonsterJack-Signature": self._sign_payload(body)
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.post(self.endpoint_url, content=body, headers=headers)
                if response.status_code in (200, 201, 202, 204):
                    data = {}
                    try:
                        data = response.json()
                    except Exception:
                        pass
                    return {
                        "success": True,
                        "remote_post_id": str(data.get("id", "webhook-dispatched")),
                        "remote_url": data.get("url", self.endpoint_url),
                        "status": status,
                        "message": "Payload successfully received by custom CMS"
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Webhook endpoint rejected payload. Status: {response.status_code}"
                    }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Error dispatching to webhook: {str(e)}"
                }
