import json
import os
import re

# Paths
BASE_DIR = os.getcwd()
PLAYERS_JSON_PATH = os.path.join(BASE_DIR, 'src/data/players.json')
ASSETS_DIR = os.path.join(BASE_DIR, 'public')

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def main():
    with open(PLAYERS_JSON_PATH, 'r') as f:
        players = json.load(f)

    updated_players = []
    
    for player in players:
        old_image_path = player['image'] # e.g. "/assets/squadra/1.webp"
        
        # Check if file exists
        full_old_path = os.path.join(ASSETS_DIR, old_image_path.lstrip('/'))
        
        if not os.path.exists(full_old_path):
            print(f"Warning: File not found {full_old_path}")
            # Try to see if it was already renamed (idempotency)
            slug_name = slugify(player['name'])
            ext = os.path.splitext(old_image_path)[1]
            new_filename = f"{slug_name}{ext}"
            full_new_path = os.path.join(ASSETS_DIR, 'assets/squadra', new_filename)
            
            if os.path.exists(full_new_path):
                 print(f"Found already renamed file {new_filename}. Updating JSON.")
                 player['image'] = f"/assets/squadra/{new_filename}"
            
            updated_players.append(player)
            continue

        # Create new name
        # Format: name-surname.webp
        slug_name = slugify(player['name'])
        ext = os.path.splitext(old_image_path)[1]
        new_filename = f"{slug_name}{ext}"
        new_image_rel_path = f"/assets/squadra/{new_filename}"
        full_new_path = os.path.join(ASSETS_DIR, 'assets/squadra', new_filename)

        # Rename file
        if full_old_path != full_new_path:
            if os.path.exists(full_new_path):
                 print(f"Target file {new_filename} already exists. Skipping rename for {player['name']}")
                 # Assuming it's the correct file
                 player['image'] = new_image_rel_path
            else:
                try:
                    os.rename(full_old_path, full_new_path)
                    print(f"Renamed: {old_image_path} -> {new_image_rel_path}")
                    player['image'] = new_image_rel_path
                except Exception as e:
                    print(f"Error renaming {full_old_path}: {e}")
        
        updated_players.append(player)

    # Write back JSON
    with open(PLAYERS_JSON_PATH, 'w') as f:
        json.dump(updated_players, f, indent=2, ensure_ascii=False)

    print("Finished renaming and updating JSON.")

if __name__ == "__main__":
    main()
