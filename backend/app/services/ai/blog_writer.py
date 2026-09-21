import json
from typing import Dict, Any, Optional
from app.services.ai.client import AIClient

class BlogWriterService:
    def __init__(self):
        self.ai = AIClient()

    async def generate_blog_post(
        self,
        topic: str,
        tone: str = "authoritative yet conversational",
        target_audience: str = "creators, entrepreneurs, and marketers",
        keywords: Optional[str] = None,
        length: str = "medium"  # short, medium, in-depth
    ) -> Dict[str, Any]:
        """Generates an SEO-optimized blog article with metadata and image prompt."""
        system_prompt = (
            "You are an elite SEO content strategist and blog writer. "
            "Generate a comprehensive, engaging, well-structured blog post. "
            "Return strictly valid JSON with the following keys:\n"
            "- title: Compelling, click-worthy title\n"
            "- slug: URL-safe slug\n"
            "- excerpt: Concise meta description (140-160 characters)\n"
            "- tags: Array of 3-5 relevant tags\n"
            "- seo_keywords: Comma-separated target keywords\n"
            "- image_prompt: Detailed prompt for generating a featured hero banner with Google Imagen\n"
            "- content: Full article body in GitHub-flavored Markdown with H2, H3, bullet points, and key takeaways."
        )

        user_prompt = (
            f"Topic: {topic}\n"
            f"Tone: {tone}\n"
            f"Target Audience: {target_audience}\n"
            f"Target Keywords: {keywords or 'relevant industry terms'}\n"
            f"Length: {length}\n\n"
            "Format the output strictly as JSON."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        raw_result = await self.ai.generate_chat(messages, format_json=True)
        try:
            data = json.loads(raw_result)
            return data
        except Exception:
            return {
                "title": f"The Complete Guide to {topic}",
                "slug": topic.lower().replace(" ", "-")[:40],
                "excerpt": f"An in-depth look into {topic} and how to apply it effectively.",
                "tags": [t.strip() for t in (keywords or "Strategy, AI, Growth").split(",")],
                "seo_keywords": keywords or topic,
                "image_prompt": f"Modern digital art depicting {topic}, clean UI elements, subtle lighting",
                "content": f"## Exploring {topic}\n\n{raw_result}"
            }
