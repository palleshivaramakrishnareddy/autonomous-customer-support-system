import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import Feedback, Notification, User
from app.services.ai_service import call_openai_structured, get_ai_mode

class FeedbackAgent:
    """
    AGENT 6 — FEEDBACK AGENT
    Responsibilities:
    - Analyze customer feedback
    - Detect sentiment (POSITIVE, NEUTRAL, NEGATIVE)
    - Identify complaints
    - Identify recurring issues & patterns
    - Generate recommendations
    - Alert admins on negative feedback
    """
    name = "Feedback Agent"

    @classmethod
    def process(
        cls,
        db: Session,
        ticket_id: int,
        rating: int,
        comment: str
    ) -> Dict[str, Any]:
        comment_str = comment or ""
        lower = comment_str.lower()

        # Determine sentiment
        sentiment = "NEUTRAL"
        if rating >= 4:
            sentiment = "POSITIVE"
        elif rating <= 2:
            sentiment = "NEGATIVE"
        else:
            # rating 3, check text
            if any(w in lower for w in ["great", "good", "thanks", "helpful", "resolved"]):
                sentiment = "POSITIVE"
            elif any(w in lower for w in ["bad", "slow", "unhelpful", "poor", "crash", "failed"]):
                sentiment = "NEGATIVE"

        # Try OpenAI if configured
        if get_ai_mode() == "OPENAI" and comment_str:
            prompt = f"Customer Rating: {rating}/5\nCustomer Comment: {comment_str}"
            system_msg = (
                "You are an enterprise AI Feedback Agent. "
                "Analyze the customer's review for sentiment (POSITIVE, NEUTRAL, NEGATIVE), "
                "extract complaint points, and detect any recurring operational issues."
            )
            schema = {
                "sentiment": sentiment,
                "is_complaint": rating <= 2,
                "key_issues": ["issue 1"],
                "recommendation": "recommendation here"
            }
            result = call_openai_structured(prompt, system_msg, schema)
            if result and "sentiment" in result:
                sentiment = result.get("sentiment", sentiment)

        is_complaint = sentiment == "NEGATIVE" or rating <= 2
        
        # Recurring issue clues in comment
        recurring_signals = []
        if any(w in lower for w in ["again", "still", "recurring", "keeps crashing", "three days", "always"]):
            recurring_signals.append("Persistence/Recurring pattern mentioned by user")

        # If negative feedback, create admin notification
        if sentiment == "NEGATIVE":
            admins = db.query(User).filter(User.role == "ADMIN").all()
            for admin in admins:
                notif = Notification(
                    user_id=admin.id,
                    ticket_id=ticket_id,
                    message=f"Negative feedback received (Rating: {rating}/5): '{comment_str[:60]}...'"
                )
                db.add(notif)
            db.commit()

        return {
            "agent": cls.name,
            "sentiment": sentiment,
            "rating": rating,
            "is_complaint": is_complaint,
            "recurring_signals": recurring_signals,
            "recommendation": "Review support interaction and escalate to team lead" if is_complaint else "Standard resolution verified"
        }
