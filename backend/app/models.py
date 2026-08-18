from __future__ import annotations

from datetime import datetime, date
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    Date,
    JSON,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(128), nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(32), default="viewer", nullable=False)  # admin | officer | dept_head | viewer
    unit = Column(String(128), default="", nullable=False)  # dept_head's assigned unit
    is_active = Column(Boolean, default=True)

    documents = relationship("Document", back_populates="uploader")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(256), nullable=False)
    source_type = Column(String(64), default="circular")  # circular | accreditation | procurement | policy
    source_dept = Column(String(128), default="", nullable=False)
    language = Column(String(16), default="en")
    original_language = Column(String(16), default="en")
    version = Column(String(16), default="v1")
    family_id = Column(String(64), index=True, nullable=False)  # groups versions of same doc
    filename = Column(String(256), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(16), default="pdf")
    status = Column(String(16), default="active")  # active | archived | expired
    sensitive = Column(Boolean, default=False)
    retention_days = Column(Integer, default=1825)
    retention_expiry = Column(Date, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)
    chunk_count = Column(Integer, default=0)

    uploader = relationship("User", back_populates="documents")
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="document", cascade="all, delete-orphan")


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(String(64), ForeignKey("documents.doc_id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    page = Column(Integer, default=1)
    paragraph = Column(Integer, default=1)
    text = Column(Text, nullable=False)          # english / working text
    original_text = Column(Text, nullable=False)  # original-language text (for citation)
    embedding = Column(JSON, nullable=True)       # stored vector
    is_obligation = Column(Boolean, default=False)

    document = relationship("Document", back_populates="chunks")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(64), unique=True, index=True, nullable=False)
    doc_id = Column(String(64), ForeignKey("documents.doc_id"), nullable=False)
    obligation = Column(Text, nullable=False)
    deadline = Column(Date, nullable=True)
    deadline_raw = Column(String(64), nullable=True)
    responsible_unit = Column(String(128), default="", nullable=False)
    evidence_required = Column(Text, default="", nullable=False)
    source_page = Column(Integer, nullable=True)
    source_paragraph = Column(Integer, nullable=True)
    source_text = Column(Text, nullable=False)        # exact quoted span (original lang)
    source_text_en = Column(Text, nullable=False)      # english working text
    confidence = Column(Float, default=0.0)
    status = Column(String(16), default="pending")     # pending | in_progress | completed | overdue
    extraction_method = Column(String(16), default="llm")  # llm | rules
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="tasks")
    conflicts = relationship("Conflict", secondary="conflict_tasks", overlaps="tasks")


class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(Integer, primary_key=True, index=True)
    conflict_id = Column(String(64), unique=True, index=True, nullable=False)
    kind = Column(String(32), nullable=False)  # version_change | cross_document
    change_type = Column(String(32), default="conflict")  # added | removed | modified | conflict
    obligation = Column(Text, nullable=False)
    doc_a = Column(String(64), nullable=True)
    doc_b = Column(String(64), nullable=True)
    text_a = Column(Text, nullable=True)
    text_b = Column(Text, nullable=True)
    page_a = Column(Integer, nullable=True)
    page_b = Column(Integer, nullable=True)
    deadline_a = Column(String(64), nullable=True)
    deadline_b = Column(String(64), nullable=True)
    severity = Column(String(16), default="medium")  # low | medium | high
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", secondary="conflict_tasks", overlaps="conflicts")


class ConflictTask(Base):
    __tablename__ = "conflict_tasks"
    conflict_id = Column(Integer, ForeignKey("conflicts.id"), primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), primary_key=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(64), nullable=False)
    resource = Column(String(128), nullable=True)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
