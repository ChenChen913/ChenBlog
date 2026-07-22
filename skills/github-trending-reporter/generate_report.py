import json
import os
from jinja2 import Environment, FileSystemLoader
import datetime

def generate_report():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, 'trending_data.json')
    
    # Load data
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            repos = json.load(f)
    except FileNotFoundError:
        print(f"Error: trending_data.json not found at {data_path}. Run fetch_trending.py first.")
        return

    # Load template
    template_dir = os.path.join(current_dir, 'templates')
    if not os.path.exists(template_dir):
        print(f"Error: templates directory not found at {template_dir}")
        return
        
    env = Environment(loader=FileSystemLoader(template_dir))
    try:
        template = env.get_template('email.html')
    except Exception:
        print("Template email.html not found.")
        return
    
    # Render
    date_str = datetime.date.today().strftime('%Y-%m-%d')
    html_content = template.render(repos=repos, date=date_str)
    
    # Save
    output_path = os.path.join(current_dir, 'report.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    print(f"Successfully generated report.html at {output_path}")

if __name__ == "__main__":
    generate_report()
