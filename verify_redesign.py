
from playwright.sync_api import sync_playwright
import time
import json

def verify_design():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        # Subscribe to console events
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Browser Error: {exc}"))

        print("Simulating User Login (Dashboard)...")
        profile = {
            "name": "Jules Agent",
            "education": [{"institution": "MIT", "degree": "CS", "fieldOfStudy": "AI", "gpa": 4.0}],
            "experience": [],
            "skills": ["Python", "React"],
            "languages": ["English"],
            "goals": "Build viral apps",
            "financialSituation": "Moderate Need",
            "studyInterests": ["AI"],
            "summary": "Future AI Architect",
            "profileFeedback": "You are a strong candidate."
        }

        page.goto("http://localhost:3000")
        page.evaluate(f"window.localStorage.setItem('scholarai_user_profile', '{json.dumps(profile)}');")
        page.reload()
        time.sleep(5)

        page.screenshot(path="/home/jules/verification/3_dashboard.png")
        print("Captured Dashboard.")

        browser.close()

if __name__ == "__main__":
    verify_design()
