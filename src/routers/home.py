from fastapi import APIRouter, HTTPException, Request, Query, Depends

from dependencies import get_templates

router = APIRouter(tags=["Home page"])

@router.get('/')
def lobby_page(request: Request, templates=Depends(get_templates)):
    return templates.TemplateResponse(request=request, name='home.html')
