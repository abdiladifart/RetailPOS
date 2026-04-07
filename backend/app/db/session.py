from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# PostgreSQL Engine (Online)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

# SQLite Engine (Offline)
sqlite_engine = create_engine(
    settings.SQLITE_URL,
    connect_args={"check_same_thread": False},
    echo=settings.DEBUG
)

# Session makers
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
SQLiteSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)


def get_db():
    """
    Dependency for getting DB session
    Automatically switches between PostgreSQL and SQLite based on offline mode
    """
    if settings.OFFLINE_MODE:
        db = SQLiteSessionLocal()
    else:
        db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_online_db():
    """Force PostgreSQL connection"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_offline_db():
    """Force SQLite connection"""
    db = SQLiteSessionLocal()
    try:
        yield db
    finally:
        db.close()
