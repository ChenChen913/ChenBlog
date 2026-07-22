import os
import shutil
import sys

PROTECTED_SKILLS = [
    'local-skill-manager',
    'skill-evolution-tracker',
    'skill-auditor',
    'writing-skills'
]

def delete_skill(skill_name):
    if skill_name in PROTECTED_SKILLS:
        print(f"Error: '{skill_name}' is a protected system skill and cannot be deleted.")
        return

    # Determine paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    skills_root = os.path.abspath(os.path.join(current_dir, '../../'))
    target_path = os.path.join(skills_root, skill_name)
    
    if not os.path.exists(target_path):
        print(f"Skill '{skill_name}' not found.")
        return
        
    print(f"Deleting {target_path}...")
    try:
        shutil.rmtree(target_path)
        print(f"Successfully deleted {skill_name}")
    except Exception as e:
        print(f"Error deleting skill: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python delete_skill.py <skill_name>")
    else:
        delete_skill(sys.argv[1])
