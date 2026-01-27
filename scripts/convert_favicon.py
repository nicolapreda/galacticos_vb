from PIL import Image
import os

source = "src/app/favicon.webp"
target = "src/app/favicon.ico"

def convert():
    if not os.path.exists(source):
        print(f"Source file not found: {source}")
        return

    try:
        img = Image.open(source)
        # Resize to standard favicon sizes often helps, but saving as .ico usually handles multi-size if configured, 
        # but simple save works for basic usage.
        # Common sizes: 16, 32, 48, 64, 128, 256
        img.save(target, format='ICO', sizes=[(32, 32), (64, 64)])
        print(f"Successfully converted {source} to {target}")
    except Exception as e:
        print(f"Error converting favicon: {e}")

if __name__ == "__main__":
    convert()
