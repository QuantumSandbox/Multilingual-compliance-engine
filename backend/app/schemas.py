from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ---------- Auth ----------
class UserCreate(BaseModel):
    username: str
    full_name: str
    password: str
    role: str = "viewer"
    unit: str = ""


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    full_name: str
    role: str
    unit: str
    is_active: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


# ---------- Documents ----------
class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    doc_id: str
    title: str
    source_type: str
    source_dept: str
    language: str
    original_language: str
    version: str
    family_id: str
    file_type: str
    status: str
    sensitive: bool
    retention_days: int
    uploader: Optional[UserOut] = None
    created_at: datetime
    processed: bool
    chunk_count: int


class UploadResponse(BaseModel):
    doc_id: str
    title: str
    language: str
    chunks: int
    tasks_created: int
    processed_with: str  # llm | rules | partial


# ---------- Tasks ----------
class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    task_id: str
    doc_id: str
    obligation: str
    deadline: Optional[date] = None
    deadline_raw: Optional[str] = None
    responsible_unit: str
    evidence_required: str
    source_page: Optional[int] = None
    source_paragraph: Optional[int] = None
    source_text: str
    source_text_en: str
    confidence: float
    status: str
    extraction_method: str


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    responsible_unit: Optional[str] = None
    evidence_required: Optional[str] = None


# ---------- Conflicts ----------
class ConflictOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    conflict_id: str
    kind: str
    change_type: str
    obligation: str
    doc_a: Optional[str] = None
    doc_b: Optional[str] = None
    text_a: Optional[str] = None
    text_b: Optional[str] = None
    page_a: Optional[int] = None
    page_b: Optional[int] = None
    deadline_a: Optional[str] = None
    deadline_b: Optional[str] = None
    severity: str
    resolved: bool
    created_at: datetime


# ---------- Dashboard ----------
class DashboardStats(BaseModel):
    total_documents: int
    total_obligations: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    overdue_tasks: int
    upcoming_deadlines: int
    conflicts: int
    by_unit: list[dict]
    by_source_type: list[dict]
    upcoming: list[dict]


# ---------- Citation ----------
class CitationOut(BaseModel):
    doc_id: str
    title: str
    file_path: str
    file_type: str
    page: Optional[int]
    paragraph: Optional[int]
    source_text: str
    source_text_en: str
