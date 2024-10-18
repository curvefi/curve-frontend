import json
import re
from collections import defaultdict

def analyze_json_file(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)

    references = defaultdict(set)
    reference_pattern = re.compile(r'\{([^}]+)\}')

    def traverse(obj, path):
        if isinstance(obj, dict):
            for key, value in obj.items():
                new_path = path + [key]
                if isinstance(value, str):
                    matches = reference_pattern.findall(value)
                    for match in matches:
                        ref_parts = match.split('.')
                        if len(ref_parts) >= 3:
                            ref_key = '.'.join(ref_parts[:3])
                            references['.'.join(path[:2])].add(ref_key)
                traverse(value, new_path)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                traverse(item, path + [str(i)])

    traverse(data, [])

    for category, refs in sorted(references.items()):
        print(f"\n{category}:")
        for ref in sorted(refs):
            print(f"  - {ref}")

file_path = '../curve-figma-design-tokens/curve-figma-design.tokens.json'
analyze_json_file(file_path)
