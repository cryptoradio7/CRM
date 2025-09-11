#!/usr/bin/env python3
import json
import sys

def analyze_json_stream(file_path, max_lines=10000):
    """Analyse la structure du fichier JSON en mode stream"""
    print(f"🔍 Analyse de la structure de {file_path}")
    print("=" * 50)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # Lire les premières lignes pour trouver le premier objet
            lines = []
            bracket_count = 0
            in_first_object = False
            
            for i, line in enumerate(f):
                if i >= max_lines:
                    break
                    
                lines.append(line)
                
                # Compter les accolades pour détecter le premier objet
                for char in line:
                    if char == '{':
                        bracket_count += 1
                        if bracket_count == 1:
                            in_first_object = True
                    elif char == '}':
                        bracket_count -= 1
                        if bracket_count == 0 and in_first_object:
                            # Premier objet complet trouvé
                            break
                else:
                    continue
                break
            
            # Reconstituer le JSON partiel
            partial_json = ''.join(lines)
            
            # Nettoyer le JSON partiel
            if partial_json.startswith('['):
                # Trouver le premier objet complet
                start = partial_json.find('{')
                if start != -1:
                    # Trouver la fin du premier objet
                    bracket_count = 0
                    end = start
                    for i, char in enumerate(partial_json[start:], start):
                        if char == '{':
                            bracket_count += 1
                        elif char == '}':
                            bracket_count -= 1
                            if bracket_count == 0:
                                end = i + 1
                                break
                    
                    if end > start:
                        first_obj_json = partial_json[start:end]
                        try:
                            first_obj = json.loads(first_obj_json)
                            print(f"✅ Premier objet JSON trouvé et parsé")
                            
                            # Analyser les clés
                            print(f"\n📋 Clés disponibles dans le JSON:")
                            print("-" * 50)
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
                                
                                print(f"  {key:35} | {value_type:10} | {value_preview}")
                            
                            # Analyser les sous-structures
                            print(f"\n🔍 Analyse des sous-structures:")
                            print("-" * 50)
                            
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
                        except json.JSONDecodeError as e:
                            print(f"❌ Erreur de parsing du premier objet: {e}")
                            return None
                    else:
                        print("❌ Impossible de trouver un objet JSON complet")
                        return None
                else:
                    print("❌ Aucun objet JSON trouvé")
                    return None
            else:
                print("❌ Le fichier ne commence pas par un tableau JSON")
                return None
                
    except Exception as e:
        print(f"❌ Erreur lors de la lecture du fichier: {e}")
        return None

if __name__ == "__main__":
    file_path = "all_lemlist_contacts.json"
    sample = analyze_json_stream(file_path)
    
    if sample:
        print(f"\n✅ Analyse terminée - Structure du JSON comprise")
    else:
        print(f"\n❌ Impossible d'analyser la structure du JSON")
