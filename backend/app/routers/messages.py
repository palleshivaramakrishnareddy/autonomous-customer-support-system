import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Ticket, TicketMessage, User, Notification
from app.schemas import MessageCreate, MessageOut
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/tickets", tags=["Messages"])

@router.post("/{ticket_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def post_message(
    ticket_id: int,
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    # Customer authorization
    if current_user.role == "CUSTOMER" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to post to this ticket")

    # Customer cannot post internal notes
    is_internal = msg_in.is_internal if current_user.role in ["SUPPORT_AGENT", "ADMIN"] else False

    sender_type = "CUSTOMER" if current_user.role == "CUSTOMER" else "AGENT"

    msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        sender_type=sender_type,
        message=msg_in.message,
        is_internal=is_internal,
        created_at=datetime.datetime.utcnow()
    )
    db.add(msg)

    # Status & notification transitions
    if not is_internal:
        if current_user.role == "CUSTOMER":
            # If customer replies, ticket may need agent response
            if ticket.status in ["AI_RESPONDED", "WAITING_FOR_CUSTOMER", "RESOLVED"]:
                ticket.status = "IN_PROGRESS"
            if ticket.assigned_agent_id:
                db.add(Notification(
                    user_id=ticket.assigned_agent_id,
                    ticket_id=ticket.id,
                    message=f"New customer reply on ticket #{ticket.ticket_number}"
                ))
        else:
            # Support agent replies to customer
            ticket.status = "WAITING_FOR_CUSTOMER"
            db.add(Notification(
                user_id=ticket.customer_id,
                ticket_id=ticket.id,
                message=f"Support Agent {current_user.name} replied to your ticket #{ticket.ticket_number}"
            ))

    ticket.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "ticket_id": msg.ticket_id,
        "sender_id": msg.sender_id,
        "sender_type": msg.sender_type,
        "message": msg.message,
        "is_internal": msg.is_internal,
        "created_at": msg.created_at,
        "sender_name": current_user.name
    }

@router.get("/{ticket_id}/messages", response_model=List[MessageOut])
def get_messages(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if current_user.role == "CUSTOMER" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    query = db.query(TicketMessage).filter(TicketMessage.ticket_id == ticket_id)
    if current_user.role == "CUSTOMER":
        query = query.filter(TicketMessage.is_internal == False)

    messages = query.order_by(TicketMessage.created_at.asc()).all()
    results = []
    for m in messages:
        results.append({
            "id": m.id,
            "ticket_id": m.ticket_id,
            "sender_id": m.sender_id,
            "sender_type": m.sender_type,
            "message": m.message,
            "is_internal": m.is_internal,
            "created_at": m.created_at,
            "sender_name": m.sender.name if m.sender else ("Autonomous AI" if m.sender_type == "AI" else "System")
        })
    return results
