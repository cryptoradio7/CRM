#!/usr/bin/env python3
import json
import sys

def analyze_json_structure(file_path, sample_size=10):
    """Analyse la structure du fichier JSON en prenant un échantillon"""
    print(f"🔍 Analyse de la structure de {file_path}")
    print("=" * 50)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # Lire les premières lignes pour trouver le premier objet
            lines = []
            for i, line in enumerate(f):
                if i >= 1000:  # Limiter la lecture
                    break
                lines.append(line)
            
            # Reconstituer le JSON partiel
            partial_json = ''.join(lines)
            
            # Essayer de parser le JSON
            try:
                data = json.loads(partial_json)
                if isinstance(data, list) and len(data) > 0:
                    sample = data[:sample_size]
                    print(f"✅ Fichier JSON valide - {len(sample)} échantillons analysés")
                    
                    # Analyser les clés du premier objet
                    if sample:
                        first_obj = sample[0]
                        print(f"\n📋 Clés disponibles dans le JSON:")
                        print("-" * 30)
                        for key in sorted(first_obj.keys()):
                            value = first_obj[key]
                            value_type = type(value).__name__
                            if isinstance(value, str) and len(value) > 50:
                                value_preview = value[:50] + "..."
                            elif isinstance(value, list):
                                value_preview = f"[{len(value)} éléments]"
                            elif isinstance(value, dict):
                                value_preview = f"{{ {len(value)} propriétés }}"
                            else:
                                value_preview = str(value)
                            
                            print(f"  {key:30} | {value_type:10} | {value_preview}")
                        
                        # Analyser les sous-structures
                        print(f"\n🔍 Analyse des sous-structures:")
                        print("-" * 30)
                        
                        # Expériences
                        if 'experiences' in first_obj and isinstance(first_obj['experiences'], list):
                            print(f"  experiences: {len(first_obj['experiences'])} éléments")
                            if first_obj['experiences']:
                                exp_keys = first_obj['experiences'][0].keys()
                                print(f"    Clés: {', '.join(exp_keys)}")
                        
                        # Langues
                        if 'languages' in first_obj and isinstance(first_obj['languages'], list):
                            print(f"  languages: {len(first_obj['languages'])} éléments")
                            if first_obj['languages']:
                                lang_keys = first_obj['languages'][0].keys()
                                print(f"    Clés: {', '.join(lang_keys)}")
                        
                        # Compétences
                        if 'skills' in first_obj and isinstance(first_obj['skills'], list):
                            print(f"  skills: {len(first_obj['skills'])} éléments")
                            if first_obj['skills']:
                                skill_keys = first_obj['skills'][0].keys()
                                print(f"    Clés: {', '.join(skill_keys)}")
                        
                        # Intérêts
                        if 'interests' in first_obj and isinstance(first_obj['interests'], list):
                            print(f"  interests: {len(first_obj['interests'])} éléments")
                            if first_obj['interests']:
                                interest_keys = first_obj['interests'][0].keys()
                                print(f"    Clés: {', '.join(interest_keys)}")
                        
                        return first_obj
                    else:
                        print("❌ Aucun objet trouvé dans l'échantillon")
                        return None
                else:
                    print("❌ Le fichier ne contient pas un tableau JSON valide")
                    return None
            except json.JSONDecodeError as e:
                print(f"❌ Erreur de parsing JSON: {e}")
                return None
                
    except Exception as e:
        print(f"❌ Erreur lors de la lecture du fichier: {e}")
        return None

if __name__ == "__main__":
    file_path = "all_lemlist_contacts.json"
    sample = analyze_json_structure(file_path)
    
    if sample:
        print(f"\n✅ Analyse terminée - Structure du JSON comprise")
    else:
        print(f"\n❌ Impossible d'analyser la structure du JSON")
