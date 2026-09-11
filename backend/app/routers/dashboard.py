from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database import get_db
from app.models import Ticket, Feedback, User
from app.schemas import DashboardStats, DistributionItem, TrendItem
from app.dependencies import get_current_user
from app.services.ai_service import get_ai_mode

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = db.query(Ticket).count()
    open_count = db.query(Ticket).filter(
        Ticket.status.notin_(["RESOLVED", "CLOSED"])
    ).count()
    resolved_count = db.query(Ticket).filter(
        Ticket.status.in_(["RESOLVED", "CLOSED"])
    ).count()
    escalated_count = db.query(Ticket).filter(
        Ticket.status.in_(["ESCALATED", "ASSIGNED"])
    ).count()
    critical_count = db.query(Ticket).filter(
        Ticket.priority == "CRITICAL"
    ).count()

    # AI resolution rate: tickets resolved autonomously without human escalation
    ai_resolved_count = db.query(Ticket).filter(
        Ticket.status.in_(["AI_RESPONDED", "RESOLVED"]),
        Ticket.assigned_agent_id.is_(None)
    ).count()
    ai_rate = round((ai_resolved_count / total * 100.0), 1) if total > 0 else 0.0

    # Average resolution time in hours
    resolved_tickets = db.query(Ticket).filter(Ticket.resolved_at.isnot(None)).all()
    if resolved_tickets:
        durations = [(t.resolved_at - t.created_at).total_seconds() / 3600.0 for t in resolved_tickets]
        avg_time = round(sum(durations) / len(durations), 1)
    else:
        avg_time = 0.0

    # Average rating from feedback table
    avg_rating_val = db.query(func.avg(Feedback.rating)).scalar()
    avg_rating = round(float(avg_rating_val), 1) if avg_rating_val else 0.0

    return {
        "total_tickets": total,
        "open_tickets": open_count,
        "resolved_tickets": resolved_count,
        "escalated_tickets": escalated_count,
        "critical_tickets": critical_count,
        "ai_resolution_rate": ai_rate,
        "avg_resolution_time_hours": avg_time,
        "avg_customer_rating": avg_rating,
        "ai_mode": get_ai_mode()
    }

@router.get("/ticket-trends", response_model=List[TrendItem])
def get_ticket_trends(db: Session = Depends(get_db)):
    tickets = db.query(Ticket).all()
    trend_dict: Dict[str, Dict[str, int]] = {}

    # Initialize last 7 days
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        day_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        trend_dict[day_str] = {"tickets": 0, "resolved": 0, "escalated": 0}

    for t in tickets:
        d_str = t.created_at.strftime("%Y-%m-%d")
        if d_str not in trend_dict:
            trend_dict[d_str] = {"tickets": 0, "resolved": 0, "escalated": 0}
        trend_dict[d_str]["tickets"] += 1
        if t.status in ["RESOLVED", "CLOSED"]:
            trend_dict[d_str]["resolved"] += 1
        if t.status in ["ESCALATED", "ASSIGNED"]:
            trend_dict[d_str]["escalated"] += 1

    # Sort by date
    sorted_days = sorted(trend_dict.keys())[-7:]
    return [
        {
            "date": d,
            "tickets": trend_dict[d]["tickets"],
            "resolved": trend_dict[d]["resolved"],
            "escalated": trend_dict[d]["escalated"]
        }
        for d in sorted_days
    ]

@router.get("/category-distribution", response_model=List[DistributionItem])
def get_category_distribution(db: Session = Depends(get_db)):
    total = db.query(Ticket).count()
    rows = db.query(Ticket.category, func.count(Ticket.id)).group_by(Ticket.category).all()
    return [
        {
            "name": cat,
            "value": count,
            "percentage": round(count / total * 100.0, 1) if total > 0 else 0.0
        }
        for cat, count in rows
    ]

@router.get("/priority-distribution", response_model=List[DistributionItem])
def get_priority_distribution(db: Session = Depends(get_db)):
    total = db.query(Ticket).count()
    rows = db.query(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority).all()
    return [
        {
            "name": prio,
            "value": count,
            "percentage": round(count / total * 100.0, 1) if total > 0 else 0.0
        }
        for prio, count in rows
    ]

@router.get("/status-distribution", response_model=List[DistributionItem])
def get_status_distribution(db: Session = Depends(get_db)):
    total = db.query(Ticket).count()
    rows = db.query(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status).all()
    return [
        {
            "name": st,
            "value": count,
            "percentage": round(count / total * 100.0, 1) if total > 0 else 0.0
        }
        for st, count in rows
    ]

@router.get("/sentiment-distribution", response_model=List[DistributionItem])
def get_sentiment_distribution(db: Session = Depends(get_db)):
    total = db.query(Ticket).count()
    rows = db.query(Ticket.sentiment, func.count(Ticket.id)).group_by(Ticket.sentiment).all()
    return [
        {
            "name": sent,
            "value": count,
            "percentage": round(count / total * 100.0, 1) if total > 0 else 0.0
        }
        for sent, count in rows
    ]
