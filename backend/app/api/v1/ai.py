from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.ai import (
    GenerateBlogRequest,
    GenerateBlogResponse,
    RepurposeRequest,
    RepurposeResponse,
    GenerateImageRequest,
    GenerateImageResponse
)
from app.api.deps import get_current_user
from app.services.ai.blog_writer import BlogWriterService
from app.services.ai.repurposer import ContentRepurposerService
from app.services.ai.image_gen import ImageGeneratorService

router = APIRouter(prefix="/ai", tags=["AI Engine"])

blog_writer = BlogWriterService()
repurposer = ContentRepurposerService()
image_gen = ImageGeneratorService()

@router.post("/generate-blog", response_model=GenerateBlogResponse)
async def generate_blog(
    data: GenerateBlogRequest,
    current_user: User = Depends(get_current_user)
):
    result = await blog_writer.generate_blog_post(
        topic=data.topic,
        tone=data.tone or "informative and engaging",
        target_audience=data.target_audience or "readers",
        keywords=data.keywords,
        length=data.length or "medium"
    )
    return result

@router.post("/repurpose", response_model=RepurposeResponse)
async def repurpose_content(
    data: RepurposeRequest,
    current_user: User = Depends(get_current_user)
):
    result = await repurposer.repurpose_blog_post(
        blog_title=data.blog_title,
        blog_content=data.blog_content,
        blog_url=data.blog_url
    )
    return result

@router.post("/generate-image", response_model=GenerateImageResponse)
async def generate_image(
    data: GenerateImageRequest,
    current_user: User = Depends(get_current_user)
):
    result = await image_gen.generate_featured_image(
        prompt=data.prompt,
        aspect_ratio=data.aspect_ratio or "16:9"
    )
    return result
