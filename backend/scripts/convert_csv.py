import csv
import json
import re

csv_file_path = r"D:\NLP _ UAS\output\test.csv"
json_output_path = r"d:\NLP-UAS WEB\frontend\src\assets\questions.json"

biology_keywords = ['cell', 'dna', 'animal', 'plant', 'tree', 'blood', 'organ', 'species', 'food chain', 'photosynthesis', 'gene', 'chromosome', 'protein', 'bacteria']
chemistry_keywords = ['acid', 'atom', 'element', 'molecule', 'carbon', 'periodic', 'gas', 'chemical', 'reaction', 'electron', 'proton', 'ion', 'bond', 'oxygen', 'hydrogen']
physics_keywords = ['newton', 'energy', 'force', 'pressure', 'gravity', 'light', 'sound', 'velocity', 'solar system', 'planet', 'mass', 'acceleration', 'heat', 'electricity']
math_keywords = ['logic', 'fallacy', 'compare', 'dictionary', 'volume', 'calculate', 'number', 'equation', 'probability', 'statistics', 'graph']

def classify_subject(text):
    text_lower = text.lower()
    
    scores = {
        'Biology': 0,
        'Chemistry': 0,
        'Physics': 0,
        'Mathematics': 0
    }
    
    for kw in biology_keywords:
        if re.search(r'\b' + kw + r'\b', text_lower): scores['Biology'] += 1
    for kw in chemistry_keywords:
        if re.search(r'\b' + kw + r'\b', text_lower): scores['Chemistry'] += 1
    for kw in physics_keywords:
        if re.search(r'\b' + kw + r'\b', text_lower): scores['Physics'] += 1
    for kw in math_keywords:
        if re.search(r'\b' + kw + r'\b', text_lower): scores['Mathematics'] += 1
        
    best_subject = max(scores, key=scores.get)
    if scores[best_subject] == 0:
        return 'General'
    return best_subject

def is_valid_question(text):
    bad_phrases = [
        'in the text',
        'in the image',
        'in the picture',
        'the following sentence',
        'dictionary page',
        'what kind of sentence',
        'look at the',
        'this text',
        'trade to each get',
        'punnett square shows',
        'which word would you find',
        'what can',
        'read the text',
        'based on the',
        'in this text',
        'passage',
        'excerpt'
    ]
    text_lower = text.lower()
    for phrase in bad_phrases:
        if phrase in text_lower:
            return False
    return True

questions_data = []

print(f"Reading {csv_file_path}...")

with open(csv_file_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        raw_question = row.get('input_text', '')
        # Clean prefix
        if raw_question.lower().startswith('question:'):
            q_text = raw_question[9:].strip()
        else:
            q_text = raw_question.strip()
            
        subject = classify_subject(q_text)
        
        # Only add valid questions
        if q_text and len(q_text) > 5 and is_valid_question(q_text):
            questions_data.append({
                'question': q_text,
                'subject': subject
            })

print(f"Processed {len(questions_data)} questions.")

# Ensure directory exists
import os
os.makedirs(os.path.dirname(json_output_path), exist_ok=True)

with open(json_output_path, 'w', encoding='utf-8') as f:
    json.dump(questions_data, f, indent=2)
    
print(f"Saved to {json_output_path}")
