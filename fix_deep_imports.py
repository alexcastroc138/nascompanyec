import os

def fix_imports():
    for root, _, files in os.walk('src'):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                depth = filepath.count('/') - 1
                if depth == 2:
                    with open(filepath, 'r') as f:
                        content = f.read()
                    if "from '../utils/dateUtils'" in content:
                        content = content.replace("from '../utils/dateUtils'", "from '../../utils/dateUtils'")
                        with open(filepath, 'w') as f:
                            f.write(content)

fix_imports()
