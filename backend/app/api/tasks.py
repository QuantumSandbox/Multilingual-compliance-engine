from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import Task, User
from app.schemas import TaskOut, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _query(user: User, db: Session):
    q = db.query(Task)
    if user.role == "dept_head" and user.unit:
        q = q.filter(Task.responsible_unit.ilike(f"%{user.unit}%"))
    elif user.role == "viewer":
        q = q.filter(False)
    return q


@router.get("", response_model=list[TaskOut])
def list_tasks(
    status: str = Query(None),
    unit: str = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = _query(user, db)
    if status:
        q = q.filter(Task.status == status)
    if unit:
        q = q.filter(Task.responsible_unit.ilike(f"%{unit}%"))
    return q.order_by(Task.deadline).all()


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    t = db.query(Task).filter(Task.task_id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    if user.role == "viewer" or (user.role == "dept_head" and user.unit and user.unit not in (t.responsible_unit or "")):
        raise HTTPException(status_code=403, detail="Not permitted")
    return t


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    t = db.query(Task).filter(Task.task_id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    if payload.status is not None:
        t.status = payload.status
    if payload.responsible_unit is not None:
        t.responsible_unit = payload.responsible_unit
    if payload.evidence_required is not None:
        t.evidence_required = payload.evidence_required
    t.reviewed_by = user.id
    db.commit()
    db.refresh(t)
    return t
