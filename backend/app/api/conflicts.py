from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import Conflict, User
from app.schemas import ConflictOut

router = APIRouter(prefix="/api/conflicts", tags=["conflicts"])


@router.get("", response_model=list[ConflictOut])
def list_conflicts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Conflict).order_by(Conflict.created_at.desc()).all()


@router.get("/{conflict_id}", response_model=ConflictOut)
def get_conflict(conflict_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    c = db.query(Conflict).filter(Conflict.conflict_id == conflict_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conflict not found")
    return c


@router.post("/{conflict_id}/resolve")
def resolve_conflict(conflict_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    c = db.query(Conflict).filter(Conflict.conflict_id == conflict_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conflict not found")
    c.resolved = True
    db.commit()
    return {"ok": True, "conflict_id": conflict_id}
