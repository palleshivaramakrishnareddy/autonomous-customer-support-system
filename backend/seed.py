import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User, Ticket, TicketMessage, Feedback, KnowledgeArticle, AIDecision, Notification
from app.auth import get_password_hash

def seed_database():
    print("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@example.com").first():
            print("Database already contains seed data. Skipping creation.")
            return

        print("Seeding Users...")
        # 1 Admin, 2 Agents, 5 Customers
        users_data = [
            {"name": "System Administrator", "email": "admin@example.com", "password": "Admin@123", "role": "ADMIN"},
            {"name": "Alex Mercer (Senior Agent)", "email": "agent@example.com", "password": "Agent@123", "role": "SUPPORT_AGENT"},
            {"name": "Jessica Taylor (Support Agent)", "email": "agent2@example.com", "password": "Agent@123", "role": "SUPPORT_AGENT"},
            {"name": "John Doe", "email": "customer@example.com", "password": "Customer@123", "role": "CUSTOMER"},
            {"name": "Sarah Connor", "email": "sarah@example.com", "password": "Customer@123", "role": "CUSTOMER"},
            {"name": "Michael Chang", "email": "michael@example.com", "password": "Customer@123", "role": "CUSTOMER"},
            {"name": "Emily Watson", "email": "emily@example.com", "password": "Customer@123", "role": "CUSTOMER"},
            {"name": "David Miller", "email": "david@example.com", "password": "Customer@123", "role": "CUSTOMER"},
        ]

        user_objects = {}
        for u in users_data:
            user = User(
                name=u["name"],
                email=u["email"],
                password_hash=get_password_hash(u["password"]),
                role=u["role"],
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=14)
            )
            db.add(user)
            db.flush()
            user_objects[u["email"]] = user

        print("Seeding Knowledge Base Articles...")
        articles_data = [
            {
                "title": "How to Reset Your Account Password",
                "category": "LOGIN",
                "keywords": "password, login, reset, credentials, sign in, auth",
                "content": "To reset your password:\n1. Click 'Forgot Password' on the login screen.\n2. Enter your account email address.\n3. Click the secure link received in your inbox within 15 minutes.\n4. Choose a strong password containing at least 8 characters, a number, and a symbol."
            },
            {
                "title": "Resolving Payment Failures and Declined Cards",
                "category": "PAYMENT",
                "keywords": "payment, declined, credit card, failed, stripe, checkout",
                "content": "Payment failures typically occur due to:\n1. Insufficient funds or card limits.\n2. Bank 3D-Secure authentication timeout.\n3. Incorrect billing address or CVV code.\nResolution: Update your card details in Account Settings > Billing, or contact your bank to authorize the transaction."
            },
            {
                "title": "Double Charges and Refund Policy",
                "category": "BILLING",
                "keywords": "refund, double charge, charged twice, overcharge, invoice, money back",
                "content": "If you notice a duplicate charge on your credit card statement:\n1. Pending authorizations usually clear automatically within 3-5 business days.\n2. If both charges have settled, please provide the transaction reference numbers.\n3. Our Finance team processes refunds within 24-48 business hours back to the original payment method."
            },
            {
                "title": "Account Locked Out or 2FA Security Challenge",
                "category": "ACCOUNT",
                "keywords": "locked, lockout, 2fa, mfa, security, authenticator",
                "content": "Accounts are temporarily locked after 5 consecutive failed login attempts for security.\nResolution: Wait 15 minutes for automatic unlock, or use your backup 2FA recovery code. If you lost your authenticator device, a Support Specialist must verify government ID."
            },
            {
                "title": "Clearing Browser Cache & Technical Troubleshooting",
                "category": "TECHNICAL",
                "keywords": "crash, cache, browser, slow, lag, error, cookies, technical",
                "content": "For unexpected UI glitches or rendering problems:\n1. Perform a hard refresh using Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac).\n2. Clear browser cookies and site data for this domain.\n3. Disable third-party ad-blockers or browser extensions.\n4. Ensure you are using the latest version of Chrome, Firefox, or Edge."
            },
            {
                "title": "Submitting Feature Requests and Product Suggestions",
                "category": "FEATURE_REQUEST",
                "keywords": "feature request, roadmap, suggestion, idea, enhancement",
                "content": "We review customer suggestions weekly. Submitted feature requests are categorized and reviewed by the Product Management Committee. Track our public roadmap at roadmap.example.com to vote on planned features."
            },
            {
                "title": "Subscription Management and Plan Upgrades",
                "category": "BILLING",
                "keywords": "subscription, upgrade, plan, pro, enterprise, cancel",
                "content": "You can change your subscription tier anytime from Account Settings > Subscription. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of the current billing cycle."
            },
            {
                "title": "Application Outages & Service Health Alerts",
                "category": "TECHNICAL",
                "keywords": "outage, down, service down, maintenance, offline, server",
                "content": "During suspected service outages, check status.example.com for live incident reports. Our Site Reliability Engineering (SRE) team operates 24/7 with automatic failover across multi-region clusters."
            }
        ]

        for art in articles_data:
            kb = KnowledgeArticle(
                title=art["title"],
                category=art["category"],
                keywords=art["keywords"],
                content=art["content"],
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=30),
                updated_at=datetime.datetime.utcnow() - datetime.timedelta(days=10)
            )
            db.add(kb)

        db.flush()

        print("Seeding Tickets, Messages, AI Decisions & Feedbacks...")
        # 10 realistic tickets
        tickets_seed = [
            {
                "customer": "customer@example.com",
                "agent": None,
                "ticket_number": "TICK-20260901-1001",
                "subject": "I cannot login because my password is not working",
                "description": "I tried entering my password several times this morning but the system rejects it. I need access to review my reports.",
                "category": "LOGIN",
                "priority": "MEDIUM",
                "severity": "MEDIUM",
                "sentiment": "NEUTRAL",
                "status": "AI_RESPONDED",
                "ai_confidence": 0.94,
                "ai_resolution": "Autonomous resolution approved. Provided password reset protocol and knowledge article guide.",
                "days_ago": 7,
                "resolved": False,
                "decisions": [
                    ("Intake Agent", "INTAKE_COMPLETED", "Extracted intent: ACCOUNT_LOGIN_ASSISTANCE. Symptoms: Authentication failure.", 0.92),
                    ("Classification Agent", "ISSUE_CLASSIFIED", "Classified as LOGIN | Priority: MEDIUM | Severity: MEDIUM | Sentiment: NEUTRAL.", 0.94),
                    ("Knowledge Agent", "KNOWLEDGE_SEARCHED", "Matched article 'How to Reset Your Account Password' (Score: 85).", 0.90),
                    ("Resolution Agent", "SOLUTION_GENERATED", "Autonomous password reset instructions generated.", 0.92),
                    ("Supervisor Agent", "AUTONOMOUS_RESOLVE", "Autonomous resolution approved: verified knowledge base solution matched with high confidence (0.92).", 0.92)
                ],
                "messages": [
                    ("CUSTOMER", "I tried entering my password several times this morning but the system rejects it. I need access to review my reports."),
                    ("AI", "Hello John! Here is the recommended solution based on our verified knowledge base:\n\n**How to Reset Your Account Password**\n1. Click 'Forgot Password' on the login screen.\n2. Enter your account email address.\n3. Click the secure link received in your inbox within 15 minutes.\n4. Choose a strong password containing at least 8 characters, a number, and a symbol.\n\nIf this resolves your issue, please feel free to leave us feedback.")
                ]
            },
            {
                "customer": "sarah@example.com",
                "agent": "agent@example.com",
                "ticket_number": "TICK-20260902-1002",
                "subject": "I was charged twice for the same transaction and need a refund",
                "description": "My credit card statement shows two identical charges of $49.00 on September 1st. Please refund the duplicate charge as soon as possible.",
                "category": "BILLING",
                "priority": "HIGH",
                "severity": "HIGH",
                "sentiment": "NEGATIVE",
                "status": "IN_PROGRESS",
                "ai_confidence": 0.92,
                "ai_resolution": "Escalated to human support: Sensitive billing / financial transaction dispute.",
                "days_ago": 6,
                "resolved": False,
                "decisions": [
                    ("Intake Agent", "INTAKE_COMPLETED", "Extracted intent: BILLING_REFUND_INQUIRY. Symptoms: Duplicate billing / overcharge.", 0.92),
                    ("Classification Agent", "ISSUE_CLASSIFIED", "Classified as BILLING | Priority: HIGH | Severity: HIGH | Sentiment: NEGATIVE.", 0.92),
                    ("Knowledge Agent", "KNOWLEDGE_SEARCHED", "Matched article 'Double Charges and Refund Policy' (Score: 70).", 0.85),
                    ("Resolution Agent", "SOLUTION_GENERATED", "Financial refund requires human payment verification.", 0.90),
                    ("Supervisor Agent", "ESCALATE", "Escalated to human support: Sensitive billing / financial transaction dispute.", 0.90)
                ],
                "messages": [
                    ("CUSTOMER", "My credit card statement shows two identical charges of $49.00 on September 1st. Please refund the duplicate charge as soon as possible."),
                    ("SYSTEM", "Your ticket has been forwarded to our support team for specialist assistance.\nReason: Sensitive billing transaction dispute requires payment record inspection."),
                    ("AGENT", "Hi Sarah, Alex here from Finance Support. I located transaction #TX-9842 and confirmed the second charge was a duplicate pending authorization. I have initiated a full refund of $49.00 back to your card.")
                ]
            },
            {
                "customer": "michael@example.com",
                "agent": "agent@example.com",
                "ticket_number": "TICK-20260903-1003",
                "subject": "The entire application is down and nobody can access it",
                "description": "All our team members are receiving 500 internal server errors when trying to load the dashboard. This is completely blocking our operations!",
                "category": "TECHNICAL",
                "priority": "CRITICAL",
                "severity": "CRITICAL",
                "sentiment": "NEGATIVE",
                "status": "ASSIGNED",
                "ai_confidence": 0.98,
                "ai_resolution": "Mandatory escalation: Critical severity system event requires immediate human review.",
                "days_ago": 5,
                "resolved": False,
                "decisions": [
                    ("Intake Agent", "INTAKE_COMPLETED", "Extracted intent: CRITICAL_OUTAGE_REPORT. Symptoms: Service unavailability / system crash.", 0.98),
                    ("Classification Agent", "ISSUE_CLASSIFIED", "Classified as TECHNICAL | Priority: CRITICAL | Severity: CRITICAL | Sentiment: NEGATIVE.", 0.98),
                    ("Knowledge Agent", "KNOWLEDGE_SEARCHED", "Matched article 'Application Outages & Service Health Alerts'.", 0.80),
                    ("Supervisor Agent", "ESCALATE", "Mandatory escalation: Critical severity system event requires immediate human review.", 0.98)
                ],
                "messages": [
                    ("CUSTOMER", "All our team members are receiving 500 internal server errors when trying to load the dashboard. This is completely blocking our operations!"),
                    ("SYSTEM", "Your ticket has been forwarded to our support team for specialist assistance.\nReason: Mandatory escalation: Critical severity system event requires immediate human review.")
                ]
            },
            {
                "customer": "emily@example.com",
                "agent": "agent2@example.com",
                "ticket_number": "TICK-20260904-1004",
                "subject": "Payment failed during renewal checkout",
                "description": "I attempted to renew our team annual subscription with our Mastercard, but received payment error code 1042.",
                "category": "PAYMENT",
                "priority": "HIGH",
                "severity": "HIGH",
                "sentiment": "NEUTRAL",
                "status": "RESOLVED",
                "ai_confidence": 0.90,
                "ai_resolution": "Resolution provided by Support Agent after verifying bank 3D-secure challenge.",
                "days_ago": 4,
                "resolved": True,
                "decisions": [
                    ("Intake Agent", "INTAKE_COMPLETED", "Extracted intent: BILLING_REFUND_INQUIRY.", 0.90),
                    ("Classification Agent", "ISSUE_CLASSIFIED", "Classified as PAYMENT | Priority: HIGH | Severity: HIGH.", 0.90),
                    ("Supervisor Agent", "ESCALATE", "Escalated to human support: Payment gateway retry required.", 0.90)
                ],
                "messages": [
                    ("CUSTOMER", "I attempted to renew our team annual subscription with our Mastercard, but received payment error code 1042."),
                    ("AGENT", "Hello Emily, error 1042 indicates a bank fraud prevention hold. We re-sent the 3D-secure prompt, and the transaction has now settled successfully.")
                ],
                "feedback": (5, "Alex and Jessica were fantastic! Renewal went through seamlessly. Your service is excellent.")
            },
            {
                "customer": "david@example.com",
                "agent": "agent2@example.com",
                "ticket_number": "TICK-20260905-1005",
                "subject": "The application keeps crashing and support has not fixed it for three days",
                "description": "Whenever I click Export to CSV, the entire page freezes and crashes. I reached out earlier and nobody resolved this. Very frustrating.",
                "category": "BUG",
                "priority": "HIGH",
                "severity": "HIGH",
                "sentiment": "NEGATIVE",
                "status": "IN_PROGRESS",
                "ai_confidence": 0.91,
                "ai_resolution": "Escalated to engineering due to recurring application crash.",
                "days_ago": 3,
                "resolved": False,
                "decisions": [
                    ("Intake Agent", "INTAKE_COMPLETED", "Extracted intent: BUG_REPORT. Symptoms: UI crash on CSV export. Urgency: three days, not fixed.", 0.94),
                    ("Classification Agent", "ISSUE_CLASSIFIED", "Classified as BUG | Priority: HIGH | Severity: HIGH | Sentiment: NEGATIVE.", 0.91),
                    ("Supervisor Agent", "ESCALATE", "Escalated to human support: Persistent crash bug reported.", 0.91)
                ],
                "messages": [
                    ("CUSTOMER", "Whenever I click Export to CSV, the entire page freezes and crashes. I reached out earlier and nobody resolved this. Very frustrating."),
                    ("SYSTEM", "Your ticket has been forwarded to our support team for specialist assistance."),
                    ("AGENT", "Hi David, I sincerely apologize for the delay. Our engineering team identified a memory leak in the CSV streamer when exporting datasets over 5,000 rows. A patch is deploying now.")
                ]
            },
            {
                "customer": "customer@example.com",
                "agent": None,
                "ticket_number": "TICK-20260906-1006",
                "subject": "Feature request: Dark mode theme support",
                "description": "Would be wonderful if you could add a native dark mode toggle for late night work sessions.",
                "category": "FEATURE_REQUEST",
                "priority": "LOW",
                "severity": "LOW",
                "sentiment": "POSITIVE",
                "status": "RESOLVED",
                "ai_confidence": 0.92,
                "ai_resolution": "Logged into product roadmap committee queue.",
                "days_ago": 3,
                "resolved": True,
                "decisions": [
                    ("Intake Agent", "INTAKE_COMPLETED", "Extracted intent: FEATURE_REQUEST.", 0.90),
                    ("Classification Agent", "ISSUE_CLASSIFIED", "Classified as FEATURE_REQUEST | Priority: LOW.", 0.92),
                    ("Supervisor Agent", "AUTONOMOUS_RESOLVE", "Autonomous resolution approved: standard support protocol applied.", 0.92)
                ],
                "messages": [
                    ("CUSTOMER", "Would be wonderful if you could add a native dark mode toggle for late night work sessions."),
                    ("AI", "Thank you for sharing your feedback and suggestion! We have logged your feature request for Dark Mode with our product engineering team for review in upcoming release cycles.")
                ],
                "feedback": (5, "Great autonomous response! Glad to hear dark mode is being considered.")
            },
            {
                "customer": "sarah@example.com",
                "agent": None,
                "ticket_number": "TICK-20260907-1007",
                "subject": "Account locked after entering incorrect 2FA",
                "description": "My phone battery died and I entered the wrong authenticator code three times. Now my account says locked.",
                "category": "ACCOUNT",
                "priority": "MEDIUM",
                "severity": "MEDIUM",
                "sentiment": "NEUTRAL",
                "status": "AI_RESPONDED",
                "ai_confidence": 0.89,
                "ai_resolution": "Provided 2FA lockout cooldown protocol and recovery guidance.",
                "days_ago": 2,
                "resolved": False,
                "decisions": [
                    ("Intake Agent", "INTAKE_COMPLETED", "Extracted intent: ACCOUNT_LOGIN_ASSISTANCE.", 0.90),
                    ("Classification Agent", "ISSUE_CLASSIFIED", "Classified as ACCOUNT | Priority: MEDIUM.", 0.89),
                    ("Knowledge Agent", "KNOWLEDGE_SEARCHED", "Matched article 'Account Locked Out or 2FA Security Challenge'.", 0.90),
                    ("Supervisor Agent", "AUTONOMOUS_RESOLVE", "Autonomous resolution approved: verified knowledge base solution matched.", 0.89)
                ],
                "messages": [
                    ("CUSTOMER", "My phone battery died and I entered the wrong authenticator code three times. Now my account says locked."),
                    ("AI", "Hello Sarah! According to our security protocol, temporary 2FA lockouts automatically reset after a 15-minute cooldown. Please wait 15 minutes and log in using your authenticator once charged.")
                ]
            },
            {
                "customer": "michael@example.com",
                "agent": "agent@example.com",
                "ticket_number": "TICK-20260908-1008",
                "subject": "Poor service experience regarding previous ticket",
                "description": "I spoke with an agent yesterday who closed my inquiry without resolving the underlying database error.",
                "category": "COMPLAINT",
                "priority": "HIGH",
                "severity": "HIGH",
                "sentiment": "NEGATIVE",
                "status": "WAITING_FOR_CUSTOMER",
                "ai_confidence": 0.92,
                "ai_resolution": "Escalated to Senior Agent Alex Mercer for supervisory review.",
                "days_ago": 1,
                "resolved": False,
                "decisions": [
                    ("Intake Agent", "INTAKE_COMPLETED", "Extracted intent: SERVICE_COMPLAINT.", 0.92),
                    ("Classification Agent", "ISSUE_CLASSIFIED", "Classified as COMPLAINT | Priority: HIGH | Sentiment: NEGATIVE.", 0.92),
                    ("Supervisor Agent", "ESCALATE", "Escalated to human support: Service quality complaint.", 0.92)
                ],
                "messages": [
                    ("CUSTOMER", "I spoke with an agent yesterday who closed my inquiry without resolving the underlying database error."),
                    ("AGENT", "Hello Michael, I am the Support Lead. I have reopened your case and am personally overseeing the database correction with our lead DBA.")
                ]
            },
            {
                "customer": "emily@example.com",
                "agent": None,
                "ticket_number": "TICK-20260908-1009",
                "subject": "Browser lagging on analytics page",
                "description": "Charts take over 10 seconds to render in Firefox. Is there a way to speed this up?",
                "category": "TECHNICAL",
                "priority": "LOW",
                "severity": "LOW",
                "sentiment": "NEUTRAL",
                "status": "AI_RESPONDED",
                "ai_confidence": 0.88,
                "ai_resolution": "Provided browser cache clearing and hardware acceleration recommendations.",
                "days_ago": 1,
                "resolved": False,
                "decisions": [
                    ("Intake Agent", "INTAKE_COMPLETED", "Extracted intent: GENERAL_ASSISTANCE.", 0.88),
                    ("Classification Agent", "ISSUE_CLASSIFIED", "Classified as TECHNICAL | Priority: LOW.", 0.88),
                    ("Knowledge Agent", "KNOWLEDGE_SEARCHED", "Matched article 'Clearing Browser Cache & Technical Troubleshooting'.", 0.85),
                    ("Supervisor Agent", "AUTONOMOUS_RESOLVE", "Autonomous resolution approved.", 0.88)
                ],
                "messages": [
                    ("CUSTOMER", "Charts take over 10 seconds to render in Firefox. Is there a way to speed this up?"),
                    ("AI", "Hello Emily! Please try performing a hard cache clear (Ctrl + Shift + R) and verify that 'Hardware Acceleration' is enabled in your Firefox settings.")
                ]
            },
            {
                "customer": "david@example.com",
                "agent": "agent2@example.com",
                "ticket_number": "TICK-20260909-1010",
                "subject": "Need invoice with company tax VAT ID",
                "description": "Please regenerate our August invoice to include our registered corporate VAT ID GB99281726.",
                "category": "BILLING",
                "priority": "MEDIUM",
                "severity": "MEDIUM",
                "sentiment": "NEUTRAL",
                "status": "RESOLVED",
                "ai_confidence": 0.86,
                "ai_resolution": "Updated invoice dispatched by Support Agent.",
                "days_ago": 0,
                "resolved": True,
                "decisions": [
                    ("Intake Agent", "INTAKE_COMPLETED", "Extracted intent: BILLING_REFUND_INQUIRY.", 0.86),
                    ("Classification Agent", "ISSUE_CLASSIFIED", "Classified as BILLING | Priority: MEDIUM.", 0.86),
                    ("Supervisor Agent", "ESCALATE", "Invoice customization requires human processing.", 0.86)
                ],
                "messages": [
                    ("CUSTOMER", "Please regenerate our August invoice to include our registered corporate VAT ID GB99281726."),
                    ("AGENT", "Hi David, I have updated your billing profile and attached the updated August invoice with your VAT ID.")
                ],
                "feedback": (4, "Prompt response and invoice was corrected quickly.")
            }
        ]

        for ts in tickets_seed:
            cust = user_objects[ts["customer"]]
            ag = user_objects[ts["agent"]] if ts["agent"] else None
            
            created_time = datetime.datetime.utcnow() - datetime.timedelta(days=ts["days_ago"], hours=2)
            resolved_time = (created_time + datetime.timedelta(hours=4)) if ts["resolved"] else None

            ticket = Ticket(
                ticket_number=ts["ticket_number"],
                customer_id=cust.id,
                assigned_agent_id=ag.id if ag else None,
                subject=ts["subject"],
                description=ts["description"],
                category=ts["category"],
                priority=ts["priority"],
                severity=ts["severity"],
                sentiment=ts["sentiment"],
                status=ts["status"],
                ai_confidence=ts["ai_confidence"],
                ai_resolution=ts["ai_resolution"],
                created_at=created_time,
                updated_at=resolved_time or created_time,
                resolved_at=resolved_time
            )
            db.add(ticket)
            db.flush()

            # Messages
            for m_type, m_text in ts["messages"]:
                s_id = cust.id if m_type == "CUSTOMER" else (ag.id if m_type == "AGENT" and ag else None)
                msg = TicketMessage(
                    ticket_id=ticket.id,
                    sender_id=s_id,
                    sender_type=m_type,
                    message=m_text,
                    is_internal=False,
                    created_at=created_time + datetime.timedelta(minutes=10)
                )
                db.add(msg)

            # AI decisions
            for ag_name, act, reas, conf in ts["decisions"]:
                db.add(AIDecision(
                    ticket_id=ticket.id,
                    agent_name=ag_name,
                    action=act,
                    reasoning_summary=reas,
                    confidence=conf,
                    created_at=created_time + datetime.timedelta(seconds=5)
                ))

            # Feedback if present
            if "feedback" in ts:
                rating, comment = ts["feedback"]
                sent = "POSITIVE" if rating >= 4 else ("NEGATIVE" if rating <= 2 else "NEUTRAL")
                db.add(Feedback(
                    ticket_id=ticket.id,
                    customer_id=cust.id,
                    rating=rating,
                    comment=comment,
                    sentiment=sent,
                    created_at=resolved_time or datetime.datetime.utcnow()
                ))

        print("Seeding initial notifications...")
        db.add(Notification(
            user_id=user_objects["customer@example.com"].id,
            message="Welcome to Autonomous AI Customer Support! Submit tickets anytime for 24/7 AI-driven resolution.",
            is_read=False,
            created_at=datetime.datetime.utcnow()
        ))
        db.add(Notification(
            user_id=user_objects["agent@example.com"].id,
            message="You have 2 escalated high-priority tickets awaiting triage.",
            is_read=False,
            created_at=datetime.datetime.utcnow()
        ))
        db.add(Notification(
            user_id=user_objects["admin@example.com"].id,
            message="System Health: 10 active tickets tracked. Multi-agent AI engine operational in Fallback mode.",
            is_read=False,
            created_at=datetime.datetime.utcnow()
        ))

        db.commit()
        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
