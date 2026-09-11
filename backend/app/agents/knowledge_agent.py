import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import KnowledgeArticle

class KnowledgeAgent:
    """
    AGENT 3 — KNOWLEDGE AGENT
    Responsibilities:
    - Search the internal knowledge base
    - Find relevant articles
    - Match customer issue with known solutions
    - Return relevant knowledge articles with relevance scores
    """
    name = "Knowledge Agent"

    @classmethod
    def process(
        cls, 
        db: Session, 
        subject: str, 
        description: str, 
        category: str, 
        keywords: List[str]
    ) -> Dict[str, Any]:
        text = f"{subject} {description}".lower()
        search_terms = set(keywords)
        # Add words from subject
        for word in re.findall(r'\b[a-zA-Z]{3,}\b', subject.lower()):
            search_terms.add(word)

        # Query all articles from database
        articles = db.query(KnowledgeArticle).all()
        scored_articles = []

        for art in articles:
            score = 0
            art_text = f"{art.title} {art.content} {art.keywords} {art.category}".lower()
            
            # Category boost
            if art.category.upper() == category.upper():
                score += 30

            # Keyword matching
            art_keywords = [k.strip().lower() for k in art.keywords.split(",") if k.strip()]
            for kw in search_terms:
                if kw in art_keywords:
                    score += 25
                elif kw in art.title.lower():
                    score += 15
                elif kw in art.content.lower():
                    score += 5

            # Phrase matches
            if subject.lower() in art.title.lower() or art.title.lower() in subject.lower():
                score += 40

            if score > 15:
                scored_articles.append({
                    "id": art.id,
                    "title": art.title,
                    "content": art.content,
                    "category": art.category,
                    "score": score
                })

        # Sort by relevance score descending
        scored_articles.sort(key=lambda x: x["score"], reverse=True)
        top_articles = scored_articles[:3]

        return {
            "agent": cls.name,
            "articles_found": len(top_articles),
            "top_articles": top_articles,
            "best_match": top_articles[0] if top_articles else None
        }
