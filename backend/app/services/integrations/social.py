import httpx
from typing import Dict, Any, Optional, List
from app.services.integrations.base import BaseSocialConnector

class LinkedInConnector(BaseSocialConnector):
    """
    LinkedIn Share API connector (v2 / ugcPosts / rest/posts).
    """

    def __init__(self, access_token: str, author_urn: Optional[str] = None):
        self.access_token = access_token
        self.author_urn = author_urn or "urn:li:person:me"

    async def publish(self, content: str, media_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        """Publishes a text or link post to LinkedIn."""
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        # UGC Post payload structure
        payload = {
            "author": self.author_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": content
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }

        # Simulated response if running in dev mode or with placeholder token
        if self.access_token.startswith("demo_") or self.access_token == "placeholder":
            return {
                "success": True,
                "remote_post_id": "urn:li:share:demo-123456789",
                "message": "Demo: Post simulated for LinkedIn successfully"
            }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.post(
                    "https://api.linkedin.com/v2/ugcPosts",
                    json=payload,
                    headers=headers
                )
                if response.status_code in (200, 201):
                    return {
                        "success": True,
                        "remote_post_id": response.json().get("id"),
                        "message": "Post published to LinkedIn"
                    }
                else:
                    return {
                        "success": False,
                        "message": f"LinkedIn error ({response.status_code}): {response.text[:200]}"
                    }
            except Exception as e:
                return {"success": False, "message": f"LinkedIn connection error: {str(e)}"}


class TwitterConnector(BaseSocialConnector):
    """
    X / Twitter v2 API connector (/2/tweets).
    """

    def __init__(self, access_token: str):
        self.access_token = access_token

    async def publish(self, content: str, media_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        payload = {"text": content[:280]}

        if self.access_token.startswith("demo_") or self.access_token == "placeholder":
            return {
                "success": True,
                "remote_post_id": "twitter_demo_987654321",
                "message": "Demo: Post simulated for X / Twitter"
            }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.post(
                    "https://api.twitter.com/2/tweets",
                    json=payload,
                    headers=headers
                )
                if response.status_code in (200, 201):
                    return {
                        "success": True,
                        "remote_post_id": response.json().get("data", {}).get("id"),
                        "message": "Post published to X"
                    }
                else:
                    return {
                        "success": False,
                        "message": f"X error ({response.status_code}): {response.text[:200]}"
                    }
            except Exception as e:
                return {"success": False, "message": f"X connection error: {str(e)}"}
