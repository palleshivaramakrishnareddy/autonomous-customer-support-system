import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models import User, Ticket, KnowledgeArticle, Feedback
from app.auth import get_password_hash
from app.agents.orchestrator import AgentOrchestrator
from app.agents.intake_agent import IntakeAgent
from app.agents.classification_agent import ClassificationAgent
from app.agents.knowledge_agent import KnowledgeAgent
from app.agents.resolution_agent import ResolutionAgent
from app.agents.escalation_agent import EscalationAgent
from app.agents.supervisor_agent import SupervisorAgent
from app.agents.feedback_agent import FeedbackAgent

# In-memory test SQLite DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_support.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Create admin, agent, customer
    admin = User(
        name="Test Admin",
        email="admin@test.com",
        password_hash=get_password_hash("Admin@123"),
        role="ADMIN"
    )
    agent = User(
        name="Test Agent",
        email="agent@test.com",
        password_hash=get_password_hash("Agent@123"),
        role="SUPPORT_AGENT"
    )
    customer = User(
        name="Test Customer",
        email="customer@test.com",
        password_hash=get_password_hash("Customer@123"),
        role="CUSTOMER"
    )
    customer2 = User(
        name="Customer Two",
        email="customer2@test.com",
        password_hash=get_password_hash("Customer@123"),
        role="CUSTOMER"
    )

    db.add_all([admin, agent, customer, customer2])

    # Add knowledge articles
    kb1 = KnowledgeArticle(
        title="How to Reset Your Account Password",
        category="LOGIN",
        keywords="password, login, reset, credentials",
        content="Click forgot password on login screen, verify via email token."
    )
    kb2 = KnowledgeArticle(
        title="Double Charges and Refund Policy",
        category="BILLING",
        keywords="refund, double charge, charged twice, overcharge",
        content="Finance team will audit and reverse duplicate charges within 24-48 hours."
    )
    kb3 = KnowledgeArticle(
        title="System Outage Procedures",
        category="TECHNICAL",
        keywords="outage, down, server, crash",
        content="SRE team immediately notified of system-wide downtime."
    )
    db.add_all([kb1, kb2, kb3])
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_support.db"):
        try:
            os.remove("./test_support.db")
        except Exception:
            pass

def get_auth_token(email: str, password: str = "Customer@123"):
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]

# --- Authentication Tests ---
def test_auth_registration_and_login():
    reg_resp = client.post("/api/auth/register", json={
        "name": "New User",
        "email": "newuser@test.com",
        "password": "Password@123"
    })
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newuser@test.com"

    # Login
    login_resp = client.post("/api/auth/login", json={
        "email": "newuser@test.com",
        "password": "Password@123"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # /me
    token = login_resp.json()["access_token"]
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["name"] == "New User"

# --- SCENARIO TEST 1 ---
def test_scenario_1_login_password_issue():
    """
    TEST 1: "I cannot login because my password is not working."
    Expected: LOGIN/ACCOUNT, MEDIUM priority, AI solution
    """
    token = get_auth_token("customer@test.com")
    resp = client.post(
        "/api/tickets",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "subject": "I cannot login because my password is not working",
            "description": "I tried entering my credentials this morning but password is not accepted."
        }
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["category"] in ["LOGIN", "ACCOUNT"]
    assert data["priority"] == "MEDIUM"
    assert data["status"] == "AI_RESPONDED"
    assert data["ai_confidence"] >= 0.75
    assert len(data["messages"]) >= 2  # Customer message + AI response
    assert any(m["sender_type"] == "AI" for m in data["messages"])

# --- SCENARIO TEST 2 ---
def test_scenario_2_double_billing_refund():
    """
    TEST 2: "I was charged twice for the same transaction and need a refund."
    Expected: BILLING/PAYMENT, HIGH priority, Possible escalation
    """
    token = get_auth_token("customer@test.com")
    resp = client.post(
        "/api/tickets",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "subject": "I was charged twice for the same transaction and need a refund",
            "description": "My credit card statement shows two identical charges of $50 on transaction TX-1002. Please refund immediately."
        }
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["category"] in ["BILLING", "PAYMENT"]
    assert data["priority"] == "HIGH"
    assert data["status"] in ["ESCALATED", "ASSIGNED"]
    assert data["assigned_agent_id"] is not None

# --- SCENARIO TEST 3 ---
def test_scenario_3_system_outage():
    """
    TEST 3: "The entire application is down and nobody can access it."
    Expected: TECHNICAL, CRITICAL, Mandatory escalation
    """
    token = get_auth_token("customer@test.com")
    resp = client.post(
        "/api/tickets",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "subject": "The entire application is down and nobody can access it",
            "description": "All team members getting 500 internal server error. Total outage across company."
        }
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["category"] == "TECHNICAL"
    assert data["priority"] == "CRITICAL"
    assert data["severity"] == "CRITICAL"
    assert data["status"] in ["ESCALATED", "ASSIGNED"]

# --- SCENARIO TEST 4 ---
def test_scenario_4_positive_feedback():
    """
    TEST 4: "Your service is excellent."
    Expected: POSITIVE feedback
    """
    db = TestingSessionLocal()
    analysis = FeedbackAgent.process(db, ticket_id=1, rating=5, comment="Your service is excellent.")
    db.close()
    assert analysis["sentiment"] == "POSITIVE"
    assert analysis["is_complaint"] == False

# --- SCENARIO TEST 5 ---
def test_scenario_5_recurring_crashing_complaint():
    """
    TEST 5: "The application keeps crashing and support has not fixed it for three days."
    Expected: NEGATIVE sentiment, Potential recurring issue
    """
    token = get_auth_token("customer@test.com")
    resp = client.post(
        "/api/tickets",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "subject": "Application crashing constantly",
            "description": "The application keeps crashing and support has not fixed it for three days."
        }
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["sentiment"] == "NEGATIVE"
    assert data["status"] in ["ESCALATED", "ASSIGNED"]

# --- Ticket Authorization & Access Control ---
def test_ticket_authorization():
    cust1_token = get_auth_token("customer@test.com")
    cust2_token = get_auth_token("customer2@test.com")

    # Cust1 creates ticket
    resp = client.post(
        "/api/tickets",
        headers={"Authorization": f"Bearer {cust1_token}"},
        json={"subject": "Private ticket", "description": "Customer 1 private details"}
    )
    ticket_id = resp.json()["id"]

    # Cust2 tries to view Cust1's ticket -> Should return 403 Forbidden
    cust2_resp = client.get(
        f"/api/tickets/{ticket_id}",
        headers={"Authorization": f"Bearer {cust2_token}"}
    )
    assert cust2_resp.status_code == 403

    # Admin can view Cust1's ticket
    admin_token = get_auth_token("admin@test.com", "Admin@123")
    admin_resp = client.get(
        f"/api/tickets/{ticket_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_resp.status_code == 200

# --- Dashboard Stats Test ---
def test_dashboard_stats():
    admin_token = get_auth_token("admin@test.com", "Admin@123")
    resp = client.get("/api/dashboard/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    stats = resp.json()
    assert stats["total_tickets"] >= 4
    assert "ai_resolution_rate" in stats
    assert "ai_mode" in stats
