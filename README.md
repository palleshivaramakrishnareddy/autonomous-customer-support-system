# Autonomous AI Customer Support System for Issue Tracking, Management and Feedback

An enterprise-grade, full-stack, autonomous multi-agent customer support and issue management platform. The system leverages a 7-agent pipeline that ingests customer issues, determines intent, classifies severity, retrieves knowledge base solutions, evaluates escalation risk, and supervises actions in real-time with dual operational modes (**OpenAI Mode** and deterministic **Fallback Mode**).

---

## 1. Project Overview & Problem Statement

Traditional customer support platforms rely on static ticketing queues and rule-based ticket routing, resulting in lengthy resolution delays, manual triage overhead, and inconsistent customer experiences.

The **Autonomous AI Customer Support System** introduces true **Agentic AI** behavior to automate the complete issue lifecycle:
1. Instantly ingesting customer issues 24/7.
2. Extracting intent, symptoms, and urgency cues.
3. Classifying issues across 12 distinct categories, 4 priority tiers, and 4 severity levels.
4. Performing keyword and relevance matching against internal knowledge base articles.
5. Formulating safe, contextual resolution proposals.
6. Enforcing strict safety policies (CRITICAL issues and low-confidence predictions are mandatorily escalated).
7. Routing escalated issues to human support specialists.
8. Capturing CSAT feedback, analyzing sentiment, and detecting recurring problem clusters for administrators.

---

## 2. Multi-Agent AI Architecture

The system implements a 7-agent collaborative workflow using an autonomous 6-step loop:
`OBSERVE -> UNDERSTAND -> PLAN -> ACT -> VERIFY -> COMPLETE or ESCALATE`

```
                      +-------------------+
                      | CUSTOMER MESSAGE  |
                      +-------------------+
                                |
                                v
                      +-------------------+
                      |   INTAKE AGENT    |  (Extracts intent, symptoms, keywords)
                      +-------------------+
                                |
                                v
                      +-------------------+
                      |CLASSIFICATION AGT |  (Predicts category, priority, severity, sentiment)
                      +-------------------+
                                |
                                v
                      +-------------------+
                      |  KNOWLEDGE AGENT  |  (Searches SQLite knowledge base & ranks matches)
                      +-------------------+
                                |
                                v
                      +-------------------+
                      | RESOLUTION AGENT  |  (Synthesizes solution & evaluates autonomy feasibility)
                      +-------------------+
                                |
                                v
                      +-------------------+
                      | SUPERVISOR AGENT  |  (Safety gatekeeper & policy validator)
                      +-------------------+
                                |
                +---------------+---------------+
                |                               |
                v                               v
    [AUTONOMOUS RESOLVE]                   [ESCALATE]
                |                               |
                v                               v
       +------------------+           +--------------------+
       | CUSTOMER NOTIFIED|           | SUPPORT AGENT QUEUE|
       |  (AI_RESPONDED)  |           | (ASSIGNED/ESCALATE)|
       +------------------+           +--------------------+
                |                               |
                +---------------+---------------+
                                |
                                v
                      +-------------------+
                      |  FEEDBACK AGENT   |  (Analyzes post-resolution CSAT ratings)
                      +-------------------+
                                |
                                v
                      +-------------------+
                      |  ADMIN ANALYTICS  |  (Recurring issues, KPI metrics, charts)
                      +-------------------+
```

### Agent Roles:
1. **Intake Agent (`intake_agent.py`)**: Understands the customer's problem description, extracts key entities, symptoms, and identifies customer intent.
2. **Classification Agent (`classification_agent.py`)**: Categorizes into 12 classes (`LOGIN`, `BILLING`, `PAYMENT`, `TECHNICAL`, `ACCOUNT`, `BUG`, `FEATURE_REQUEST`, `COMPLAINT`, `PRODUCT`, `SERVICE`, `GENERAL`, `OTHER`), assesses priority and severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), detects sentiment (`POSITIVE`, `NEUTRAL`, `NEGATIVE`), and assigns confidence score.
3. **Knowledge Agent (`knowledge_agent.py`)**: Queries the internal knowledge base table using relevance scoring on titles, keywords, and contents.
4. **Resolution Agent (`resolution_agent.py`)**: Formulates actionable solutions and determines whether the issue can be safely solved autonomously.
5. **Escalation Agent (`escalation_agent.py`)**: Enforces mandatory human routing for critical outages, billing disputes, or low AI confidence (< 0.75), assigning available support agents.
6. **Feedback Agent (`feedback_agent.py`)**: Analyzes customer ratings and comments, tags sentiment, and generates administrator alerts on negative sentiment.
7. **Supervisor Agent (`supervisor_agent.py`)**: Serves as the ultimate safety gatekeeper. Approves autonomous actions or forces human escalation, recording concise safe reasoning summaries (no chain-of-thought leakage).
8. **Orchestrator (`orchestrator.py`)**: Automates the pipeline and records `AIDecision` audit trails.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React.
- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0, Pydantic v2, SQLite, Uvicorn.
- **Security**: JWT tokens (python-jose), Bcrypt password hashing, role-based authorization, CORS middleware.
- **AI Dual Engine**:
  - **OpenAI Mode**: GPT-4o-mini with structured JSON validation when `OPENAI_API_KEY` is provided.
  - **Fallback Mode**: 100% deterministic rule-based multi-agent execution with keyword heuristics and sentiment matching (runs offline without API keys).

---

## 4. User Roles & Features

### Customer
- Register and login.
- Customer dashboard with 4 metric cards and recent tickets table.
- Create ticket form with live multi-agent AI analysis display.
- Search and filter personal tickets.
- Ticket details with timeline, safe AI decision log, and interactive chat thread.
- 1-to-5 star rating and feedback submission after resolution.
- Profile viewer.

### Support Agent
- Agent dashboard tracking Assigned, Escalated, High Priority, Critical, and Resolved Today cases.
- Ticket triage queue with status and priority filters.
- Support workbench: reply to customer, toggle private internal notes, update status (`IN_PROGRESS`, `WAITING_FOR_CUSTOMER`, `RESOLVED`, `CLOSED`), update priority.
- One-click AI response draft generator.
- Dedicated escalation queue.

### Administrator
- Executive analytics dashboard with 8 KPI metrics and interactive Recharts:
  - Ticket volume trends over time.
  - Category distribution bar chart.
  - Priority distribution pie chart.
  - Status lifecycle breakdown.
  - Customer sentiment distribution.
- Master ticket manager with deletion and manual agent assignment.
- User directory with dynamic role switcher (`CUSTOMER`, `SUPPORT_AGENT`, `ADMIN`).
- Full AI Decisions audit log with confidence and safe reasoning summaries.
- Customer feedback analytics and CSAT overview.
- Knowledge base CRUD interface with keyword tag management.
- Clustered recurring issues detector with frequency metrics.
- System and AI mode configuration page.

---

## 5. Demo Credentials

The database is pre-seeded with development accounts:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@example.com` | `Admin@123` |
| **Support Agent** | `agent@example.com` | `Agent@123` |
| **Support Agent 2** | `agent2@example.com` | `Agent@123` |
| **Customer** | `customer@example.com` | `Customer@123` |
| **Customer 2** | `sarah@example.com` | `Customer@123` |

*(Quick 1-click login buttons are also available directly on the login page.)*

---

## 6. Directory Structure

```
ai-customer-support/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── database.py              # SQLite database configuration
│   │   ├── models.py                # SQLAlchemy database models
│   │   ├── schemas.py               # Pydantic validation schemas
│   │   ├── auth.py                  # JWT & Bcrypt password hashing
│   │   ├── dependencies.py          # Auth & role-based access dependencies
│   │   ├── agents/                  # Multi-agent AI system
│   │   │   ├── intake_agent.py
│   │   │   ├── classification_agent.py
│   │   │   ├── knowledge_agent.py
│   │   │   ├── resolution_agent.py
│   │   │   ├── escalation_agent.py
│   │   │   ├── feedback_agent.py
│   │   │   ├── supervisor_agent.py
│   │   │   └── orchestrator.py
│   │   ├── routers/                 # REST endpoints
│   │   │   ├── auth.py
│   │   │   ├── tickets.py
│   │   │   ├── messages.py
│   │   │   ├── feedback.py
│   │   │   ├── knowledge.py
│   │   │   ├── dashboard.py
│   │   │   ├── admin.py
│   │   │   ├── ai.py
│   │   │   └── notifications.py
│   │   └── services/
│   │       ├── ai_service.py
│   │       ├── ticket_service.py
│   │       └── notification_service.py
│   ├── tests/
│   │   └── test_end_to_end.py       # Automated test suite (8 tests)
│   ├── seed.py                      # Database seeding script
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/              # Badges, Navbar, Sidebar, Modal
│   │   ├── context/                 # AuthContext, NotificationContext
│   │   ├── layouts/                 # MainLayout, AuthLayout
│   │   ├── pages/                   # Customer, Agent, Admin pages
│   │   ├── services/api.js          # Axios API client
│   │   ├── App.jsx                  # React Router routes
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Tailwind CSS
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## 7. Installation & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup
1. Open terminal in the `backend/` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the SQLite database with realistic initial data:
   ```bash
   python seed.py
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - API Root: `http://127.0.0.1:8000`
   - Interactive Swagger Docs: `http://127.0.0.1:8000/docs`
   - ReDoc: `http://127.0.0.1:8000/redoc`

### Frontend Setup
1. Open a new terminal in the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Frontend Application: `http://localhost:5173`

---

## 8. Automated Testing

Run the full end-to-end test suite verifying the 5 core customer scenarios, authentication, ticket isolation, and analytics:

```powershell
cd backend
.\venv\Scripts\python -m pytest tests/test_end_to_end.py -v
```

### Verified Test Scenarios:
- **Test 1**: *"I cannot login because my password is not working"* -> Category `LOGIN`, Priority `MEDIUM`, Autonomous AI resolution provided (`AI_RESPONDED`).
- **Test 2**: *"I was charged twice for the same transaction and need a refund"* -> Category `BILLING`, Priority `HIGH`, Escalated to human support agent (`ASSIGNED`/`ESCALATED`).
- **Test 3**: *"The entire application is down and nobody can access it"* -> Category `TECHNICAL`, Priority `CRITICAL`, Mandatory escalation.
- **Test 4**: *"Your service is excellent"* -> Feedback Agent assesses `POSITIVE` sentiment.
- **Test 5**: *"The application keeps crashing and support has not fixed it for three days"* -> Category `BUG`, Negative sentiment, Escalated.
- **Auth & Authorization**: JWT token issuance, customer data isolation, and admin role enforcement.
- **Dashboard Telemetry**: Accurate SQL database aggregation of metrics and distributions.

---

## 9. License

MIT License. Designed and engineered for modern enterprise autonomous customer support operations.
