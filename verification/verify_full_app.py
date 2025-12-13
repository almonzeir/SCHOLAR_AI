from playwright.sync_api import sync_playwright
import time

def verify_full_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            # 1. Landing Page (already verified, but checking consistency)
            page.goto("http://localhost:3000")
            page.wait_for_selector("text=Future Potential", state="visible")
            print("Landing Page Loaded")

            # 2. Simulate User Flow -> Onboarding
            # Click "Get Started"
            page.click("text=Get Started Free")

            # Wait for Onboarding Step 1
            page.wait_for_selector("text=Let's build your profile", state="visible", timeout=5000)
            time.sleep(1) # Wait for fade-in
            page.screenshot(path="verification/onboarding_step1.png")
            print("Screenshot: Onboarding Step 1")

            # Fill Step 1
            page.fill("input[placeholder='e.g. Alex Johnson']", "Test User")
            page.click("button:has-text('Continue')")

            # Wait for Step 2
            page.wait_for_selector("text=Academic Background", state="visible", timeout=5000)
            time.sleep(1)
            page.screenshot(path="verification/onboarding_step2.png")
            print("Screenshot: Onboarding Step 2")

            # Fill Step 2
            page.click("text=Undergraduate")
            page.click("button:has-text('Continue')")

            # Wait for Step 3
            page.wait_for_selector("text=Magic Upload", state="visible", timeout=5000)
            time.sleep(1)
            page.screenshot(path="verification/onboarding_step3.png")
            print("Screenshot: Onboarding Step 3")

            # Complete Onboarding
            page.click("button:has-text('Complete Profile')")

            # 3. Dashboard
            # Wait for Dashboard to load (Profile View or Opportunities)
            # The dashboard shows "ScholarAI" in sidebar
            page.wait_for_selector("text=ScholarAI", state="visible", timeout=10000)
            time.sleep(2) # Wait for animations
            page.screenshot(path="verification/dashboard_view.png")
            print("Screenshot: Dashboard View")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_full_app.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_full_app()
