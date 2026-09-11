import datetime
import random
from sqlalchemy.orm import Session
from app.models import Ticket, TicketMessage, User, Notification
from app.schemas import TicketCreate, TicketUpdate

def generate_ticket_number() -> str:
    today_str = datetime.datetime.utcnow().strftime("%Y%m%d")
    rand_suffix = random.randint(1000, 9999)
    return f"TICK-{today_str}-{rand_suffix}"

def create_ticket(db: Session, customer_id: int, ticket_in: TicketCreate) -> Ticket:
    ticket = Ticket(
        ticket_number=generate_ticket_number(),
        customer_id=customer_id,
        subject=ticket_in.subject,
        description=ticket_in.description,
        category=ticket_in.category or "GENERAL",
        priority="MEDIUM",
        severity="MEDIUM",
        sentiment="NEUTRAL",
        status="NEW"
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # Initial customer message in conversation thread
    initial_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=customer_id,
        sender_type="CUSTOMER",
        message=ticket_in.description,
        is_internal=False
    )
    db.add(initial_msg)
    db.commit()

    return ticket

def update_ticket(db: Session, ticket: Ticket, update_in: TicketUpdate) -> Ticket:
    if update_in.status:
        old_status = ticket.status
        ticket.status = update_in.status
        if update_in.status in ["RESOLVED", "CLOSED"] and not ticket.resolved_at:
            ticket.resolved_at = datetime.datetime.utcnow()
            # Notify customer
            db.add(Notification(
                user_id=ticket.customer_id,
                ticket_id=ticket.id,
                message=f"Your ticket #{ticket.ticket_number} has been marked as {update_in.status}."
            ))
            
    if update_in.priority:
        ticket.priority = update_in.priority
    if update_in.severity:
        ticket.severity = update_in.severity
    if update_in.category:
        ticket.category = update_in.category
    if update_in.assigned_agent_id is not None:
        ticket.assigned_agent_id = update_in.assigned_agent_id
        ticket.status = "ASSIGNED"
        db.add(Notification(
            user_id=update_in.assigned_agent_id,
            ticket_id=ticket.id,
            message=f"Ticket #{ticket.ticket_number} was assigned to you."
        ))

    ticket.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return ticket
