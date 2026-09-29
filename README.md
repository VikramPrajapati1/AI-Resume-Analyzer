# AI Resume Analyzer & Job Matcher

> **AI + React + Python + Machine Learning + SQLite**
> 
> Ek comprehensive full-stack web application jo user ka resume analyze karti hai, 1,000+ technical aur soft skills detect karti hai, target job description ke saath match score compute karti hai, aur missing skills gap analysis dashboard provide karti hai.

---

## 🌟 Key Features

1. **PDF Resume Upload & Text Extraction**:
   - `pypdf` engine for clean text parsing from multi-page PDFs.
   - Extracts contact details automatically (Email, Phone, LinkedIn, GitHub).
   - Identifies structural sections (Summary, Experience, Education, Projects, Skills, Certifications).
   - Dual-mode input: Drag & Drop PDF upload OR paste raw resume text.

2. **AI & NLP Skill Detection Engine**:
   - 1,000+ curated technical and soft skills across 10 domains (Programming Languages, Frontend, Backend & APIs, Databases, Cloud & DevOps, AI/ML, Testing & QA, Mobile, Methodologies, Soft Skills).
   - Smart synonym normalization (e.g. `React.js` -> `React`, `k8s` -> `Kubernetes`, `postgres` -> `PostgreSQL`, `TS` -> `TypeScript`).

3. **Job Description Matching & Gap Analysis**:
   - **Overall Match Score (0–100%)**: Composite calculation combining Skill Overlap (60%), Semantic TF-IDF Cosine Similarity (25%), and ATS Health (15%).
   - Match Tiers: *Exceptional Match*, *Strong Match*, *Moderate Match*, *Low Match*.
   - Filterable skills matrix: **Matched Skills**, **Missing Skills (Skill Gap)**, and **Bonus Skills**.
   - Click-to-copy missing skill keywords directly to clipboard.
   - Domain alignment breakdown progress bars.

4. **ATS Readability & Structural Audit**:
   - Section completeness checklist.
   - Word count & recruiter skim reading time diagnosis.
   - Impact action verbs detector (e.g. *Architected*, *Spearheaded*, *Optimized* vs passive phrases).
   - Quantification metrics counter (STAR format percentages `%` and numbers `$`).

5. **AI Resume Improvement Suggestions & Role-Tailored Bullets**:
   - Prioritized actionable recommendations (High, Medium, Low).
   - Auto-generated experience bullet points customized to bridge the exact skill gap for the target job role.

6. **SQLite History & Persistence**:
   - Every analysis is automatically saved in `resume_analyzer.db`.
   - History drawer to reload, compare, or delete past analyses anytime.
   - Export analysis report as JSON or Print/Save PDF.

7. **1-Click Instant Sample Profiles**:
   - Built-in profiles for **Full Stack Developer** (Stripe JD) and **AI/ML Engineer** (DeepMind JD) for instant testing without uploading files.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend**: Python 3.14, FastAPI, Uvicorn, Python-Multipart.
- **Machine Learning & NLP**: Scikit-learn (TF-IDF Vectorizer, Cosine Similarity), PyPDF, Regex boundary pattern matching.
- **Database**: SQLite3 (`resume_analyzer.db`).

---

## 🚀 Quick Start Guide

### Option 1: One-Click Run (FastAPI serves both API and React UI)

Simply open your terminal in the project directory and run:
```bash
.\run.bat
```
Or manually:
```bash
cd backend
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Then open your browser at:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

### Option 2: Full Development Mode (with Vite Hot Reload)

1. **Start Backend**:
   ```bash
   cd backend
   .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Start Frontend** (in a separate terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run at: **http://localhost:5173** (with API requests proxied to port 8000).

---

## 📁 Project Structure

```
ai-resume-analyzer/
├── sample_resume.pdf          # Pre-built sample PDF resume for testing
├── run.bat                    # 1-click startup script for Windows
├── README.md                  # Project documentation
├── backend/
│   ├── .venv/                 # Dedicated Python virtual environment
│   ├── requirements.txt       # Frozen Python dependencies
│   ├── main.py                # FastAPI routes & static SPA serving
│   ├── database.py            # SQLite database models & queries
│   ├── nlp_engine.py          # Skill taxonomy, ATS audit, TF-IDF matching
│   ├── sample_data.py         # Instant sample resumes & JDs
│   ├── test_backend.py        # Unit test script
│   └── test_e2e.py            # Complete end-to-end test suite
└── frontend/
    ├── package.json           # React & Vite packages
    ├── vite.config.js         # Vite configuration with Tailwind & proxy
    ├── dist/                  # Production build served by FastAPI
    └── src/
        ├── main.jsx           # App entry point
        ├── index.css          # Tailwind CSS v4 styles
        ├── App.jsx            # Main dashboard component
        └── components/
            ├── Navbar.jsx               # Header & sample picker
            ├── ResumeUpload.jsx         # PDF upload & paste mode
            ├── JobDescriptionInput.jsx  # Job description inputs
            ├── ScoreGauge.jsx           # Radial match gauge & sub-scores
            ├── SkillGapMatrix.jsx       # Matched, missing & bonus skill tags
            ├── SuggestionsList.jsx      # Prioritized improvement suggestions
            ├── TailoredBullets.jsx      # AI role-tailored bullet points
            ├── AtsAuditCard.jsx         # ATS scanner checklist
            └── HistoryModal.jsx         # SQLite history drawer
```
