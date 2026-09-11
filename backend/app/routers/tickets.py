from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Ticket, User, TicketMessage, AIDecision, Feedback
from app.schemas import TicketCreate, TicketUpdate, TicketOut, TicketDetailOut, MessageOut, FeedbackOut, AIDecisionOut
from app.dependencies import get_current_user, require_customer, require_agent_or_admin
from app.services.ticket_service import create_ticket, update_ticket
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])

def serialize_ticket(t: Ticket) -> dict:
    return {
        "id": t.id,
        "ticket_number": t.ticket_number,
        "customer_id": t.customer_id,
        "assigned_agent_id": t.assigned_agent_id,
        "subject": t.subject,
        "description": t.description,
        "category": t.category,
        "priority": t.priority,
        "severity": t.severity,
        "sentiment": t.sentiment,
        "status": t.status,
        "ai_confidence": t.ai_confidence,
        "ai_resolution": t.ai_resolution,
        "created_at": t.created_at,
        "updated_at": t.updated_at,
        "resolved_at": t.resolved_at,
        "customer_name": t.customer.name if t.customer else None,
        "assigned_agent_name": t.assigned_agent.name if t.assigned_agent else None
    }

@router.post("", response_model=TicketDetailOut, status_code=status.HTTP_201_CREATED)
def create_new_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Create ticket
    ticket = create_ticket(db, customer_id=current_user.id, ticket_in=ticket_in)
    
    # 2. Automatically trigger multi-agent pipeline
    AgentOrchestrator.run_pipeline(db, ticket, hint_category=ticket_in.category)

    # 3. Fetch enriched ticket detail
    db.refresh(ticket)
    return get_ticket_detail(ticket.id, db, current_user)

@router.get("", response_model=List[TicketOut])
def list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    assigned_to_me: Optional[bool] = False,
    escalated_only: Optional[bool] = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Ticket)

    # Role-based restriction
    if current_user.role == "CUSTOMER":
        query = query.filter(Ticket.customer_id == current_user.id)
    elif current_user.role == "SUPPORT_AGENT":
        if assigned_to_me:
            query = query.filter(Ticket.assigned_agent_id == current_user.id)
        if escalated_only:
            query = query.filter(Ticket.status == "ESCALATED")

    # Filters
    if status_filter:
        query = query.filter(Ticket.status == status_filter)
    if category:
        query = query.filter(Ticket.category == category)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Ticket.subject.ilike(search_pattern),
                Ticket.ticket_number.ilike(search_pattern),
                Ticket.description.ilike(search_pattern)
            )
        )

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return [serialize_ticket(t) for t in tickets]

@router.get("/{ticket_id}", response_model=TicketDetailOut)
def get_ticket_detail(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    # Customer authorization check
    if current_user.role == "CUSTOMER" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this ticket")

    # Messages (hide internal notes from customers)
    msg_query = db.query(TicketMessage).filter(TicketMessage.ticket_id == ticket_id)
    if current_user.role == "CUSTOMER":
        msg_query = msg_query.filter(TicketMessage.is_internal == False)
    messages = msg_query.order_by(TicketMessage.created_at.asc()).all()

    messages_out = []
    for m in messages:
        messages_out.append({
            "id": m.id,
            "ticket_id": m.ticket_id,
            "sender_id": m.sender_id,
            "sender_type": m.sender_type,
            "message": m.message,
            "is_internal": m.is_internal,
            "created_at": m.created_at,
            "sender_name": m.sender.name if m.sender else ("Autonomous AI" if m.sender_type == "AI" else "System")
        })

    # AI Decisions audit trail
    decisions = db.query(AIDecision).filter(AIDecision.ticket_id == ticket_id).order_by(AIDecision.created_at.asc()).all()
    decisions_out = [
        {
            "id": d.id,
            "ticket_id": d.ticket_id,
            "agent_name": d.agent_name,
            "action": d.action,
            "reasoning_summary": d.reasoning_summary,
            "confidence": d.confidence,
            "created_at": d.created_at
        }
        for d in decisions
    ]

    # Feedback
    feedback_out = None
    if ticket.feedback:
        feedback_out = {
            "id": ticket.feedback.id,
            "ticket_id": ticket.feedback.ticket_id,
            "customer_id": ticket.feedback.customer_id,
            "rating": ticket.feedback.rating,
            "comment": ticket.feedback.comment,
            "sentiment": ticket.feedback.sentiment,
            "created_at": ticket.feedback.created_at,
            "customer_name": ticket.customer.name if ticket.customer else None,
            "ticket_number": ticket.ticket_number
        }

    res = serialize_ticket(ticket)
    res["messages"] = messages_out
    res["feedback"] = feedback_out
    res["ai_decisions"] = decisions_out
    return res

@router.put("/{ticket_id}", response_model=TicketOut)
def modify_ticket(
    ticket_id: int,
    update_in: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    # Only Agent or Admin can update status/priority/assignment
    if current_user.role == "CUSTOMER":
        # Customer can only close their own ticket
        if update_in.status == "CLOSED" and ticket.customer_id == current_user.id:
            ticket.status = "CLOSED"
            db.commit()
            db.refresh(ticket)
            return serialize_ticket(ticket)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers cannot modify ticket triage parameters")

    updated = update_ticket(db, ticket, update_in)
    return serialize_ticket(updated)

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only administrators can delete tickets")
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    
    db.delete(ticket)
    db.commit()
    return None
