
import asyncio
from playwright.async_api import async_playwright
import os

async def audit_onboarding():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        print("Navigating to homepage...")
        try:
            await page.goto("http://localhost:3000", timeout=30000)
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path="verification/step1_landing.png")
            print("Landing page loaded. Screenshot saved.")
        except Exception as e:
            print(f"Error loading homepage: {e}")
            await browser.close()
            return

        # Click 'Get Started'
        print("Clicking 'Get Started'...")
        try:
            # Try to find a button with text "Get Started Free" or "Start Your Journey" or "Login"
            # Using a broad selector to catch one of them.
            get_started_btn = page.locator("text=Get Started Free").first
            if await get_started_btn.is_visible():
                await get_started_btn.click()
            else:
                print("'Get Started Free' not found, trying 'Login'...")
                await page.click("text=Login")

            # Wait for Onboarding component to load.
            # We can check for text like "Create Your Profile" or the option cards.
            await page.wait_for_timeout(2000) # Wait for animation/state change
            await page.screenshot(path="verification/step2_onboarding_options.png")
            print("Onboarding options loaded. Screenshot saved.")
        except Exception as e:
            print(f"Error clicking Get Started: {e}")
            await page.screenshot(path="verification/error_step2.png")
            await browser.close()
            return

        # Check for Manual Option
        print("Selecting 'Fill Manually'...")
        try:
            # Look for "Fill Manually" text
            manual_option = page.locator("text=Fill Manually")
            if await manual_option.is_visible():
                # The card itself might be the clickable element, or a button inside it.
                # In the code: onClick={() => { setView('form'); setStep(1); }} is on the OptionCard div/button.
                # We can click the text, it should bubble up.
                await manual_option.click()

                await page.wait_for_timeout(1000)
                await page.screenshot(path="verification/step3_manual_form_step1.png")
                print("Manual Form Step 1 loaded. Screenshot saved.")
            else:
                print("'Fill Manually' option not found.")
                await page.screenshot(path="verification/error_step3.png")

        except Exception as e:
            print(f"Error selecting Manual Option: {e}")
            await page.screenshot(path="verification/error_step3_exception.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(audit_onboarding())
