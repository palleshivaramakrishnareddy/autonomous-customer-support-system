import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Ticket, Feedback, User
from app.schemas import FeedbackCreate, FeedbackOut
from app.dependencies import get_current_user
from app.agents.feedback_agent import FeedbackAgent

router = APIRouter(tags=["Feedback"])

@router.post("/api/tickets/{ticket_id}/feedback", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    ticket_id: int,
    fb_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if current_user.role == "CUSTOMER" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Check if already submitted
    existing = db.query(Feedback).filter(Feedback.ticket_id == ticket_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Feedback has already been submitted for this ticket")

    # Run Feedback Agent
    analysis = FeedbackAgent.process(
        db=db,
        ticket_id=ticket.id,
        rating=fb_in.rating,
        comment=fb_in.comment or ""
    )

    feedback = Feedback(
        ticket_id=ticket.id,
        customer_id=current_user.id,
        rating=fb_in.rating,
        comment=fb_in.comment,
        sentiment=analysis["sentiment"],
        created_at=datetime.datetime.utcnow()
    )
    db.add(feedback)

    # Optionally mark ticket resolved if closed/resolved by customer rating
    if ticket.status not in ["RESOLVED", "CLOSED"]:
        ticket.status = "RESOLVED"
        ticket.resolved_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(feedback)

    return {
        "id": feedback.id,
        "ticket_id": feedback.ticket_id,
        "customer_id": feedback.customer_id,
        "rating": feedback.rating,
        "comment": feedback.comment,
        "sentiment": feedback.sentiment,
        "created_at": feedback.created_at,
        "customer_name": current_user.name,
        "ticket_number": ticket.ticket_number
    }

@router.get("/api/feedback", response_model=List[FeedbackOut])
def list_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Feedback)
    if current_user.role == "CUSTOMER":
        query = query.filter(Feedback.customer_id == current_user.id)

    feedbacks = query.order_by(Feedback.created_at.desc()).all()
    results = []
    for f in feedbacks:
        results.append({
            "id": f.id,
            "ticket_id": f.ticket_id,
            "customer_id": f.customer_id,
            "rating": f.rating,
            "comment": f.comment,
            "sentiment": f.sentiment,
            "created_at": f.created_at,
            "customer_name": f.customer.name if f.customer else None,
            "ticket_number": f.ticket.ticket_number if f.ticket else None
        })
    return results
