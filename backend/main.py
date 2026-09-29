import os
import json
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import database
from nlp_engine import (
    extract_text_from_pdf,
    clean_text,
    extract_contact_info,
    extract_sections,
    extract_skills_from_text,
    calculate_ats_audit,
    analyze_resume_against_job,
    generate_tailored_bullet_points
)
from sample_data import SAMPLE_PROFILES

app = FastAPI(
    title="AI Resume Analyzer & Job Matcher API",
    description="Backend API for parsing resumes, detecting skills, analyzing job gaps, and scoring ATS fit.",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite defaults to port 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables on startup
@app.on_event("startup")
def startup_event():
    database.init_db()

# Request schemas
class AnalyzeRequest(BaseModel):
    resume_id: Optional[int] = None
    resume_text: str
    job_description: str
    job_title: Optional[str] = "Software Role"
    company: Optional[str] = ""

class RewriteRequest(BaseModel):
    job_title: str
    matched_skills: List[str]
    missing_skills: List[str]

@app.get("/api/health")
def read_root():
    return {
        "status": "healthy",
        "service": "AI Resume Analyzer & Job Matcher",
        "version": "1.0.0"
    }

@app.get("/api/samples")
def get_sample_profiles():
    """Return pre-configured sample resumes and job descriptions."""
    return SAMPLE_PROFILES

@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload PDF resume, extract text, detect sections, contact info, and skills."""
    filename = file.filename or "resume.pdf"
    content = await file.read()
    
    # Check if PDF or text file
    if filename.lower().endswith(".pdf"):
        try:
            extracted_text = extract_text_from_pdf(content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read PDF file: {str(e)}")
    else:
        # Fallback for plain text files
        try:
            extracted_text = content.decode("utf-8", errors="ignore")
        except Exception:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF.")

    extracted_text = clean_text(extracted_text)
    if len(extracted_text.strip()) < 40:
        raise HTTPException(status_code=400, detail="The uploaded PDF appears to be empty or an unreadable scanned image.")

    word_count = len(extracted_text.split())
    contact_info = extract_contact_info(extracted_text)
    sections = extract_sections(extracted_text)
    skills_data = extract_skills_from_text(extracted_text)
    ats_audit = calculate_ats_audit(extracted_text, sections, contact_info)

    # Save to SQLite database
    resume_id = database.save_resume(
        filename=filename,
        extracted_text=extracted_text,
        parsed_sections=sections,
        contact_info=contact_info,
        extracted_skills=skills_data["all_skills"],
        word_count=word_count
    )

    return {
        "resume_id": resume_id,
        "filename": filename,
        "extracted_text": extracted_text,
        "word_count": word_count,
        "contact_info": contact_info,
        "sections": sections,
        "skills_data": skills_data,
        "ats_audit": ats_audit
    }

@app.post("/api/analyze")
def analyze_job_match(request: AnalyzeRequest):
    """Analyze resume against job description, calculate skill gap & ATS score, persist results."""
    resume_text = request.resume_text.strip()
    job_desc = request.job_description.strip()

    if not resume_text:
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    if not job_desc:
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    job_title = request.job_title.strip() if request.job_title else "Target Role"
    company = request.company.strip() if request.company else ""

    result = analyze_resume_against_job(
        resume_text=resume_text,
        job_description=job_desc,
        job_title=job_title,
        company=company
    )

    # Save to database
    analysis_id = database.save_analysis(
        resume_id=request.resume_id,
        job_title=job_title,
        company=company,
        job_description=job_desc,
        match_score=result["match_score"],
        skill_score=result["skill_score"],
        semantic_score=result["semantic_score"],
        ats_score=result["ats_score"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        bonus_skills=result["bonus_skills"],
        category_breakdown=result["category_breakdown"],
        suggestions=result["suggestions"]
    )

    result["analysis_id"] = analysis_id
    result["job_title"] = job_title
    result["company"] = company
    return result

@app.get("/api/history")
def get_history(limit: int = 20):
    """Get list of past analyses."""
    return database.list_analyses(limit=limit)

@app.get("/api/history/{analysis_id}")
def get_history_detail(analysis_id: int):
    """Get full details of a specific past analysis."""
    detail = database.get_analysis_detail(analysis_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    return detail

@app.delete("/api/history/{analysis_id}")
def delete_history_item(analysis_id: int):
    """Delete a past analysis record."""
    success = database.delete_analysis(analysis_id)
    if not success:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    return {"success": True, "message": "Record deleted successfully."}

@app.post("/api/ai-rewrite")
def ai_rewrite_bullets(req: RewriteRequest):
    """Generate dynamic role-tailored bullet points to bridge skill gaps."""
    bullets = generate_tailored_bullet_points(
        job_title=req.job_title,
        matched_skills=req.matched_skills,
        missing_skills=req.missing_skills
    )
    return {"tailored_bullets": bullets}

# Serve React frontend in production
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_root():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{full_path:path}")
    def serve_react_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        
        target_file = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
