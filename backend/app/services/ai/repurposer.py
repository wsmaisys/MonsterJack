import json
from typing import Dict, Any, Optional
from app.services.ai.client import AIClient

class ContentRepurposerService:
    def __init__(self):
        self.ai = AIClient()

    async def repurpose_blog_post(
        self,
        blog_title: str,
        blog_content: str,
        blog_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Repurposes a blog post into multi-channel social media posts and an email campaign.
        """
        system_prompt = (
            "You are a world-class growth marketer and multi-channel content repurposing expert. "
            "Given a blog post title and body, produce tailored, high-converting copy for each channel:\n"
            "1. linkedin: Thought leadership post with a strong hook, bullet points, CTA, and 3-5 hashtags.\n"
            "2. twitter: Punchy tweet or micro-thread starter under 280 characters with a compelling teaser.\n"
            "3. instagram: Visual caption with emojis, value summary, and relevant hashtags.\n"
            "4. email_subject: Catchy, high-open-rate subject line.\n"
            "5. email_preview: Preheader preview text.\n"
            "6. email_content: Engaging newsletter HTML content introducing the topic and linking to the blog.\n\n"
            "Output strictly valid JSON with keys: linkedin, twitter, instagram, email_subject, email_preview, email_content."
        )

        user_prompt = (
            f"Blog Title: {blog_title}\n"
            f"Blog URL: {blog_url or 'https://yourwebsite.com/blog'}\n\n"
            f"Blog Excerpt/Content:\n{blog_content[:2500]}\n\n"
            "Return JSON only."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        raw_result = await self.ai.generate_chat(messages, format_json=True)
        try:
            return json.loads(raw_result)
        except Exception:
            # Fallback
            return {
                "linkedin": f"💡 Just published: {blog_title}!\n\nHere are 3 core insights you need to know today.\n\nRead more on our blog.\n\n#Growth #Strategy #Productivity",
                "twitter": f"New on the blog: {blog_title} 🧵\n\nWhy this matters and how to apply it right now: 👇",
                "instagram": f"Excited to share our newest deep dive: {blog_title}! ✨ Link in bio to read the full breakdown.",
                "email_subject": f"New Post: {blog_title}",
                "email_preview": f"Check out our latest insights on {blog_title}",
                "email_content": f"<p>Hi there,</p><p>We just published a new article: <strong>{blog_title}</strong>.</p><p><a href='{blog_url or '#'}' style='color: #4F46E5; font-weight: bold;'>Read the full post &rarr;</a></p>"
            }
