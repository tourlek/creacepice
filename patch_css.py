import re

with open("src/index.css", "r") as f:
    content = f.read()

# Replace light mode primary
# Indigo-600 is approx oklch(0.546 0.245 262.881)
# I'll replace any --primary: oklch(...); under :root
content = re.sub(r'(--primary:\s*oklch\()[\d\. ]+(\);)', r'\g<1>0.546 0.245 262.881\g<2>', content, count=1)

# And --primary-foreground: oklch(0.985 0 0); -> keep white
# For dark mode (.dark), replace the first --primary: oklch(...) inside it
# Indigo-500 is approx oklch(0.627 0.265 264.206)
content = re.sub(r'(\.dark\s*\{[^\}]*--primary:\s*oklch\()[\d\. ]+(\);)', r'\g<1>0.627 0.265 264.206\g<2>', content, count=1)

with open("src/index.css", "w") as f:
    f.write(content)
