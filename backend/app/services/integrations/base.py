from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseBlogConnector(ABC):
    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """Verify credentials and connectivity."""
        pass

    @abstractmethod
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
        """Publish or draft a post to the remote CMS/blog."""
        pass

class BaseSocialConnector(ABC):
    @abstractmethod
    async def publish(self, content: str, media_urls: Optional[list] = None) -> Dict[str, Any]:
        """Publish a post to the social media network."""
        pass
