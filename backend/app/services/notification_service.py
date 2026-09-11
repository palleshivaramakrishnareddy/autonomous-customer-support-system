from sqlalchemy.orm import Session
from app.models import Notification

def create_notification(db: Session, user_id: int, message: str, ticket_id: int = None) -> Notification:
    notif = Notification(
        user_id=user_id,
        ticket_id=ticket_id,
        message=message,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
