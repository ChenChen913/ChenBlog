import requests
from bs4 import BeautifulSoup
import json
import datetime
import os

def fetch_trending():
    url = "https://github.com/trending"
    print(f"Fetching trending repos from {url}...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    soup = BeautifulSoup(response.text, 'html.parser')
    repos = []
    
    for article in soup.select('article.Box-row'):
        try:
            # Title
            h1 = article.select_one('h1')
            link = h1.select_one('a')
            name = link.get_text(strip=True).replace(' ', '').replace('\n', '')
            url = "https://github.com" + link['href']
            
            # Description
            p = article.select_one('p.col-9')
            desc = p.get_text(strip=True) if p else "No description"
            
            # Language
            lang_span = article.select_one('[itemprop="programmingLanguage"]')
            lang = lang_span.get_text(strip=True) if lang_span else "Unknown"
            
            # Stars
            stars_link = article.select_one('a[href$="/stargazers"]')
            stars = stars_link.get_text(strip=True).replace(',', '') if stars_link else "0"
            
            repos.append({
                "name": name,
                "url": url,
                "description": desc,
                "language": lang,
                "stars_today": stars,
                "summary_what": "",
                "summary_problem": "",
                "summary_stack": ""
            })
        except Exception as e:
            continue
            
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(current_dir, "trending_data.json")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(repos, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully fetched {len(repos)} repositories. Saved to {output_file}")

if __name__ == "__main__":
    fetch_trending()
