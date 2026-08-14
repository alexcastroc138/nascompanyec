import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    # Needs import if we modify
    if 'toISOString' in content or 'todayStr' in content or 'getTodayStr' in content:
        # Determine relative path to src/utils/dateUtils
        depth = filepath.count('/') - 1
        if depth == 0:
            import_path = './utils/dateUtils'
        else:
            import_path = '../' * (depth - 1) + 'utils/dateUtils'
            
        import_stmt = f"import {{ getLocalISOString, getTodayStr }} from '{import_path}';"
        
        if 'getTodayStr' not in content and 'getLocalISOString' not in content:
             # inject import after the last import
             imports = re.findall(r'^import .*;$', content, re.MULTILINE)
             if imports:
                 last_import = imports[-1]
                 content = content.replace(last_import, last_import + '\n' + import_stmt)
             else:
                 content = import_stmt + '\n' + content

        content = content.replace("new Date().toISOString().split('T')[0]", "getTodayStr()")
        content = content.replace("(new Date(Date.now() - tzOffset)).toISOString().split('T')[0]", "getTodayStr()")
        content = content.replace("new Date().toISOString()", "getLocalISOString()")
        
        # fix double imports if any
        
    if original_content != content:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            process_file(os.path.join(root, file))

