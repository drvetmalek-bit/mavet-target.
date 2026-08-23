from pathlib import Path

from PIL import Image


source_path = Path("/home/ubuntu/upload/Mavettarget.webp")
target_dir = Path(__file__).resolve().parent.parent / "assets" / "images"
target_names = ["icon.png", "splash-icon.png", "favicon.png", "android-icon-foreground.png", "android-icon-monochrome.png", "mavet-target-icon.png"]

with Image.open(source_path) as source:
    image = source.convert("RGBA")
    side = min(image.size)
    left = (image.width - side) // 2
    top = (image.height - side) // 2
    icon = image.crop((left, top, left + side, top + side))
    icon.thumbnail((512, 512), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (512, 512), "#FFFFFF")
    offset = ((512 - icon.width) // 2, (512 - icon.height) // 2)
    canvas.alpha_composite(icon, offset)
    for name in target_names:
        canvas.save(target_dir / name, format="PNG", optimize=True, compress_level=9)
    Image.new("RGBA", (512, 512), "#FFFFFF").save(target_dir / "android-icon-background.png", format="PNG", optimize=True, compress_level=9)
