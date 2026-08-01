from sqlalchemy.orm import Session
from app.models.Session import Session as SessionModel
from app.schemas.session import SessionCreate, SessionUpdate
from app.utils.helpers import utc_now


def create_session(db: Session, session_in: SessionCreate) -> SessionModel:
    db_session = SessionModel(**session_in.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def get_session(db: Session, session_id: int):
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()


def get_sessions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(SessionModel).offset(skip).limit(limit).all()


def update_session(db: Session, db_session: SessionModel, session_in: SessionUpdate) -> SessionModel:
    data = session_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_session, field, value)
    db.commit()
    db.refresh(db_session)
    return db_session


def end_session(db: Session, db_session: SessionModel) -> SessionModel:
    db_session.logout_time = utc_now()
    db.commit()
    db.refresh(db_session)
    return db_session


def delete_session(db: Session, db_session: SessionModel) -> None:
    db.delete(db_session)
    db.commit()
