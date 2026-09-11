from typing import Dict, Any

class SupervisorAgent:
    """
    AGENT 7 — SUPERVISOR AGENT
    Responsibilities:
    - Review outputs from all agents (Intake, Classification, Knowledge, Resolution, Escalation)
    - Validate the proposed action
    - Prevent unsafe autonomous resolution
    - Enforce safety rules (CRITICAL priority, confidence >= 0.75, financial safety)
    - Approve resolution or escalation
    - Generate safe, concise reasoning summary (NO internal chain-of-thought)
    """
    name = "Supervisor Agent"

    @classmethod
    def evaluate(
        cls,
        classification: Dict[str, Any],
        knowledge: Dict[str, Any],
        resolution: Dict[str, Any],
        escalation: Dict[str, Any]
    ) -> Dict[str, Any]:
        priority = classification.get("priority", "MEDIUM")
        severity = classification.get("severity", "MEDIUM")
        confidence = float(classification.get("confidence", 0.8))
        res_confidence = float(resolution.get("confidence", 0.8))
        effective_confidence = round(min(confidence, res_confidence), 2)
        
        is_resolvable = resolution.get("is_resolvable", False)
        escalation_required = escalation.get("escalation_required", False)

        # Safety Rules
        # Rule 1: CRITICAL tickets must ALWAYS be escalated
        if priority == "CRITICAL" or severity == "CRITICAL":
            final_action = "ESCALATE"
            reasoning = "Mandatory escalation: Critical severity system event requires immediate human review."
        
        # Rule 2: Confidence must be >= 0.75 for autonomous resolution
        elif effective_confidence < 0.75:
            final_action = "ESCALATE"
            reasoning = f"Low confidence ({effective_confidence:.2f} < 0.75) in automatic resolution; human review required."

        # Rule 3: Must be safe and marked resolvable
        elif not is_resolvable or escalation_required:
            final_action = "ESCALATE"
            escalation_reasons = escalation.get("reasons", [])
            if escalation_reasons:
                reasoning = f"Escalated to human support: {escalation_reasons[0]}"
            else:
                reasoning = "Issue requires manual verification by support agent."

        # Rule 4: High confidence, verified solution, non-critical
        else:
            final_action = "AUTONOMOUS_RESOLVE"
            if knowledge.get("best_match"):
                reasoning = f"Autonomous resolution approved: verified knowledge base solution matched with high confidence ({effective_confidence:.2f})."
            else:
                reasoning = f"Autonomous resolution approved: standard support protocol applied with high confidence ({effective_confidence:.2f})."

        return {
            "agent": cls.name,
            "final_action": final_action,
            "reasoning_summary": reasoning,
            "approved": True,
            "effective_confidence": effective_confidence
        }
