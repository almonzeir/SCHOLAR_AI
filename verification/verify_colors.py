import re

def verify_tailwind_config():
    with open('tailwind.config.js', 'r') as f:
        content = f.read()

    required = ['deep-space', 'gradient-x', 'pulseGlow']
    missing = [req for req in required if req not in content]

    if missing:
        print(f"Missing in tailwind.config.js: {missing}")
        exit(1)
    print("tailwind.config.js verification passed")

if __name__ == "__main__":
    verify_tailwind_config()
