"""
Vite / Modelence Project Scraper & Downloader
Extracts all original, untranspiled source files, assets, and configurations
directly from a live sandbox/dev server.
"""

import os
import sys
import json
import base64
import re
import urllib.request
import urllib.error

DEFAULT_URL = 'https://tenant-sandbox-9rcmt.sandbox.modelence.app'
FALLBACK_SNIPPET = '<title>Empty Project</title>'
EXTENSIONS = ['', '.tsx', '.ts', '.jsx', '.js', '.json', '.css', '.svg', '/index.tsx', '/index.ts']

SEED_FILES = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'tailwind.config.js',
    'postcss.config.js',
    'modelence.config.ts',
    '.gitignore',
    'src/client/index.html',
    'src/client/index.tsx',
    'src/client/index.css',
    'src/client/router.tsx',
    'src/client/assets/favicon.svg',
    'src/server/app.ts',
    'src/server/example/index.ts',
    'src/server/movies/index.ts',
    'src/server/migrations/createDemoUser.ts'
]

def is_fallback_html(content_bytes):
    try:
        text = content_bytes.decode('utf-8', errors='ignore')
        return FALLBACK_SNIPPET in text
    except Exception:
        return False

def extract_original_content(content_bytes, filepath):
    try:
        text = content_bytes.decode('utf-8')
        if '//# sourceMappingURL=data:application/json;base64,' in text:
            b64 = text.split('//# sourceMappingURL=data:application/json;base64,')[1].strip()
            b64 = b64.split()[0]
            data = json.loads(base64.b64decode(b64).decode('utf-8'))
            if 'sourcesContent' in data and data['sourcesContent'] and data['sourcesContent'][0]:
                return data['sourcesContent'][0].encode('utf-8'), True
    except Exception:
        pass
    return content_bytes, False

def extract_imports(text, current_file):
    import_paths = []
    patterns = [
        r'(?:import|export)\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]',
        r'import\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)',
        r'require\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)',
        r'import\s+[\'"]([^\'"]+)[\'"]'
    ]
    for p in patterns:
        for match in re.finditer(p, text):
            imp = match.group(1)
            if imp.startswith('.'):
                cur_dir = os.path.dirname(current_file).replace('\\', '/')
                target = os.path.normpath(os.path.join(cur_dir, imp)).replace('\\', '/')
                import_paths.append(target)
            elif imp.startswith('@/'):
                target = os.path.normpath(os.path.join('src', imp[2:])).replace('\\', '/')
                import_paths.append(target)
            elif imp.startswith('/'):
                target1 = os.path.normpath(os.path.join('src/client', imp.lstrip('/'))).replace('\\', '/')
                target2 = imp.lstrip('/')
                import_paths.extend([target1, target2])
    return import_paths

def crawl_project(base_url=DEFAULT_URL, dest_dir=None):
    if dest_dir is None:
        dest_dir = os.path.dirname(os.path.abspath(__file__))

    base_url = base_url.rstrip('/') + '/@fs/user-app/'
    queue = list(SEED_FILES)
    visited = set()
    saved = set()

    print(f"Connecting to: {base_url}")
    print(f"Destination directory: {dest_dir}\n")

    while queue:
        item = queue.pop(0).replace('\\', '/').lstrip('/')
        if item in visited:
            continue
        visited.add(item)

        for ext in EXTENSIONS:
            candidate = item + ext if not item.endswith(ext) or ext == '' else item
            candidate = os.path.normpath(candidate).replace('\\', '/')
            if candidate in saved:
                break
            
            url = base_url + candidate
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as resp:
                    if resp.status == 200:
                        raw_data = resp.read()
                        if is_fallback_html(raw_data) and not candidate.endswith('.html'):
                            continue

                        content, from_map = extract_original_content(raw_data, candidate)
                        out_path = os.path.join(dest_dir, candidate)
                        os.makedirs(os.path.dirname(out_path), exist_ok=True)
                        with open(out_path, 'wb') as f:
                            f.write(content)
                        saved.add(candidate)
                        print(f" -> Downloaded: {candidate} ({len(content)} bytes)")

                        try:
                            text = content.decode('utf-8')
                            new_imports = extract_imports(text, candidate)
                            for ni in new_imports:
                                if ni not in visited and ni not in queue:
                                    queue.append(ni)
                        except Exception:
                            pass
                        break
            except urllib.error.HTTPError:
                pass
            except Exception:
                pass

    print(f"\nFinished. Total {len(saved)} files saved to {dest_dir}")

if __name__ == '__main__':
    target_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    output_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(__file__))
    crawl_project(target_url, output_dir)
