import re
from collections import Counter
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, AIDecision, Ticket
from app.schemas import UserOut, AIDecisionOut, RecurringIssueItem
from app.dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())
    return query.order_by(User.created_at.desc()).all()

@router.put("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    if role not in ["CUSTOMER", "SUPPORT_AGENT", "ADMIN"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = role
    db.commit()
    db.refresh(user)
    return user

@router.get("/ai-decisions", response_model=List[AIDecisionOut])
def get_ai_decisions(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    decisions = db.query(AIDecision).order_by(AIDecision.created_at.desc()).limit(limit).all()
    return decisions

@router.get("/recurring-issues", response_model=List[RecurringIssueItem])
def get_recurring_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    tickets = db.query(Ticket).all()
    stopwords = {
        "the", "and", "for", "with", "this", "that", "from", "have", "not", "are", 
        "you", "your", "can", "cannot", "need", "help", "please", "application",
        "system", "issue", "problem", "ticket", "support"
    }

    category_keywords = {}
    for t in tickets:
        cat = t.category
        if cat not in category_keywords:
            category_keywords[cat] = []
        
        words = re.findall(r'\b[a-zA-Z]{4,}\b', f"{t.subject} {t.description}".lower())
        meaningful = [w for w in words if w not in stopwords]
        for w in meaningful:
            category_keywords[cat].append((w, t.subject, t.severity))

    recurring = []
    for cat, items in category_keywords.items():
        if not items:
            continue
        word_counts = Counter([w for w, subj, sev in items])
        for word, count in word_counts.most_common(2):
            if count >= 1:
                sample_entry = next((s for s in items if s[0] == word), (word, "Various inquiries", "MEDIUM"))
                recurring.append({
                    "category": cat,
                    "keyword": word.capitalize(),
                    "frequency": count,
                    "sample_subject": sample_entry[1],
                    "severity": sample_entry[2]
                })

    recurring.sort(key=lambda x: x["frequency"], reverse=True)
    return recurring[:10]
