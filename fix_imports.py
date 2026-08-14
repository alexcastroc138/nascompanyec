import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    if "from 'utils/dateUtils'" in content:
        content = content.replace("from 'utils/dateUtils'", "from '../utils/dateUtils'")
        
    if original_content != content:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            process_file(os.path.join(root, file))

