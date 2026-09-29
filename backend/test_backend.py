import sys
import main
from sample_data import SAMPLE_PROFILES

print("Python version:", sys.version)
print("Routes:", [r.path for r in main.app.routes])

# Test analyzing a sample profile
sample = SAMPLE_PROFILES[0]
req = main.AnalyzeRequest(
    resume_text=sample["resume_text"],
    job_description=sample["job_description"],
    job_title=sample["target_job"],
    company=sample["company"]
)
result = main.analyze_job_match(req)
print("Sample analysis successfully completed!")
print(f"Match Score: {result['match_score']}% ({result['match_tier']})")
print(f"Skill Score: {result['skill_score']}% | Semantic: {result['semantic_score']}% | ATS: {result['ats_score']}%")
print(f"Matched Skills ({len(result['matched_skills'])}):", result['matched_skills'][:5])
print(f"Missing Skills ({len(result['missing_skills'])}):", result['missing_skills'][:5])
print(f"Suggestions ({len(result['suggestions'])}):", [s['title'] for s in result['suggestions']])
