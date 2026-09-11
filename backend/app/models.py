import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="CUSTOMER", nullable=False)  # CUSTOMER, SUPPORT_AGENT, ADMIN
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    tickets_created = relationship("Ticket", foreign_keys="Ticket.customer_id", back_populates="customer")
    tickets_assigned = relationship("Ticket", foreign_keys="Ticket.assigned_agent_id", back_populates="assigned_agent")
    messages = relationship("TicketMessage", back_populates="sender")
    feedbacks = relationship("Feedback", back_populates="customer")
    notifications = relationship("Notification", back_populates="user")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(60), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), default="GENERAL", nullable=False)
    priority = Column(String(50), default="MEDIUM", nullable=False)      # LOW, MEDIUM, HIGH, CRITICAL
    severity = Column(String(50), default="MEDIUM", nullable=False)      # LOW, MEDIUM, HIGH, CRITICAL
    sentiment = Column(String(50), default="NEUTRAL", nullable=False)    # POSITIVE, NEUTRAL, NEGATIVE
    status = Column(String(50), default="NEW", nullable=False)
    ai_confidence = Column(Float, nullable=True, default=0.0)
    ai_resolution = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    customer = relationship("User", foreign_keys=[customer_id], back_populates="tickets_created")
    assigned_agent = relationship("User", foreign_keys=[assigned_agent_id], back_populates="tickets_assigned")
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="ticket", uselist=False, cascade="all, delete-orphan")
    ai_decisions = relationship("AIDecision", back_populates="ticket", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="ticket", cascade="all, delete-orphan")


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    sender_type = Column(String(50), nullable=False)  # CUSTOMER, AGENT, AI, SYSTEM
    message = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    ticket = relationship("Ticket", back_populates="messages")
    sender = relationship("User", back_populates="messages")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False, unique=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(Text, nullable=True)
    sentiment = Column(String(50), nullable=True)  # POSITIVE, NEUTRAL, NEGATIVE
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    ticket = relationship("Ticket", back_populates="feedback")
    customer = relationship("User", back_populates="feedbacks")


class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    keywords = Column(String(255), nullable=False)  # comma separated
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)


class AIDecision(Base):
    __tablename__ = "ai_decisions"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    reasoning_summary = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    ticket = relationship("Ticket", back_populates="ai_decisions")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=True)
    message = Column(String(255), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")
    ticket = relationship("Ticket", back_populates="notifications")
