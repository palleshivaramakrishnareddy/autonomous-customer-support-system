import re
from typing import Dict, Any, List
from app.services.ai_service import call_openai_structured, get_ai_mode

class IntakeAgent:
    """
    AGENT 1 — INTAKE AGENT
    Responsibilities:
    - Read customer message
    - Understand the issue
    - Extract useful information (keywords, symptoms, urgency signals)
    - Identify intent
    - Prepare structured information for the next agent
    """
    name = "Intake Agent"

    @classmethod
    def process(cls, subject: str, description: str) -> Dict[str, Any]:
        text = f"{subject} {description}".strip()
        
        # Try OpenAI if configured
        if get_ai_mode() == "OPENAI":
            prompt = f"Subject: {subject}\nDescription: {description}"
            system_msg = (
                "You are an Intake Agent for an enterprise customer support platform. "
                "Analyze the customer's message, extract core issue summary, symptoms, "
                "keywords, urgency signals, and primary intent."
            )
            schema = {
                "intent": "e.g. PASSWORD_RESET, BILLING_DISPUTE, SERVICE_OUTAGE, BUG_REPORT, FEATURE_REQUEST, GENERAL_ASSISTANCE",
                "summary": "concise 1-sentence issue summary",
                "keywords": ["keyword1", "keyword2"],
                "symptoms": ["symptom1", "symptom2"],
                "urgency_signals": ["urgent", "cannot access", "deadline"]
            }
            result = call_openai_structured(prompt, system_msg, schema)
            if result and "intent" in result:
                return {
                    "agent": cls.name,
                    "intent": result.get("intent", "GENERAL_ASSISTANCE"),
                    "summary": result.get("summary", subject),
                    "keywords": result.get("keywords", []),
                    "symptoms": result.get("symptoms", []),
                    "urgency_signals": result.get("urgency_signals", [])
                }

        # Deterministic Fallback
        lower = text.lower()
        
        # Extract keywords
        words = re.findall(r'\b[a-zA-Z]{3,}\b', lower)
        stopwords = {"the", "and", "for", "with", "this", "that", "from", "have", "not", "are", "you", "your", "can", "cannot", "need", "help", "please"}
        keywords = [w for w in set(words) if w not in stopwords][:8]

        # Urgency signals
        urgency_terms = ["down", "emergency", "crash", "immediately", "critical", "blocked", "asap", "three days", "not fixed"]
        detected_urgency = [term for term in urgency_terms if term in lower]

        # Symptoms
        symptoms = []
        if "cannot login" in lower or "password" in lower:
            symptoms.append("Authentication failure")
        if "charged twice" in lower or "double" in lower:
            symptoms.append("Duplicate billing / overcharge")
        if "down" in lower or "crash" in lower or "nobody can access" in lower:
            symptoms.append("Service unavailability / system crash")
        if "slow" in lower or "lag" in lower:
            symptoms.append("Performance degradation")

        # Intent detection
        intent = "GENERAL_ASSISTANCE"
        if any(w in lower for w in ["cannot login", "password", "sign in", "reset password", "account locked"]):
            intent = "ACCOUNT_LOGIN_ASSISTANCE"
        elif any(w in lower for w in ["charged twice", "refund", "billing", "invoice", "payment failed", "credit card"]):
            intent = "BILLING_REFUND_INQUIRY"
        elif any(w in lower for w in ["down", "crash", "application is down", "system down", "outage"]):
            intent = "CRITICAL_OUTAGE_REPORT"
        elif any(w in lower for w in ["bug", "error", "exception", "broken", "failing"]):
            intent = "BUG_REPORT"
        elif any(w in lower for w in ["feature", "suggestion", "would like", "enhancement", "request"]):
            intent = "FEATURE_REQUEST"
        elif any(w in lower for w in ["poor service", "angry", "terrible", "bad service", "unacceptable", "not fixed"]):
            intent = "SERVICE_COMPLAINT"

        return {
            "agent": cls.name,
            "intent": intent,
            "summary": subject,
            "keywords": keywords,
            "symptoms": symptoms,
            "urgency_signals": detected_urgency
        }
