from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to home page...")
        page.goto("http://localhost:3000")
        time.sleep(5) # Wait for animations

        print("Taking screenshot of landing page...")
        page.screenshot(path="final_landing_v2.png", full_page=True)

        print("Clicking 'Sign In' to go to Onboarding...")
        # Assuming the 'Sign In' button triggers onboarding or login
        # In LandingPage.tsx: <button onClick={onGetStarted} ...>Sign In</button>
        # And onGetStarted sets showLanding(false)

        # Click the button with text "Sign In" or "Find Scholarships"
        page.click("text=Find Scholarships")
        time.sleep(2)

        print("Taking screenshot of Onboarding Step 1...")
        page.screenshot(path="final_onboarding_v2.png")

        browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    run()
