from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Ticket, User
from app.schemas import AIStructuredAnalysis, TicketDetailOut
from app.dependencies import get_current_user, require_agent_or_admin
from app.agents.orchestrator import AgentOrchestrator
from app.agents.resolution_agent import ResolutionAgent
from app.agents.knowledge_agent import KnowledgeAgent
from app.agents.escalation_agent import EscalationAgent
from app.agents.supervisor_agent import SupervisorAgent
from app.routers.tickets import get_ticket_detail

router = APIRouter(prefix="/api/ai", tags=["AI Operations"])

@router.post("/analyze-ticket/{ticket_id}", response_model=AIStructuredAnalysis)
def analyze_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent_or_admin)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    result = AgentOrchestrator.run_pipeline(db, ticket)
    return result

@router.post("/generate-response/{ticket_id}")
def generate_response(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent_or_admin)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    # Knowledge search
    kb_res = KnowledgeAgent.process(
        db=db,
        subject=ticket.subject,
        description=ticket.description,
        category=ticket.category,
        keywords=[ticket.category.lower()]
    )

    class_res = {
        "category": ticket.category,
        "priority": ticket.priority,
        "severity": ticket.severity,
        "confidence": ticket.ai_confidence or 0.8
    }

    res_res = ResolutionAgent.process(
        subject=ticket.subject,
        description=ticket.description,
        classification=class_res,
        knowledge=kb_res
    )

    return {
        "suggested_response": res_res["response"],
        "confidence": res_res["confidence"],
        "is_resolvable": res_res["is_resolvable"],
        "best_match": kb_res.get("best_match")
    }

@router.post("/escalate/{ticket_id}", response_model=TicketDetailOut)
def force_escalate(
    ticket_id: int,
    reason: str = "Manual escalation requested by support personnel",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent_or_admin)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    ticket.status = "ESCALATED"
    class_res = {"priority": "HIGH", "severity": "HIGH", "category": ticket.category, "confidence": 0.5}
    res_res = {"is_resolvable": False, "confidence": 0.5}
    esc_res = EscalationAgent.process(db, class_res, res_res)
    
    if esc_res.get("assigned_agent_id"):
        ticket.assigned_agent_id = esc_res["assigned_agent_id"]
        ticket.status = "ASSIGNED"

    db.commit()
    return get_ticket_detail(ticket.id, db, current_user)
