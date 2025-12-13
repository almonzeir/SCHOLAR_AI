from playwright.sync_api import sync_playwright
import time

def verify_design():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to see desktop layout
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            # 1. Navigate to the app
            page.goto("http://localhost:3000")

            # 2. Wait for the Hero text to animate in
            # The headline "Future Potential" should be visible
            page.wait_for_selector("text=Future Potential", state="visible", timeout=10000)
            # Give animations a moment to settle
            time.sleep(2)
            page.screenshot(path="verification/hero_v2.png")
            print("Screenshot 1: Hero Section captured")

            # 3. Scroll to Features (Bento Grid)
            # Find the element with "Why ScholarAI?"
            features_heading = page.get_by_text("Why ScholarAI?")
            features_heading.scroll_into_view_if_needed()
            # Wait for scroll reveal
            time.sleep(2)
            page.screenshot(path="verification/features_v2.png")
            print("Screenshot 2: Features Section captured")

            # 4. Scroll to CTA at the bottom
            cta_button = page.get_by_text("Start Your Journey Now")
            cta_button.scroll_into_view_if_needed()
            time.sleep(2)
            page.screenshot(path="verification/cta_v2.png")
            print("Screenshot 3: CTA Section captured")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_v2.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_design()
