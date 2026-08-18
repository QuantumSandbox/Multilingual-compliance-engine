from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import Task, Document, Conflict, User
from app.schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Task)
    if user.role == "dept_head" and user.unit:
        q = q.filter(Task.responsible_unit.ilike(f"%{user.unit}%"))
    elif user.role == "viewer":
        q = q.filter(False)

    tasks = q.all()
    today = date.today()
    upcoming_cutoff = today + timedelta(days=30)

    by_unit = {}
    by_type = {}
    upcoming = []
    for t in tasks:
        by_unit[t.responsible_unit or "Unassigned"] = by_unit.get(t.responsible_unit or "Unassigned", 0) + 1
        src = t.document.source_type if t.document else "unknown"
        by_type[src] = by_type.get(src, 0) + 1
        if t.deadline and today <= t.deadline <= upcoming_cutoff and t.status != "completed":
            upcoming.append(
                {
                    "task_id": t.task_id,
                    "obligation": t.obligation,
                    "deadline": t.deadline.isoformat(),
                    "responsible_unit": t.responsible_unit,
                    "doc_id": t.doc_id,
                }
            )

    def count(status):
        return sum(1 for t in tasks if t.status == status)

    overdue = sum(1 for t in tasks if t.deadline and t.deadline < today and t.status != "completed")

    total_docs = (
        db.query(Document).filter(Document.sensitive == False).count()  # noqa: E712
        if user.role == "viewer"
        else db.query(Document).count()
    )
    conflicts = db.query(Conflict).filter(Conflict.resolved == False).count()  # noqa: E712

    return DashboardStats(
        total_documents=total_docs,
        total_obligations=len(tasks),
        pending_tasks=count("pending"),
        in_progress_tasks=count("in_progress"),
        completed_tasks=count("completed"),
        overdue_tasks=overdue,
        upcoming_deadlines=len(upcoming),
        conflicts=conflicts,
        by_unit=[{"unit": k, "count": v} for k, v in sorted(by_unit.items(), key=lambda x: -x[1])],
        by_source_type=[{"type": k, "count": v} for k, v in by_type.items()],
        upcoming=sorted(upcoming, key=lambda x: x["deadline"]),
    )
