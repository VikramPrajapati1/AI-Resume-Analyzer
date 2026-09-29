import sqlite3
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "resume_analyzer.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resumes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                uploaded_at TEXT NOT NULL,
                extracted_text TEXT NOT NULL,
                parsed_sections TEXT, -- JSON
                contact_info TEXT,    -- JSON
                extracted_skills TEXT, -- JSON
                word_count INTEGER
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                resume_id INTEGER,
                job_title TEXT,
                company TEXT,
                job_description TEXT NOT NULL,
                match_score REAL NOT NULL,
                skill_score REAL NOT NULL,
                semantic_score REAL NOT NULL,
                ats_score REAL NOT NULL,
                matched_skills TEXT,      -- JSON
                missing_skills TEXT,      -- JSON
                bonus_skills TEXT,        -- JSON
                category_breakdown TEXT,  -- JSON
                suggestions TEXT,         -- JSON
                created_at TEXT NOT NULL,
                FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
            )
        """)
        conn.commit()

# Ensure tables are created immediately
init_db()

def save_resume(filename: str, extracted_text: str, parsed_sections: Dict, contact_info: Dict, extracted_skills: List[str], word_count: int) -> int:
    with get_db() as conn:
        cursor = conn.cursor()
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO resumes (filename, uploaded_at, extracted_text, parsed_sections, contact_info, extracted_skills, word_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            filename,
            now,
            extracted_text,
            json.dumps(parsed_sections),
            json.dumps(contact_info),
            json.dumps(extracted_skills),
            word_count
        ))
        conn.commit()
        return cursor.lastrowid

def get_resume(resume_id: int) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resumes WHERE id = ?", (resume_id,))
        row = cursor.fetchone()
        if not row:
            return None
        return {
            "id": row["id"],
            "filename": row["filename"],
            "uploaded_at": row["uploaded_at"],
            "extracted_text": row["extracted_text"],
            "parsed_sections": json.loads(row["parsed_sections"] or "{}"),
            "contact_info": json.loads(row["contact_info"] or "{}"),
            "extracted_skills": json.loads(row["extracted_skills"] or "[]"),
            "word_count": row["word_count"]
        }

def save_analysis(
    resume_id: Optional[int],
    job_title: str,
    company: str,
    job_description: str,
    match_score: float,
    skill_score: float,
    semantic_score: float,
    ats_score: float,
    matched_skills: List[str],
    missing_skills: List[str],
    bonus_skills: List[str],
    category_breakdown: Dict,
    suggestions: List[Dict],
) -> int:
    with get_db() as conn:
        cursor = conn.cursor()
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO analyses (
                resume_id, job_title, company, job_description,
                match_score, skill_score, semantic_score, ats_score,
                matched_skills, missing_skills, bonus_skills,
                category_breakdown, suggestions, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            resume_id,
            job_title,
            company,
            job_description,
            match_score,
            skill_score,
            semantic_score,
            ats_score,
            json.dumps(matched_skills),
            json.dumps(missing_skills),
            json.dumps(bonus_skills),
            json.dumps(category_breakdown),
            json.dumps(suggestions),
            now
        ))
        conn.commit()
        return cursor.lastrowid

def list_analyses(limit: int = 20) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.id, a.resume_id, a.job_title, a.company, a.match_score, 
                   a.skill_score, a.semantic_score, a.ats_score, a.created_at,
                   r.filename as resume_filename
            FROM analyses a
            LEFT JOIN resumes r ON a.resume_id = r.id
            ORDER BY a.id DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_analysis_detail(analysis_id: int) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.*, r.filename as resume_filename, r.extracted_text as resume_text
            FROM analyses a
            LEFT JOIN resumes r ON a.resume_id = r.id
            WHERE a.id = ?
        """, (analysis_id,))
        row = cursor.fetchone()
        if not row:
            return None
        return {
            "id": row["id"],
            "resume_id": row["resume_id"],
            "resume_filename": row["resume_filename"],
            "job_title": row["job_title"],
            "company": row["company"],
            "job_description": row["job_description"],
            "match_score": row["match_score"],
            "skill_score": row["skill_score"],
            "semantic_score": row["semantic_score"],
            "ats_score": row["ats_score"],
            "matched_skills": json.loads(row["matched_skills"] or "[]"),
            "missing_skills": json.loads(row["missing_skills"] or "[]"),
            "bonus_skills": json.loads(row["bonus_skills"] or "[]"),
            "category_breakdown": json.loads(row["category_breakdown"] or "{}"),
            "suggestions": json.loads(row["suggestions"] or "[]"),
            "created_at": row["created_at"],
            "resume_text": row["resume_text"]
        }

def delete_analysis(analysis_id: int) -> bool:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
        conn.commit()
        return cursor.rowcount > 0
