import os
import sys

def check_syntax(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            # Basic check for balanced braces (very simple)
            if content.count('{') != content.count('}'):
                print(f"Warning: Unbalanced braces in {filepath}")
            if content.count('(') != content.count(')'):
                print(f"Warning: Unbalanced parentheses in {filepath}")
            print(f"Checked {filepath}: OK")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

files = [
    'components/Dashboard.tsx',
    'components/dashboard/OpportunitiesView.tsx',
    'components/Onboarding.tsx'
]

for f in files:
    check_syntax(f)
