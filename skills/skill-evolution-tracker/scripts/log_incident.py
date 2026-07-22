import json
import os
import sys
import datetime

def log_incident(skill_name, trigger, issue, fix):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Evolution file is in parent dir
    evolution_file = os.path.abspath(os.path.join(current_dir, '../evolution.json'))
    
    entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "date": datetime.date.today().strftime('%Y-%m-%d'),
        "target_skill": skill_name,
        "trigger": trigger,
        "issue": issue,
        "fix_applied": fix
    }
    
    data = []
    if os.path.exists(evolution_file):
        try:
            with open(evolution_file, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content:
                    data = json.loads(content)
        except json.JSONDecodeError:
            print("Warning: evolution.json was corrupted. Starting fresh.")
            data = []
            
    data.append(entry)
    
    with open(evolution_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Incident logged for {skill_name}")

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: python log_incident.py <skill_name> <trigger> <issue> <fix>")
        print('Example: python log_incident.py "my-skill" "user error" "typo in prompt" "fixed typo"')
    else:
        log_incident(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
