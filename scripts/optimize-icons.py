from pathlib import Path

from PIL import Image


asset_dir = Path(__file__).resolve().parent.parent / "assets" / "images"
names = ["icon.png", "splash-icon.png", "favicon.png", "android-icon-foreground.png"]

for name in names:
    path = asset_dir / name
    with Image.open(path) as source:
        image = source.convert("RGBA")
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        image.save(path, format="PNG", optimize=True, compress_level=9)
