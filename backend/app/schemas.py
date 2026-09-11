from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "CUSTOMER"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: Optional[str] = "CUSTOMER"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

# --- Message Schemas ---
class MessageCreate(BaseModel):
    message: str
    is_internal: Optional[bool] = False

class MessageOut(BaseModel):
    id: int
    ticket_id: int
    sender_id: Optional[int] = None
    sender_type: str
    message: str
    is_internal: bool
    created_at: datetime
    sender_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class FeedbackOut(BaseModel):
    id: int
    ticket_id: int
    customer_id: int
    rating: int
    comment: Optional[str] = None
    sentiment: Optional[str] = None
    created_at: datetime
    customer_name: Optional[str] = None
    ticket_number: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# --- AI Decision Schemas ---
class AIDecisionOut(BaseModel):
    id: int
    ticket_id: int
    agent_name: str
    action: str
    reasoning_summary: str
    confidence: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Ticket Schemas ---
class TicketCreate(BaseModel):
    subject: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=5)
    category: Optional[str] = None

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    assigned_agent_id: Optional[int] = None

class TicketOut(BaseModel):
    id: int
    ticket_number: str
    customer_id: int
    assigned_agent_id: Optional[int] = None
    subject: str
    description: str
    category: str
    priority: str
    severity: str
    sentiment: str
    status: str
    ai_confidence: Optional[float] = 0.0
    ai_resolution: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    customer_name: Optional[str] = None
    assigned_agent_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class TicketDetailOut(TicketOut):
    messages: List[MessageOut] = []
    feedback: Optional[FeedbackOut] = None
    ai_decisions: List[AIDecisionOut] = []
    model_config = ConfigDict(from_attributes=True)

# --- Knowledge Article Schemas ---
class KnowledgeArticleCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    content: str = Field(min_length=10)
    category: str
    keywords: str

class KnowledgeArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    keywords: Optional[str] = None

class KnowledgeArticleOut(BaseModel):
    id: int
    title: str
    content: str
    category: str
    keywords: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Notification Schemas ---
class NotificationOut(BaseModel):
    id: int
    user_id: int
    ticket_id: Optional[int] = None
    message: str
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- AI Structured Output Schema ---
class AIStructuredAnalysis(BaseModel):
    intent: str
    category: str
    priority: str
    severity: str
    sentiment: str
    confidence: float
    is_resolvable: bool
    recommended_action: str
    response: str
    escalation_required: bool

# --- Dashboard & Analytics Schemas ---
class DashboardStats(BaseModel):
    total_tickets: int
    open_tickets: int
    resolved_tickets: int
    escalated_tickets: int
    critical_tickets: int
    ai_resolution_rate: float
    avg_resolution_time_hours: float
    avg_customer_rating: float
    ai_mode: str

class DistributionItem(BaseModel):
    name: str
    value: int
    percentage: Optional[float] = 0.0

class TrendItem(BaseModel):
    date: str
    tickets: int
    resolved: int
    escalated: int

class RecurringIssueItem(BaseModel):
    category: str
    keyword: str
    frequency: int
    sample_subject: str
    severity: str
