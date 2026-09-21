import json
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings

class AIClient:
    """
    Unified AI client supporting Ollama (default) and OpenAI-compatible fallback,
    with intelligent graceful fallback for offline local development.
    """

    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self.ollama_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.ollama_model = settings.OLLAMA_MODEL
        self.openai_key = settings.OPENAI_API_KEY
        self.openai_model = settings.OPENAI_MODEL

    async def generate_chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        format_json: bool = False
    ) -> str:
        # 1. Try Ollama if configured
        if self.provider == "ollama":
            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    payload: Dict[str, Any] = {
                        "model": self.ollama_model,
                        "messages": messages,
                        "stream": False,
                        "options": {"temperature": temperature}
                    }
                    if format_json:
                        payload["format"] = "json"

                    response = await client.post(f"{self.ollama_url}/api/chat", json=payload)
                    if response.status_code == 200:
                        data = response.json()
                        return data.get("message", {}).get("content", "")
            except Exception as e:
                # Fallback to OpenAI if configured, or offline generator
                print(f"[AIClient] Ollama call failed ({e}), attempting fallback...")

        # 2. Try OpenAI if key is present
        if self.openai_key:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    headers = {
                        "Authorization": f"Bearer {self.openai_key}",
                        "Content-Type": "application/json"
                    }
                    payload = {
                        "model": self.openai_model,
                        "messages": messages,
                        "temperature": temperature
                    }
                    if format_json:
                        payload["response_format"] = {"type": "json_object"}

                    response = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
                    if response.status_code == 200:
                        return response.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"[AIClient] OpenAI call failed: {e}")

        # 3. Graceful mock fallback for local testing without active GPU/keys
        return self._generate_fallback(messages, format_json)

    def _generate_fallback(self, messages: List[Dict[str, str]], format_json: bool) -> str:
        last_msg = messages[-1]["content"] if messages else ""
        if format_json:
            return json.dumps({
                "title": "Unlocking High-Performance Content Workflows with RelayHub",
                "slug": "unlocking-high-performance-content-workflows",
                "excerpt": "Discover how unified multi-channel publishing and AI repurposing transform marketing efficiency for modern creators and businesses.",
                "tags": ["Marketing Automation", "Content Strategy", "AI", "Productivity"],
                "seo_keywords": "marketing automation, social media scheduler, blog repurposing",
                "image_prompt": "A futuristic minimalist desk with holographic displays showing social media metrics and blog articles, neon accents, hyper-detailed 3D render",
                "content": "## Introduction\n\nIn today's fast-paced digital landscape, maintaining consistent engagement across multiple channels—from your personal website blog to social platforms and newsletters—is a massive challenge.\n\n### Why Anchor Content Matters\nBy starting with a comprehensive blog post on your website, you establish topical authority and SEO visibility. From there, each core insight can be repurposed into micro-content for LinkedIn, X, and your email subscribers.\n\n### Key Takeaways\n1. **Consistency**: Regular publishing compounds organic reach.\n2. **Repurposing**: Turn 1 pillar post into 10 distribution touchpoints.\n3. **Automation**: Keep your audience engaged on autopilot.\n\n## Conclusion\nStart streamlining your reach today with automated workflows and AI assistance.",
                "linkedin": "🚀 Stop spending 10 hours a week rewriting content for every platform.\n\nHere is the formula top creators and brands use to stay everywhere at once:\n\n1. Write 1 in-depth blog post on your own website\n2. Extract 3 high-impact lessons for LinkedIn\n3. Turn key takeaways into punchy X threads\n4. Send a digest to your email list\n\nConsistency isn't about working more—it's about distribution leverage.\n\nWhat's your biggest bottleneck in content creation right now?\n\n#ContentStrategy #MarketingAutomation #SaaS #Productivity",
                "twitter": "Most creators make a huge mistake:\n\nThey create separate content for LinkedIn, X, and blogs from scratch.\n\nInstead:\n1. Write 1 pillar blog post on your domain\n2. Repurpose into punchy threads\n3. Drive readers back to your website\n\nLeverage > Hustle. 🧵👇",
                "instagram": "Work smarter, not harder on your content! 💡 Transform one great idea into a complete cross-platform campaign with RelayHub.\n.\n.\n#marketing #contentcreator #digitalmarketing #productivity #growth",
                "email_subject": "How to 10x your content reach (without burnout)",
                "email_preview": "The exact repurposing framework to stay consistent across your blog, LinkedIn, and X.",
                "email_content": "<p>Hey there,</p><p>If you've ever felt like keeping up with blogs, LinkedIn, and social feeds is a full-time job, you're not alone.</p><p>We just published a deep dive on our blog: <strong>Unlocking High-Performance Content Workflows</strong>.</p><p>In this post, we break down:</p><ul><li>Why your personal blog should always be your content anchor</li><li>How to turn 1 article into 5 social posts in under 2 minutes</li><li>The automation engine that handles scheduling for you</li></ul><p><a href='#'>Read the full article on our blog &rarr;</a></p><p>Cheers,<br>The RelayHub Team</p>"
            })
        return "RelayHub intelligent assistant generated response."
