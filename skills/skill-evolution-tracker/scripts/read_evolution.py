import json
import os
import sys

def read_evolution():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    evolution_file = os.path.abspath(os.path.join(current_dir, '../evolution.json'))
    
    if not os.path.exists(evolution_file):
        print("No evolution history found.")
        return
        
    try:
        with open(evolution_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading evolution file: {e}")
        return
        
    print(f"Evolution History ({len(data)} entries)")
    print("=" * 60)
    
    for i, entry in enumerate(reversed(data)):
        print(f"[{entry.get('date', 'Unknown Date')}] Target: {entry.get('target_skill', 'Unknown')}")
        print(f"Trigger: {entry.get('trigger', 'N/A')}")
        print(f"Issue:   {entry.get('issue', 'N/A')}")
        print(f"Fix:     {entry.get('fix_applied', 'N/A')}")
        print("-" * 60)

if __name__ == "__main__":
    read_evolution()
