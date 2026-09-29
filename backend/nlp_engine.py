import re
import math
from typing import Dict, List, Set, Tuple, Any, Optional
from io import BytesIO
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# --- SKILL TAXONOMY & NORMALIZATION ---
SKILL_TAXONOMY: Dict[str, List[str]] = {
    "Programming Languages": [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go",
        "Rust", "Ruby", "PHP", "Swift", "Kotlin", "R", "MATLAB", "SQL",
        "HTML", "CSS", "Bash", "Shell", "PowerShell", "Dart", "Scala"
    ],
    "Frontend Development": [
        "React", "Next.js", "Vue.js", "Angular", "Svelte", "Tailwind CSS",
        "Bootstrap", "Redux", "Zustand", "HTML5", "CSS3", "Sass", "SCSS",
        "Webpack", "Vite", "jQuery", "Material UI", "Chakra UI", "Shadcn UI",
        "Responsive Design", "WebSockets", "GraphQL"
    ],
    "Backend & APIs": [
        "Node.js", "Express", "FastAPI", "Flask", "Django", "Spring Boot",
        "ASP.NET", "Ruby on Rails", "REST API", "GraphQL", "gRPC",
        "Microservices", "Celery", "Kafka", "RabbitMQ", "Redis",
        "Serverless", "OAuth", "JWT", "API Gateway"
    ],
    "Databases & Storage": [
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Cassandra",
        "DynamoDB", "Elasticsearch", "Firebase", "Supabase", "Neo4j",
        "Oracle", "Snowflake", "BigQuery", "MariaDB", "Prisma", "SQLAlchemy"
    ],
    "Cloud & DevOps": [
        "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform",
        "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins", "Linux",
        "Nginx", "Ansible", "Helm", "CloudFormation", "Prometheus",
        "Grafana", "AWS Lambda", "ECS", "EKS", "S3", "CloudFront"
    ],
    "AI, ML & Data Science": [
        "Machine Learning", "Deep Learning", "NLP", "Natural Language Processing",
        "Computer Vision", "PyTorch", "TensorFlow", "Keras", "Scikit-learn",
        "Hugging Face", "Transformers", "LLMs", "LangChain", "LlamaIndex",
        "RAG", "OpenAI", "Gemini API", "Pandas", "NumPy", "SciPy",
        "Matplotlib", "Seaborn", "OpenCV", "XGBoost", "LightGBM",
        "Data Analysis", "Feature Engineering", "Data Modeling", "Prompt Engineering"
    ],
    "Mobile Development": [
        "React Native", "Flutter", "iOS", "Android", "Swift", "Kotlin",
        "Expo", "Mobile UI", "Cross-Platform"
    ],
    "Testing & Quality": [
        "Jest", "Cypress", "Pytest", "Selenium", "Playwright", "Mocha",
        "Chai", "JUnit", "Unit Testing", "Integration Testing", "TDD",
        "E2E Testing", "Load Testing"
    ],
    "Tools & Methodologies": [
        "Git", "GitHub", "GitLab", "Postman", "JIRA", "Agile", "Scrum",
        "Kanban", "Figma", "Object-Oriented Programming", "Design Patterns",
        "System Design", "Clean Architecture", "Code Review"
    ],
    "Soft Skills": [
        "Leadership", "Problem Solving", "Communication", "Team Collaboration",
        "Time Management", "Critical Thinking", "Project Management",
        "Mentoring", "Adaptability", "Analytical Thinking", "Ownership"
    ]
}

SYNONYMS: Dict[str, str] = {
    "react.js": "React",
    "reactjs": "React",
    "react": "React",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express.js": "Express",
    "expressjs": "Express",
    "express": "Express",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "gcp": "Google Cloud",
    "google cloud platform": "Google Cloud",
    "google cloud": "Google Cloud",
    "aws": "AWS",
    "amazon web services": "AWS",
    "golang": "Go",
    "go": "Go",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "py": "Python",
    "python": "Python",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "nlp": "Natural Language Processing",
    "natural language processing": "Natural Language Processing",
    "sklearn": "Scikit-learn",
    "scikit-learn": "Scikit-learn",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "rest": "REST API",
    "restful": "REST API",
    "rest api": "REST API",
    "restful api": "REST API",
    "llm": "LLMs",
    "llms": "LLMs",
    "large language models": "LLMs",
    "github actions": "GitHub Actions",
    "git hub": "GitHub",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "elastic search": "Elasticsearch",
    "elasticsearch": "Elasticsearch",
    "docker": "Docker",
    "microservice": "Microservices",
    "microservices": "Microservices",
    "fastapi": "FastAPI",
    "fast api": "FastAPI",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    "spring boot": "Spring Boot",
    "oop": "Object-Oriented Programming",
    "object oriented programming": "Object-Oriented Programming"
}

# Strong impact action verbs for ATS & resume analysis
STRONG_ACTION_VERBS = [
    "architected", "developed", "engineered", "implemented", "optimized",
    "spearheaded", "orchestrated", "designed", "scaled", "automated",
    "streamlined", "revamped", "reduced", "increased", "accelerated",
    "delivered", "launched", "mentored", "collaborated", "transformed"
]

WEAK_ACTION_VERBS = [
    "worked on", "helped", "assisted", "responsible for", "participated in",
    "handled", "did", "tasked with", "involved in"
]

def clean_text(text: str) -> str:
    """Normalize text spacing and clean formatting."""
    text = re.sub(r'\r\n|\r', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract clean text content from a PDF file."""
    reader = PdfReader(BytesIO(pdf_bytes))
    full_text = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            full_text.append(page_text)
    return clean_text("\n\n".join(full_text))

def extract_contact_info(text: str) -> Dict[str, Any]:
    """Extract emails, phone numbers, and profile URLs using robust regex."""
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    phone_pattern = r'(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}|\+?\d{10,12}'
    linkedin_pattern = r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+'
    github_pattern = r'(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+'
    portfolio_pattern = r'https?:\/\/(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?'

    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)
    linkedin = re.findall(linkedin_pattern, text, re.IGNORECASE)
    github = re.findall(github_pattern, text, re.IGNORECASE)
    
    # Filter portfolio URLs to exclude linkedin/github
    all_urls = re.findall(portfolio_pattern, text, re.IGNORECASE)
    portfolios = [
        u for u in all_urls 
        if not re.search(r'linkedin\.com|github\.com', u, re.I)
    ]

    return {
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "linkedin": linkedin[0] if linkedin else None,
        "github": github[0] if github else None,
        "portfolio": portfolios[0] if portfolios else None
    }

def extract_sections(text: str) -> Dict[str, str]:
    """Parse resume into standard sections like Experience, Education, Projects, Skills."""
    sections = {
        "summary": "",
        "experience": "",
        "education": "",
        "projects": "",
        "skills": "",
        "certifications": ""
    }

    section_headers = {
        "summary": r'(?:professional\s+summary|summary|profile|about\s+me|objective)',
        "experience": r'(?:work\s+experience|professional\s+experience|experience|employment\s+history|career)',
        "education": r'(?:education|academic\s+background|academics|qualifications)',
        "projects": r'(?:projects|personal\s+projects|key\s+projects|notable\s+projects)',
        "skills": r'(?:technical\s+skills|skills\s+and\s+competencies|skills|core\s+competencies|technologies)',
        "certifications": r'(?:certifications|certificates|licenses|achievements|awards)'
    }

    # Build regex to split into sections
    combined_pattern = r'(?im)^(?:\s*[\#\*\-]*\s*)(' + '|'.join(section_headers.values()) + r')(?:\s*[:\-]?\s*)$'
    matches = list(re.finditer(combined_pattern, text))

    if not matches:
        return sections

    for i in range(len(matches)):
        header_text = matches[i].group(1).lower()
        start_idx = matches[i].end()
        end_idx = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        content = text[start_idx:end_idx].strip()

        for sec_name, sec_regex in section_headers.items():
            if re.search(sec_regex, header_text, re.IGNORECASE):
                sections[sec_name] = content
                break

    return sections

def extract_skills_from_text(text: str) -> Dict[str, Any]:
    """Extract and categorize tech and soft skills using semantic boundary matching."""
    text_lower = text.lower()
    detected_skills: Set[str] = set()

    # Match normalized synonyms first
    for synonym, canonical in SYNONYMS.items():
        pattern = r'(?:\b|(?<=\W))' + re.escape(synonym) + r'(?:\b|(?=\W))'
        if re.search(pattern, text_lower):
            detected_skills.add(canonical)

    # Match all skills in taxonomy
    for category, skill_list in SKILL_TAXONOMY.items():
        for skill in skill_list:
            skill_lower = skill.lower()
            pattern = r'(?:\b|(?<=\W))' + re.escape(skill_lower) + r'(?:\b|(?=\W))'
            if re.search(pattern, text_lower):
                detected_skills.add(skill)

    # Categorize detected skills
    categorized: Dict[str, List[str]] = {cat: [] for cat in SKILL_TAXONOMY}
    uncategorized: List[str] = []

    for skill in sorted(detected_skills):
        found_category = False
        for cat, skill_list in SKILL_TAXONOMY.items():
            if skill in skill_list:
                categorized[cat].append(skill)
                found_category = True
                break
        if not found_category:
            uncategorized.append(skill)

    # Filter out empty categories for clean payload
    active_categories = {k: v for k, v in categorized.items() if v}

    return {
        "all_skills": sorted(list(detected_skills)),
        "by_category": active_categories,
        "total_skills": len(detected_skills)
    }

def calculate_ats_audit(text: str, sections: Dict[str, str], contact: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate resume ATS readability, completeness, metrics, and impact verbs."""
    word_count = len(text.split())
    
    # 1. Contact Score (max 25)
    contact_items = [k for k, v in contact.items() if v]
    contact_score = min(25, len(contact_items) * 6.25)

    # 2. Section Completeness (max 35)
    present_sections = [k for k, v in sections.items() if len(v) > 20]
    section_score = (len(present_sections) / max(1, len(sections))) * 35

    # 3. Action Verbs (max 20)
    text_lower = text.lower()
    action_verbs_found = [verb for verb in STRONG_ACTION_VERBS if re.search(r'\b' + re.escape(verb) + r'\b', text_lower)]
    weak_verbs_found = [verb for verb in WEAK_ACTION_VERBS if re.search(r'\b' + re.escape(verb) + r'\b', text_lower)]
    action_verb_score = min(20, len(action_verbs_found) * 4)

    # 4. Quantification & Metrics (max 20)
    # Look for %, $, numbers + units
    quant_pattern = r'(?:\d+%\s*|\$\s*\d+|\b\d+\s*(?:k|m|million|billion|users|customers|ms|x|increase|reduction|growth)\b)'
    metrics_found = re.findall(quant_pattern, text, re.IGNORECASE)
    quant_score = min(20, len(metrics_found) * 5)

    # Length check
    length_status = "Optimal"
    if word_count < 300:
        length_status = "Too Short (Less than 300 words)"
    elif word_count > 1200:
        length_status = "Too Long (Over 1200 words)"

    total_ats_score = round(min(100, contact_score + section_score + action_verb_score + quant_score), 1)

    return {
        "score": total_ats_score,
        "word_count": word_count,
        "reading_time_minutes": max(1, round(word_count / 200, 1)),
        "length_status": length_status,
        "contact_items_found": contact_items,
        "present_sections": present_sections,
        "missing_sections": [k for k, v in sections.items() if len(v) <= 20],
        "action_verbs_count": len(action_verbs_found),
        "action_verbs": action_verbs_found,
        "weak_verbs": weak_verbs_found,
        "metrics_count": len(metrics_found)
    }

def calculate_semantic_similarity(resume_text: str, job_description: str) -> float:
    """Calculate TF-IDF Cosine Similarity between resume and job description."""
    try:
        vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000
        )
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        # Rescale gently: raw TF-IDF for full resumes is often 0.2 - 0.7
        normalized_sim = min(100.0, max(0.0, float(sim * 100 * 1.35)))
        return round(normalized_sim, 1)
    except Exception:
        return 50.0

def generate_improvement_suggestions(
    missing_skills: List[str],
    ats_audit: Dict[str, Any],
    job_title: str
) -> List[Dict[str, Any]]:
    """Generate high-impact, actionable recommendations to boost resume score."""
    suggestions = []

    # 1. Missing Skills Suggestions (High Priority)
    if missing_skills:
        top_missing = missing_skills[:6]
        suggestions.append({
            "type": "skills",
            "priority": "High",
            "title": f"Incorporate {len(top_missing)} Key Job Skills",
            "message": f"The job description highlights core skills that are currently missing from your resume: {', '.join(top_missing)}. Adding these in your Skills list and Project bullet points will directly elevate your ATS match.",
            "action": f"Add keywords: {', '.join(top_missing)}"
        })

    # 2. Missing Sections (Medium/High Priority)
    missing_sec = ats_audit.get("missing_sections", [])
    if "summary" in missing_sec:
        suggestions.append({
            "type": "structure",
            "priority": "High",
            "title": "Add a Tailored Professional Summary",
            "message": f"Your resume is missing a clear Summary section. A 3-line elevator pitch highlighting your core stack, years of experience, and alignment with '{job_title or 'the target role'}' gives recruiters immediate context.",
            "action": "Include a 3-sentence summary highlighting top skills and achievements."
        })
    if "projects" in missing_sec:
        suggestions.append({
            "type": "structure",
            "priority": "Medium",
            "title": "Add Project Showcase Section",
            "message": "Projects demonstrate hands-on application of your skills. Add 2-3 technical projects with links, technologies used, and outcomes.",
            "action": "Create a 'Featured Projects' section with live links and tech tags."
        })

    # 3. Action Verbs & Impact
    weak_verbs = ats_audit.get("weak_verbs", [])
    if weak_verbs:
        suggestions.append({
            "type": "verbs",
            "priority": "Medium",
            "title": "Replace Passive Phrasing with Impact Verbs",
            "message": f"We detected passive phrases such as: {', '.join(weak_verbs[:3])}. Replace them with strong engineering verbs like 'Architected', 'Spearheaded', 'Optimized', or 'Automated'.",
            "action": "Use strong action verbs at the beginning of each bullet point."
        })

    # 4. Quantification & Metrics (STAR Method)
    metrics_count = ats_audit.get("metrics_count", 0)
    if metrics_count < 3:
        suggestions.append({
            "type": "metrics",
            "priority": "High",
            "title": "Quantify Achievements (STAR Method)",
            "message": f"Your resume has only {metrics_count} quantified metrics. High-performing resumes show tangible business impact using numbers: e.g., 'Reduced query latency by 45%', 'Managed system handling 50k+ daily users', or 'Decreased CI/CD build time from 20m to 6m'.",
            "action": "Add specific metrics, percentages, or dollar amounts to at least 4 bullet points."
        })

    # 5. Length & Formatting
    if ats_audit.get("length_status") != "Optimal":
        suggestions.append({
            "type": "length",
            "priority": "Low",
            "title": f"Adjust Resume Length ({ats_audit.get('length_status')})",
            "message": "Standard 1-to-2 page tech resumes typically range between 400 and 900 words. Aim for concise, bulleted structure without dense paragraphs.",
            "action": "Aim for 450-850 words for clean single or double page scanning."
        })

    return suggestions

def generate_tailored_bullet_points(
    job_title: str,
    matched_skills: List[str],
    missing_skills: List[str]
) -> List[str]:
    """Generate role-tailored bullet points demonstrating how to bridge the skill gap."""
    bullets = []
    
    # Generate tailored points addressing missing or matched skills
    if missing_skills:
        primary_missing = missing_skills[0]
        bullets.append(
            f"• Spearheaded integration of {primary_missing} into core microservices, modernizing architecture and enhancing performance by 30%."
        )
    if len(missing_skills) > 1:
        sec_missing = missing_skills[1]
        bullets.append(
            f"• Architected scalable pipelines utilizing {sec_missing} and automated testing suites, reducing deployment cycles by 40%."
        )
    if matched_skills:
        primary_matched = matched_skills[0]
        bullets.append(
            f"• Leveraged advanced {primary_matched} capabilities to design high-throughput modules handling concurrent production traffic with 99.9% uptime."
        )

    if not bullets:
        bullets = [
            f"• Spearheaded end-to-end development of scalable applications, reducing API response times by 35% through query optimization and caching.",
            f"• Collaborated with cross-functional teams to automate deployment workflows, boosting engineering velocity and feature turnaround."
        ]

    return bullets

def analyze_resume_against_job(
    resume_text: str,
    job_description: str,
    job_title: str = "Software Professional",
    company: str = ""
) -> Dict[str, Any]:
    """Complete analysis: skill gap detection, ATS audit, semantic scoring, suggestions."""
    
    # 1. Extract resume metadata
    contact_info = extract_contact_info(resume_text)
    sections = extract_sections(resume_text)
    resume_skills_data = extract_skills_from_text(resume_text)
    resume_skills_set = set(resume_skills_data["all_skills"])

    # 2. Extract job description skills
    job_skills_data = extract_skills_from_text(job_description)
    job_skills_set = set(job_skills_data["all_skills"])

    # 3. Skill Gap Analysis
    matched_skills = sorted(list(resume_skills_set.intersection(job_skills_set)))
    missing_skills = sorted(list(job_skills_set.difference(resume_skills_set)))
    bonus_skills = sorted(list(resume_skills_set.difference(job_skills_set)))

    # 4. Category breakdown
    category_breakdown = {}
    for category, all_cat_skills in SKILL_TAXONOMY.items():
        cat_job_reqs = [s for s in job_skills_set if s in all_cat_skills]
        if cat_job_reqs:
            cat_matched = [s for s in cat_job_reqs if s in resume_skills_set]
            cat_missing = [s for s in cat_job_reqs if s not in resume_skills_set]
            match_pct = round((len(cat_matched) / len(cat_job_reqs)) * 100, 1)
            category_breakdown[category] = {
                "required_count": len(cat_job_reqs),
                "matched_count": len(cat_matched),
                "percentage": match_pct,
                "matched": cat_matched,
                "missing": cat_missing
            }

    # 5. Scores computation
    # Skill overlap score
    if job_skills_set:
        skill_score = round((len(matched_skills) / len(job_skills_set)) * 100, 1)
    else:
        skill_score = 70.0 # fallback when JD is purely descriptive without technical keywords

    # Semantic similarity score
    semantic_score = calculate_semantic_similarity(resume_text, job_description)

    # ATS score
    ats_audit = calculate_ats_audit(resume_text, sections, contact_info)
    ats_score = ats_audit["score"]

    # Composite Match Score
    # Weight: 60% Skill overlap + 25% Semantic TF-IDF + 15% ATS quality
    overall_match = round(
        (skill_score * 0.60) + (semantic_score * 0.25) + (ats_score * 0.15), 1
    )
    overall_match = min(100.0, max(0.0, overall_match))

    # Match rating category
    if overall_match >= 85:
        match_tier = "Exceptional Match"
        tier_color = "emerald"
    elif overall_match >= 70:
        match_tier = "Strong Match"
        tier_color = "blue"
    elif overall_match >= 50:
        match_tier = "Moderate Match"
        tier_color = "amber"
    else:
        match_tier = "Low Match / Needs Tailoring"
        tier_color = "rose"

    # 6. Suggestions & tailored bullet points
    suggestions = generate_improvement_suggestions(missing_skills, ats_audit, job_title)
    tailored_bullets = generate_tailored_bullet_points(job_title, matched_skills, missing_skills)

    return {
        "match_score": overall_match,
        "match_tier": match_tier,
        "tier_color": tier_color,
        "skill_score": skill_score,
        "semantic_score": semantic_score,
        "ats_score": ats_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "bonus_skills": bonus_skills,
        "resume_total_skills": len(resume_skills_set),
        "job_total_skills": len(job_skills_set),
        "category_breakdown": category_breakdown,
        "ats_audit": ats_audit,
        "contact_info": contact_info,
        "sections_detected": [k for k, v in sections.items() if len(v) > 20],
        "suggestions": suggestions,
        "tailored_bullets": tailored_bullets
    }
