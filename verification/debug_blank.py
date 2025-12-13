
import asyncio
from playwright.async_api import async_playwright

async def debug_blank():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        try:
            print("Navigating...")
            await page.goto("http://localhost:3000")
            print("Navigation complete. Waiting for rendering...")
            await page.wait_for_timeout(5000)
            await page.screenshot(path="verification/blank_debug.png")
            print("Screenshot saved.")
        except Exception as e:
            print(f"Script Error: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_blank())
