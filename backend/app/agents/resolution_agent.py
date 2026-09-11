from typing import Dict, Any, Optional
from app.services.ai_service import call_openai_structured, get_ai_mode

class ResolutionAgent:
    """
    AGENT 4 — RESOLUTION AGENT
    Responsibilities:
    - Analyze customer issue
    - Use classification results
    - Use knowledge base results
    - Generate a helpful, actionable response
    - Decide whether the issue is automatically resolvable
    - Return resolution confidence
    """
    name = "Resolution Agent"

    @classmethod
    def process(
        cls,
        subject: str,
        description: str,
        classification: Dict[str, Any],
        knowledge: Dict[str, Any]
    ) -> Dict[str, Any]:
        category = classification.get("category", "GENERAL")
        priority = classification.get("priority", "MEDIUM")
        best_match = knowledge.get("best_match")

        # Check if inherently unresolvable by AI
        unresolvable_categories = ["BILLING", "PAYMENT"]
        is_critical = priority == "CRITICAL"
        is_billing = category in unresolvable_categories and any(
            w in f"{subject} {description}".lower() for w in ["refund", "double", "charged twice", "unauthorized"]
        )
        is_outage = is_critical or any(
            w in f"{subject} {description}".lower() for w in ["down", "crash", "nobody can access"]
        )

        # Try OpenAI if configured
        if get_ai_mode() == "OPENAI":
            article_context = f"Title: {best_match['title']}\nContent: {best_match['content']}" if best_match else "No direct article found."
            prompt = (
                f"Customer Subject: {subject}\n"
                f"Customer Message: {description}\n"
                f"Category: {category}, Priority: {priority}\n"
                f"Matched Knowledge Base Article:\n{article_context}\n"
                f"System rules: Critical outages or financial refund disputes MUST NOT be marked is_resolvable=true."
            )
            system_msg = (
                "You are an enterprise AI Support Resolution Agent. "
                "Synthesize a friendly, precise, and professional customer resolution. "
                "Decide if this issue can be safely and completely resolved autonomously (is_resolvable: bool). "
                "If it requires human approval (financial refunds, outages, database updates), set is_resolvable: false."
            )
            schema = {
                "response": "Helpful customer response here...",
                "is_resolvable": True,
                "confidence": 0.92,
                "recommended_action": "AUTONOMOUS_RESOLVE or ESCALATE_TO_AGENT"
            }
            result = call_openai_structured(prompt, system_msg, schema)
            if result and "response" in result:
                # Enforce hard safety override
                safe_resolvable = result.get("is_resolvable", False) and not is_critical and not is_billing
                return {
                    "agent": cls.name,
                    "response": result.get("response"),
                    "is_resolvable": safe_resolvable,
                    "confidence": float(result.get("confidence", 0.85)),
                    "recommended_action": "AUTONOMOUS_RESOLVE" if safe_resolvable else "ESCALATE_TO_AGENT"
                }

        # Deterministic Fallback Logic
        if is_critical or is_outage:
            response = (
                "We have detected a critical system issue impacting services. "
                "Our senior engineering and support teams have been alerted immediately. "
                "A dedicated specialist is actively investigating and will provide a status update shortly."
            )
            return {
                "agent": cls.name,
                "response": response,
                "is_resolvable": False,
                "confidence": 0.95,
                "recommended_action": "ESCALATE_CRITICAL"
            }

        if is_billing:
            response = (
                "Thank you for reaching out regarding your billing transaction. "
                "Because your request involves monetary transactions and refund processing, "
                "our Billing Specialists must personally review payment records to process any adjustment. "
                "Your ticket has been escalated to our Finance Support Team with high priority."
            )
            return {
                "agent": cls.name,
                "response": response,
                "is_resolvable": False,
                "confidence": 0.92,
                "recommended_action": "ESCALATE_BILLING"
            }

        if best_match:
            response = (
                f"Hello! Here is the recommended solution based on our verified knowledge base:\n\n"
                f"**{best_match['title']}**\n\n"
                f"{best_match['content']}\n\n"
                "If this resolves your issue, please feel free to close the ticket or leave us feedback. "
                "If you require further assistance, simply reply and a specialist will assist you."
            )
            return {
                "agent": cls.name,
                "response": response,
                "is_resolvable": True,
                "confidence": 0.90,
                "recommended_action": "AUTONOMOUS_RESOLVE"
            }

        # Fallback standard response
        if category == "LOGIN":
            response = (
                "To resolve your login issue, please try the following steps:\n"
                "1. Click on the 'Forgot Password' link on the login page.\n"
                "2. Enter your registered email address and submit.\n"
                "3. Check your inbox and spam folder for the password reset verification code.\n"
                "4. Ensure your browser cookies and cache are cleared.\n\n"
                "If your account remains inaccessible, please let us know so a support agent can verify your identity."
            )
            is_res = True
            conf = 0.88
        elif category == "FEATURE_REQUEST":
            response = (
                "Thank you for sharing your feedback and suggestion! "
                "We have logged your feature request with our product engineering team for review in upcoming release cycles."
            )
            is_res = True
            conf = 0.90
        else:
            response = (
                "Thank you for contacting support. We have received your request and classified it. "
                "A support specialist has been assigned to review your issue in detail and provide assistance."
            )
            is_res = False
            conf = 0.70

        return {
            "agent": cls.name,
            "response": response,
            "is_resolvable": is_res,
            "confidence": conf,
            "recommended_action": "AUTONOMOUS_RESOLVE" if is_res else "ESCALATE_TO_AGENT"
        }
