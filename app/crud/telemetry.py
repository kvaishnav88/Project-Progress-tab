from sqlalchemy.orm import Session
from app.models.Telemetry import Telemetry
from app.schemas.telemetry import TelemetryCreate


def create_telemetry(db: Session, telemetry_in: TelemetryCreate) -> Telemetry:
    telemetry = Telemetry(**telemetry_in.model_dump())
    db.add(telemetry)
    db.commit()
    db.refresh(telemetry)
    return telemetry


def get_telemetry_by_id(db: Session, telemetry_id: int):
    return db.query(Telemetry).filter(Telemetry.id == telemetry_id).first()


def get_telemetry(db: Session, skip: int = 0, limit: int = 100, session_id: int | None = None):
    query = db.query(Telemetry)
    if session_id is not None:
        query = query.filter(Telemetry.session_id == session_id)
    return query.order_by(Telemetry.id.desc()).offset(skip).limit(limit).all()


def delete_telemetry(db: Session, telemetry: Telemetry) -> None:
    db.delete(telemetry)
    db.commit()
