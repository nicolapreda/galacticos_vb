import os
import glob
from PIL import Image

# Configuration
ASSETS_DIR = "public/assets"
SQUADRA_DIR = os.path.join(ASSETS_DIR, "squadra")
ALBUMS_DIR = os.path.join(ASSETS_DIR, "albums")

# Files to keep (root assets only)
# These are the DSC files referenced in the code + logo
KEEP_FILES = {
    "DSC08495.jpg",
    "DSC08524.jpg",
    "DSC08437.jpg",
    "DSC08451.jpg",
    "DSC08466.jpg",
    "logo.png"
}

def convert_to_webp(filepath):
    try:
        filename = os.path.basename(filepath)
        name, ext = os.path.splitext(filename)
        if ext.lower() == ".webp":
            return filepath # Already webp

        new_filepath = os.path.join(os.path.dirname(filepath), name + ".webp")
        
        print(f"Converting {filename} to WebP...")
        with Image.open(filepath) as img:
            img.save(new_filepath, "WEBP", quality=85)
        
        # Verify creation before deletion
        if os.path.exists(new_filepath):
            os.remove(filepath)
            print(f"Deleted original {filename}")
            return new_filepath
        else:
            print(f"Error: Failed to create {new_filepath}")
            return filepath
            
    except Exception as e:
        print(f"Failed to convert {filepath}: {e}")
        return filepath

def process_root_assets():
    print("Processing root assets...")
    # List all files in assets dir
    for filepath in glob.glob(os.path.join(ASSETS_DIR, "*")):
        if os.path.isdir(filepath):
            continue
            
        filename = os.path.basename(filepath)
        
        # Check if it's a DSC image
        if filename.startswith("DSC") and filename.lower().endswith(".jpg"):
            if filename in KEEP_FILES:
                convert_to_webp(filepath)
            else:
                print(f"Deleting unused asset: {filename}")
                os.remove(filepath)
        
        # Check for galacticos*.webp
        elif filename.startswith("galacticos") and filename.lower().endswith(".webp"):
            print(f"Deleting unused asset: {filename}")
            os.remove(filepath)
            
        # Check for logo
        elif filename == "logo.png":
            convert_to_webp(filepath)

def process_directory(directory):
    print(f"Processing directory: {directory}")
    for filepath in glob.glob(os.path.join(directory, "*")):
        if os.path.isdir(filepath):
            continue
        
        filename = os.path.basename(filepath)
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
             convert_to_webp(filepath)

if __name__ == "__main__":
    if not os.path.exists(ASSETS_DIR):
        print(f"Directory not found: {ASSETS_DIR}")
        exit(1)
        
    process_root_assets()
    process_directory(SQUADRA_DIR)
    process_directory(ALBUMS_DIR)
    print("Optimization complete.")
