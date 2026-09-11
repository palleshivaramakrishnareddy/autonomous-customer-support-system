from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import User, Ticket

class EscalationAgent:
    """
    AGENT 5 — ESCALATION AGENT
    Responsibilities:
    - Determine if human intervention is necessary
    - Escalate critical issues
    - Escalate low-confidence issues (< 0.75)
    - Escalate unresolved issues
    - Escalate sensitive billing / account security issues
    - Assign ticket to a support agent
    """
    name = "Escalation Agent"

    @classmethod
    def process(
        cls,
        db: Session,
        classification: Dict[str, Any],
        resolution: Dict[str, Any]
    ) -> Dict[str, Any]:
        priority = classification.get("priority", "MEDIUM")
        severity = classification.get("severity", "MEDIUM")
        category = classification.get("category", "GENERAL")
        confidence = min(classification.get("confidence", 0.8), resolution.get("confidence", 0.8))
        is_resolvable = resolution.get("is_resolvable", False)

        reasons = []
        should_escalate = False

        # Mandatory CRITICAL rule
        if priority == "CRITICAL" or severity == "CRITICAL":
            should_escalate = True
            reasons.append("Critical priority/severity requires immediate human response.")

        # Low confidence rule (< 0.75)
        if confidence < 0.75:
            should_escalate = True
            reasons.append(f"AI confidence score ({confidence:.2f}) is below safe autonomous threshold (0.75).")

        # Unresolvable rule
        if not is_resolvable:
            should_escalate = True
            reasons.append("Issue requires human actions (account changes, financial adjustments, or investigation).")

        # Sensitive category rule
        if category in ["BILLING", "PAYMENT"] and not is_resolvable:
            should_escalate = True
            reasons.append("Sensitive billing / financial transaction dispute.")

        assigned_agent_id = None
        assigned_agent_name = None

        if should_escalate:
            # Select available support agent (least loaded)
            agents = db.query(User).filter(User.role == "SUPPORT_AGENT").all()
            if not agents:
                # Fallback to admin if no dedicated support agent
                agents = db.query(User).filter(User.role == "ADMIN").all()

            if agents:
                # Find agent with minimum active assigned tickets
                agent_loads = []
                for ag in agents:
                    count = db.query(Ticket).filter(
                        Ticket.assigned_agent_id == ag.id,
                        Ticket.status.in_(["ASSIGNED", "IN_PROGRESS", "ESCALATED"])
                    ).count()
                    agent_loads.append((ag, count))
                
                agent_loads.sort(key=lambda x: x[1])
                chosen_agent = agent_loads[0][0]
                assigned_agent_id = chosen_agent.id
                assigned_agent_name = chosen_agent.name

        return {
            "agent": cls.name,
            "escalation_required": should_escalate,
            "reasons": reasons,
            "summary_reason": "; ".join(reasons) if reasons else "No escalation needed.",
            "assigned_agent_id": assigned_agent_id,
            "assigned_agent_name": assigned_agent_name
        }
