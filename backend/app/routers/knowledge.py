import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import KnowledgeArticle, User
from app.schemas import KnowledgeArticleCreate, KnowledgeArticleUpdate, KnowledgeArticleOut
from app.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Base"])

@router.post("", response_model=KnowledgeArticleOut, status_code=status.HTTP_201_CREATED)
def create_article(
    art_in: KnowledgeArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    article = KnowledgeArticle(
        title=art_in.title,
        content=art_in.content,
        category=art_in.category.upper(),
        keywords=art_in.keywords.lower(),
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article

@router.get("", response_model=List[KnowledgeArticleOut])
def get_articles(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(KnowledgeArticle)
    if category:
        query = query.filter(KnowledgeArticle.category == category.upper())
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                KnowledgeArticle.title.ilike(term),
                KnowledgeArticle.content.ilike(term),
                KnowledgeArticle.keywords.ilike(term)
            )
        )
    return query.order_by(KnowledgeArticle.updated_at.desc()).all()

@router.get("/{id}", response_model=KnowledgeArticleOut)
def get_article(id: int, db: Session = Depends(get_db)):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.id == id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge article not found")
    return article

@router.put("/{id}", response_model=KnowledgeArticleOut)
def update_article(
    id: int,
    art_in: KnowledgeArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.id == id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge article not found")

    if art_in.title:
        article.title = art_in.title
    if art_in.content:
        article.content = art_in.content
    if art_in.category:
        article.category = art_in.category.upper()
    if art_in.keywords:
        article.keywords = art_in.keywords.lower()

    article.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(article)
    return article

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.id == id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge article not found")
    db.delete(article)
    db.commit()
    return None
