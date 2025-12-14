from playwright.sync_api import sync_playwright
import time

def verify_full_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Capture logs
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Browser Error: {exc}"))

        try:
            # 1. Landing Page
            page.goto("http://localhost:3000")
            page.wait_for_selector("text=Future Potential", state="visible")
            print("Landing Page Loaded")

            # 2. Simulate User Flow -> Onboarding
            page.click("text=Get Started Free")

            page.wait_for_selector("text=Let's build your profile", state="visible", timeout=5000)
            print("Onboarding Step 1 Loaded")

            page.fill("input[placeholder='e.g. Alex Johnson']", "Test User")
            page.click("button:has-text('Continue')")

            page.wait_for_selector("text=Academic Background", state="visible", timeout=5000)
            print("Onboarding Step 2 Loaded")

            page.click("text=Undergraduate")
            page.click("button:has-text('Continue')")

            page.wait_for_selector("text=Magic Upload", state="visible", timeout=5000)
            print("Onboarding Step 3 Loaded")

            page.click("button:has-text('Complete Profile')")
            print("Clicked Complete Profile")

            # Take immediate screenshot after click
            time.sleep(1)
            page.screenshot(path="verification/dashboard_transition.png")
            print("Screenshot: Dashboard Transition")

            # 3. Dashboard
            # Wait for Dashboard or Loading State
            # Dashboard shows "ScholarAI" or "Loading Profile..."
            # Wait for ANY text content that indicates we are not on a white screen
            try:
                page.wait_for_function("document.body.innerText.length > 0")
                # Wait for specific element
                page.wait_for_selector("text=ScholarAI", state="visible", timeout=10000)
                print("Dashboard Loaded")
                time.sleep(2)
                page.screenshot(path="verification/dashboard_view.png")
            except Exception as e:
                print(f"Dashboard Load Failed: {e}")
                page.screenshot(path="verification/dashboard_fail.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_full_app.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_full_app()
