from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app import models  # noqa: F401  (register models)
from app.api import auth, documents, tasks, conflicts, dashboard, citations
from app.auth import hash_password
from app.db import SessionLocal
from app.models import User

app = FastAPI(title="Multilingual Regulatory Compliance Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(tasks.router)
app.include_router(conflicts.router)
app.include_router(dashboard.router)
app.include_router(citations.router)


DEMO_USERS = [
    ("admin", "Compliance Administrator", "admin123", "admin", ""),
    ("officer", "Compliance Officer", "officer123", "officer", ""),
    ("hod_finance", "Head of Finance Department", "hod123", "dept_head", "Finance"),
    ("hod_cse", "Head of CSE", "hod123", "dept_head", "CSE"),
    ("viewer", "Read Only Viewer", "viewer123", "viewer", ""),
]


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    _seed_users()


def _seed_users():
    db = SessionLocal()
    try:
        for username, full, pw, role, unit in DEMO_USERS:
            if not db.query(User).filter(User.username == username).first():
                db.add(
                    User(
                        username=username,
                        full_name=full,
                        hashed_password=hash_password(pw),
                        role=role,
                        unit=unit,
                    )
                )
        db.commit()
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "compliance-engine"}
