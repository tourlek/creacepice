import re

with open("server.ts", "r") as f:
    content = f.read()

# Replace the dotenv import and config
content = content.replace('import dotenv from "dotenv";', '')
content = content.replace('dotenv.config();', '')

# Prepend it to the top
new_content = 'import "dotenv/config";\n' + content

with open("server.ts", "w") as f:
    f.write(new_content)
