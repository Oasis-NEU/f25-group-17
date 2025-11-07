from bs4 import BeautifulSoup
import requests
import json 

url = 'https://admissions.northeastern.edu/academics/combined-majors'

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                  'AppleWebKit/537.36 (KHTML, like Gecko) '
                  'Chrome/118.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://admissions.northeastern.edu/',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
}

response = requests.get(url=url, headers=headers)
print(response)

l = []

soup = BeautifulSoup(response.content, 'html.parser')
all_links = soup.find_all('a')
for link in all_links:
    href = link.get('href') 
    text = link.text
    if 'and' in text:
        if '(' in text:
            l.append(text.strip())
            print(f"Link Text: {text.strip()}")

cleaned = []
for course in l:
    append_word = '' 
    for i, word in enumerate(course.split()):
        if i != len(course.split()) - 1 :
            append_word += " " + word
    cleaned.append(append_word.lstrip())

major_l = []
with open('/Users/jacksonzheng/f25-group-17/Data/raw.txt', 'r', encoding='utf-8') as lines:
    for line in lines:
        if 'College' not in line:
            if 'View' not in line:
                major_l.append(line.rstrip('\n'))

combined = major_l + cleaned
majors = sorted(combined)
cleaned_major = list(set(majors))
print(cleaned_major, len(cleaned_major))

with open('Data/combineMajor.json', 'w') as d:
    json.dump(cleaned_major, d)
