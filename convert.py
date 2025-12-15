import os

from pathspec import PathSpec
from PIL import Image


def load_gitignore_patterns(script_dir: str):
    """
    Loads patterns from a .gitignore file located in script_dir (if present).
    """
    gitignore_path = os.path.join(script_dir, ".gitignore")
    if not os.path.exists(gitignore_path):
        return PathSpec.from_lines("gitwildmatch", [])

    with open(gitignore_path, "r") as f:
        patterns = f.readlines()
    return PathSpec.from_lines("gitwildmatch", patterns)


def convert_to_webp(root_dir: str, spec: PathSpec, quality: int = 85):
    """
    Recursively converts all .jpg and .png images in root_dir to .webp format,
    skipping files/folders matching .gitignore patterns.
    """
    supported_exts = (".jpg", ".jpeg", ".png", ".JPEG", ".JPG", ".PNG")
    converted = 0

    for subdir, dirs, files in os.walk(root_dir):
        # Skip ignored directories
        if spec.match_file(os.path.relpath(subdir, root_dir)):
            continue

        for file in files:
            rel_path = os.path.relpath(os.path.join(subdir, file), root_dir)

            # Skip ignored files
            if spec.match_file(rel_path):
                continue

            if file.lower().endswith(supported_exts):
                img_path = os.path.join(subdir, file)
                webp_path = os.path.splitext(img_path)[0] + ".webp"

                if os.path.exists(webp_path):
                    print(f"✅ Skipping (exists): {webp_path}")
                    continue

                try:
                    with Image.open(img_path) as img:
                        img.save(webp_path, "webp", quality=quality)
                    print(f"🖼️ Converted: {rel_path}")
                    converted += 1
                except Exception as e:
                    print(f"❌ Failed to convert {rel_path}: {e}")

    print(f"\n✅ Done! Converted {converted} image(s) to WebP.")


if __name__ == "__main__":
    folder = input("Enter the path to the folder: ").strip()
    if not os.path.isdir(folder):
        print("❌ Invalid folder path.")
    else:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        spec = load_gitignore_patterns(script_dir)
        convert_to_webp(folder, spec)
