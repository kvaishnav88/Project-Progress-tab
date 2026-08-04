from sqlalchemy.orm import Session
from app.models.User import User
from app.schemas.user import UserCreate, UserUpdate


def create_user(db: Session, user_in: UserCreate) -> User:
    db_user = User(name=user_in.name, email=str(user_in.email), password=user_in.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
    if user_in.name is not None:
        user.name = user_in.name
    if user_in.email is not None:
        user.email = str(user_in.email)
    if user_in.password is not None:
        user.password = user_in.password
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
