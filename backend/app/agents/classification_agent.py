from typing import Dict, Any, Optional
from app.services.ai_service import call_openai_structured, get_ai_mode

VALID_CATEGORIES = [
    "GENERAL", "TECHNICAL", "BILLING", "ACCOUNT", "LOGIN", 
    "PAYMENT", "PRODUCT", "SERVICE", "BUG", "FEATURE_REQUEST", 
    "COMPLAINT", "OTHER"
]

class ClassificationAgent:
    """
    AGENT 2 — CLASSIFICATION AGENT
    Responsibilities:
    - Determine category
    - Determine priority (LOW, MEDIUM, HIGH, CRITICAL)
    - Determine severity (LOW, MEDIUM, HIGH, CRITICAL)
    - Detect sentiment (POSITIVE, NEUTRAL, NEGATIVE)
    - Calculate confidence score (0.0 to 1.0)
    """
    name = "Classification Agent"

    @classmethod
    def process(
        cls, 
        subject: str, 
        description: str, 
        intake_data: Dict[str, Any], 
        hint_category: Optional[str] = None
    ) -> Dict[str, Any]:
        text = f"{subject} {description}".strip()
        lower = text.lower()

        # Try OpenAI if configured
        if get_ai_mode() == "OPENAI":
            prompt = (
                f"Subject: {subject}\n"
                f"Description: {description}\n"
                f"Intake Info: {intake_data}\n"
                f"User Hint Category: {hint_category or 'None'}"
            )
            system_msg = (
                "You are a Classification Agent for an enterprise customer support platform. "
                "Classify the ticket into category, priority, severity, and sentiment. "
                f"Allowed categories: {VALID_CATEGORIES}. "
                "Allowed priority & severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']. "
                "Allowed sentiment: ['POSITIVE', 'NEUTRAL', 'NEGATIVE']. "
                "Confidence should be a float between 0.0 and 1.0."
            )
            schema = {
                "category": "LOGIN",
                "priority": "MEDIUM",
                "severity": "MEDIUM",
                "sentiment": "NEUTRAL",
                "confidence": 0.92
            }
            result = call_openai_structured(prompt, system_msg, schema)
            if result and result.get("category") in VALID_CATEGORIES:
                cat = result.get("category", "GENERAL")
                prio = result.get("priority", "MEDIUM")
                sev = result.get("severity", "MEDIUM")
                sent = result.get("sentiment", "NEUTRAL")
                conf = float(result.get("confidence", 0.85))
                return {
                    "agent": cls.name,
                    "category": cat,
                    "priority": prio,
                    "severity": sev,
                    "sentiment": sent,
                    "confidence": conf
                }

        # Deterministic Fallback Logic
        category = "GENERAL"
        priority = "MEDIUM"
        severity = "MEDIUM"
        sentiment = "NEUTRAL"
        confidence = 0.85

        # 1. Sentiment detection
        negative_words = [
            "terrible", "worst", "awful", "horrible", "angry", "furious", 
            "unacceptable", "broken", "useless", "crash", "crashing", 
            "not fixed", "three days", "fraud", "scam", "disappointed", "poor"
        ]
        positive_words = [
            "excellent", "great", "awesome", "good", "thank", "thanks", 
            "appreciate", "love", "wonderful", "fantastic", "helpful"
        ]

        neg_count = sum(1 for w in negative_words if w in lower)
        pos_count = sum(1 for w in positive_words if w in lower)

        if neg_count > pos_count and neg_count >= 1:
            sentiment = "NEGATIVE"
        elif pos_count > neg_count and pos_count >= 1:
            sentiment = "POSITIVE"
        else:
            sentiment = "NEUTRAL"

        # 2. Category detection
        if any(w in lower for w in ["password", "cannot login", "login", "sign in", "auth", "mfa", "2fa", "locked out"]):
            category = "LOGIN"
            confidence = 0.94
        elif any(w in lower for w in ["charged twice", "charge", "refund", "receipt", "invoice", "double payment", "overcharge"]):
            category = "BILLING"
            confidence = 0.92
        elif any(w in lower for w in ["payment", "credit card", "debit", "paypal", "stripe", "transaction failed"]):
            category = "PAYMENT"
            confidence = 0.90
        elif any(w in lower for w in ["entire application is down", "system down", "outage", "server down", "crash", "500 internal"]):
            category = "TECHNICAL"
            confidence = 0.96
        elif any(w in lower for w in ["account settings", "delete account", "email update", "profile update"]):
            category = "ACCOUNT"
            confidence = 0.88
        elif any(w in lower for w in ["feature request", "would be great if", "can you add", "roadmap", "suggestion"]):
            category = "FEATURE_REQUEST"
            confidence = 0.89
        elif any(w in lower for w in ["bug", "glitch", "error code", "unexpected behavior"]):
            category = "BUG"
            confidence = 0.88
        elif any(w in lower for w in ["poor service", "unhelpful", "agent was rude", "complaint"]):
            category = "COMPLAINT"
            confidence = 0.91
        elif hint_category and hint_category.upper() in VALID_CATEGORIES:
            category = hint_category.upper()
            confidence = 0.80

        # 3. Severity & Priority detection
        # Mandatory CRITICAL conditions: outage / entire system down / catastrophic crash
        if any(w in lower for w in ["entire application is down", "nobody can access", "system down", "all users affected", "data loss", "security breach"]):
            priority = "CRITICAL"
            severity = "CRITICAL"
            confidence = 0.98
        elif any(w in lower for w in ["charged twice", "double payment", "double charge", "refund", "unauthorized transaction", "cannot process payroll"]):
            priority = "HIGH"
            severity = "HIGH"
            confidence = 0.92
        elif any(w in lower for w in ["crash", "crashing", "not fixed for three days", "urgent", "blocked", "payment failed"]):
            priority = "HIGH"
            severity = "HIGH"
        elif any(w in lower for w in ["feature request", "suggestion", "nice to have", "minor typo"]):
            priority = "LOW"
            severity = "LOW"
        elif category in ["LOGIN", "ACCOUNT"]:
            priority = "MEDIUM"
            severity = "MEDIUM"
        else:
            priority = "MEDIUM"
            severity = "MEDIUM"

        return {
            "agent": cls.name,
            "category": category,
            "priority": priority,
            "severity": severity,
            "sentiment": sentiment,
            "confidence": round(confidence, 2)
        }
