import os
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("=== 1. Testing Health Endpoint ===")
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.status_code}"
    print("Health check OK:", r.json())

    print("\n=== 2. Testing Sample Profiles Endpoint ===")
    r = client.get("/api/samples")
    assert r.status_code == 200
    samples = r.json()
    print(f"Loaded {len(samples)} sample profiles: {[s['title'] for s in samples]}")

    print("\n=== 3. Testing PDF Upload & Extraction ===")
    pdf_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_resume.pdf")
    with open(pdf_path, "rb") as f:
        r = client.post("/api/upload-resume", files={"file": ("sample_resume.pdf", f, "application/pdf")})
    assert r.status_code == 200, f"Upload failed: {r.text}"
    upload_res = r.json()
    print("Upload succeeded!")
    print("Extracted Word Count:", upload_res["word_count"])
    print("Detected Contact Info:", upload_res["contact_info"])
    print("Detected Skills Count:", upload_res["skills_data"]["total_skills"])
    print("Skills Found:", upload_res["skills_data"]["all_skills"][:8])
    print("ATS Score:", upload_res["ats_audit"]["score"])

    print("\n=== 4. Testing Job Matching & Skill Gap Analysis ===")
    job_desc = """
    We are hiring a Senior Full Stack Engineer.
    Required Tech Stack: React, TypeScript, Node.js, Express, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL, CI/CD.
    Must have experience with microservices, unit testing (Jest), and strong leadership skills.
    Preferred: Python, Next.js, Tailwind CSS.
    """
    analyze_payload = {
        "resume_id": upload_res["resume_id"],
        "resume_text": upload_res["extracted_text"],
        "job_description": job_desc,
        "job_title": "Senior Full Stack Engineer",
        "company": "Top Tier Tech"
    }
    r = client.post("/api/analyze", json=analyze_payload)
    assert r.status_code == 200, f"Analyze failed: {r.text}"
    analysis = r.json()
    print("Analysis Succeeded!")
    print(f"Overall Match Score: {analysis['match_score']}% ({analysis['match_tier']})")
    print(f"Skill Score: {analysis['skill_score']}% | Semantic: {analysis['semantic_score']}% | ATS: {analysis['ats_score']}%")
    print(f"Matched Skills ({len(analysis['matched_skills'])}):", analysis["matched_skills"])
    print(f"Missing Skills ({len(analysis['missing_skills'])}):", analysis["missing_skills"])
    print(f"Bonus Skills ({len(analysis['bonus_skills'])}):", analysis["bonus_skills"])
    print(f"Domain Breakdown Categories: {list(analysis['category_breakdown'].keys())}")
    print(f"AI Suggestions Generated: {len(analysis['suggestions'])}")
    for s in analysis["suggestions"]:
        print(f"  - [{s['priority']}] {s['title']}")
    print(f"Tailored Bullets Generated: {len(analysis['tailored_bullets'])}")
    for b in analysis["tailored_bullets"]:
        print(f"  {b}")

    print("\n=== 5. Testing SQLite History ===")
    r = client.get("/api/history")
    assert r.status_code == 200
    history = r.json()
    print(f"Total analyses in SQLite: {len(history)}")
    latest_id = history[0]["id"]

    r = client.get(f"/api/history/{latest_id}")
    assert r.status_code == 200
    detail = r.json()
    print(f"Retrieved analysis #{detail['id']} for '{detail['job_title']}' at '{detail['company']}'")

    print("\n=== 6. Testing AI Tailored Bullets Rewrite ===")
    r = client.post("/api/ai-rewrite", json={
        "job_title": "Senior Full Stack Engineer",
        "matched_skills": analysis["matched_skills"],
        "missing_skills": analysis["missing_skills"]
    })
    assert r.status_code == 200
    rewrite_res = r.json()
    print("Rewrite succeeded! Generated bullets count:", len(rewrite_res["tailored_bullets"]))

    print("\n=== ALL BACKEND & NLP TESTS PASSED PERFECTLY! ===")

if __name__ == "__main__":
    run_tests()
