from sqlalchemy.orm import Session
from app.models.GeneratedComponent import GeneratedComponent
from app.schemas.generated_ui import GeneratedUICreate


def create_generated_ui(db: Session, generated_ui_in: GeneratedUICreate) -> GeneratedComponent:
    generated_ui = GeneratedComponent(**generated_ui_in.model_dump())
    db.add(generated_ui)
    db.commit()
    db.refresh(generated_ui)
    return generated_ui


def get_generated_ui(db: Session, component_id: int):
    return db.query(GeneratedComponent).filter(GeneratedComponent.id == component_id).first()


def get_generated_ui_history(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: int | None = None,
):
    query = db.query(GeneratedComponent)
    if user_id is not None:
        query = query.filter(GeneratedComponent.user_id == user_id)
    return query.order_by(GeneratedComponent.id.desc()).offset(skip).limit(limit).all()


def delete_generated_ui(db: Session, generated_ui: GeneratedComponent) -> None:
    db.delete(generated_ui)
    db.commit()
