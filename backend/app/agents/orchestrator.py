from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Ticket, TicketMessage, AIDecision, Notification
from app.agents.intake_agent import IntakeAgent
from app.agents.classification_agent import ClassificationAgent
from app.agents.knowledge_agent import KnowledgeAgent
from app.agents.resolution_agent import ResolutionAgent
from app.agents.escalation_agent import EscalationAgent
from app.agents.supervisor_agent import SupervisorAgent

class AgentOrchestrator:
    """
    Coordinates the 7-Agent Autonomous Loop:
    OBSERVE -> UNDERSTAND -> PLAN -> ACT -> VERIFY -> COMPLETE or ESCALATE
    """

    @classmethod
    def run_pipeline(cls, db: Session, ticket: Ticket, hint_category: Optional[str] = None) -> Dict[str, Any]:
        # 1. OBSERVE: Receive customer issue & set AI_ANALYZING
        ticket.status = "AI_ANALYZING"
        db.commit()
        db.refresh(ticket)

        # 2. UNDERSTAND: Intake Agent
        intake_res = IntakeAgent.process(ticket.subject, ticket.description)
        db.add(AIDecision(
            ticket_id=ticket.id,
            agent_name=IntakeAgent.name,
            action="INTAKE_COMPLETED",
            reasoning_summary=f"Extracted intent: {intake_res['intent']}. Key symptoms: {', '.join(intake_res['symptoms']) or 'None'}.",
            confidence=0.90
        ))

        # 3. PLAN / CLASSIFY: Classification Agent
        class_res = ClassificationAgent.process(
            ticket.subject, 
            ticket.description, 
            intake_res, 
            hint_category=hint_category or ticket.category
        )
        ticket.category = class_res["category"]
        ticket.priority = class_res["priority"]
        ticket.severity = class_res["severity"]
        ticket.sentiment = class_res["sentiment"]
        ticket.ai_confidence = class_res["confidence"]
        
        db.add(AIDecision(
            ticket_id=ticket.id,
            agent_name=ClassificationAgent.name,
            action="ISSUE_CLASSIFIED",
            reasoning_summary=f"Classified as {ticket.category} | Priority: {ticket.priority} | Severity: {ticket.severity} | Sentiment: {ticket.sentiment}.",
            confidence=class_res["confidence"]
        ))

        # 4. KNOWLEDGE RETRIEVAL: Knowledge Agent
        knowledge_res = KnowledgeAgent.process(
            db, 
            ticket.subject, 
            ticket.description, 
            ticket.category, 
            intake_res["keywords"]
        )
        best_match = knowledge_res.get("best_match")
        kb_summary = f"Matched article '{best_match['title']}' (Score: {best_match['score']})" if best_match else "No direct knowledge article match found."
        db.add(AIDecision(
            ticket_id=ticket.id,
            agent_name=KnowledgeAgent.name,
            action="KNOWLEDGE_SEARCHED",
            reasoning_summary=kb_summary,
            confidence=0.85 if best_match else 0.50
        ))

        # 5. PLAN RESOLUTION: Resolution Agent
        res_res = ResolutionAgent.process(
            ticket.subject, 
            ticket.description, 
            class_res, 
            knowledge_res
        )
        db.add(AIDecision(
            ticket_id=ticket.id,
            agent_name=ResolutionAgent.name,
            action="SOLUTION_GENERATED",
            reasoning_summary=f"Proposed action: {res_res['recommended_action']}. Autonomously resolvable: {res_res['is_resolvable']}.",
            confidence=res_res["confidence"]
        ))

        # 6. ESCALATION EVALUATION: Escalation Agent
        esc_res = EscalationAgent.process(db, class_res, res_res)

        # 7. VERIFY & SUPERVISE: Supervisor Agent
        sup_res = SupervisorAgent.evaluate(class_res, knowledge_res, res_res, esc_res)
        
        db.add(AIDecision(
            ticket_id=ticket.id,
            agent_name=SupervisorAgent.name,
            action=sup_res["final_action"],
            reasoning_summary=sup_res["reasoning_summary"],
            confidence=sup_res["effective_confidence"]
        ))

        ticket.ai_confidence = sup_res["effective_confidence"]
        ticket.ai_resolution = res_res["response"]

        # 8. ACT / COMPLETE or ESCALATE
        if sup_res["final_action"] == "AUTONOMOUS_RESOLVE":
            ticket.status = "AI_RESPONDED"
            # Add AI message to conversation thread
            db.add(TicketMessage(
                ticket_id=ticket.id,
                sender_id=None,
                sender_type="AI",
                message=res_res["response"],
                is_internal=False
            ))
            # Notify customer
            db.add(Notification(
                user_id=ticket.customer_id,
                ticket_id=ticket.id,
                message="AI Support has provided an autonomous solution to your ticket."
            ))
        else:
            ticket.status = "ESCALATED"
            if esc_res.get("assigned_agent_id"):
                ticket.assigned_agent_id = esc_res["assigned_agent_id"]
                ticket.status = "ASSIGNED"
                # Notify assigned agent
                db.add(Notification(
                    user_id=esc_res["assigned_agent_id"],
                    ticket_id=ticket.id,
                    message=f"New ticket #{ticket.ticket_number} assigned to you: {ticket.subject}"
                ))

            # System message in thread notifying about escalation
            escalate_msg = (
                f"Your ticket has been forwarded to our support team for specialist assistance.\n"
                f"Reason: {sup_res['reasoning_summary']}\n\n"
                f"Preliminary AI assessment: {res_res['response']}"
            )
            db.add(TicketMessage(
                ticket_id=ticket.id,
                sender_id=None,
                sender_type="SYSTEM",
                message=escalate_msg,
                is_internal=False
            ))
            # Notify customer
            db.add(Notification(
                user_id=ticket.customer_id,
                ticket_id=ticket.id,
                message="Your ticket has been forwarded to a human support specialist."
            ))

        db.commit()
        db.refresh(ticket)

        return {
            "intent": intake_res["intent"],
            "category": ticket.category,
            "priority": ticket.priority,
            "severity": ticket.severity,
            "sentiment": ticket.sentiment,
            "confidence": ticket.ai_confidence,
            "is_resolvable": sup_res["final_action"] == "AUTONOMOUS_RESOLVE",
            "recommended_action": sup_res["final_action"],
            "response": res_res["response"],
            "escalation_required": sup_res["final_action"] == "ESCALATE",
            "reasoning_summary": sup_res["reasoning_summary"]
        }
