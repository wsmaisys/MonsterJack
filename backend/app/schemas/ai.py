from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class GenerateBlogRequest(BaseModel):
    topic: str
    tone: Optional[str] = "informative, authoritative, engaging"
    target_audience: Optional[str] = "entrepreneurs, creators, professionals"
    keywords: Optional[str] = None
    length: Optional[str] = "medium"

class GenerateBlogResponse(BaseModel):
    title: str
    slug: str
    excerpt: str
    tags: List[str]
    seo_keywords: str
    image_prompt: str
    content: str

class RepurposeRequest(BaseModel):
    blog_title: str
    blog_content: str
    blog_url: Optional[str] = None

class RepurposeResponse(BaseModel):
    linkedin: str
    twitter: str
    instagram: str
    email_subject: str
    email_preview: str
    email_content: str

class GenerateImageRequest(BaseModel):
    prompt: str
    aspect_ratio: Optional[str] = "16:9"

class GenerateImageResponse(BaseModel):
    success: bool
    image_url: str
    prompt: str
    note: Optional[str] = None
