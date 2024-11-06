import json
import re
from collections import defaultdict

"""
This script analyzes a Figma design tokens JSON file to identify and categorize token references.
It helps in understanding the structure and dependencies within the design token system.
"""

def analyze_json_file(file_path):
    """
    Analyzes a JSON file containing Figma design tokens.

    Args:
    file_path (str): Path to the JSON file containing Figma design tokens.

    This function reads the JSON file, traverses its structure, and identifies token references.
    It then prints out a categorized list of these references.
    """
    with open(file_path, 'r') as file:
        data = json.load(file)

    references = defaultdict(set)
    reference_pattern = re.compile(r'\{([^}]+)\}')

    def traverse(obj, path):
        """
        Recursively traverses the JSON object to find token references.

        Args:
        obj: The current object or value being traversed.
        path (list): The current path in the JSON structure.

        This function identifies references in string values and adds them to the references dictionary.
        """
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

    # Print the categorized references
    for category, refs in sorted(references.items()):
        print(f"\n{category}:")
        for ref in sorted(refs):
            print(f"  - {ref}")

# File path to the Figma design tokens JSON file
file_path = '../curve-figma-design-tokens/curve-figma-design.tokens.json'

# Run the analysis
analyze_json_file(file_path)
