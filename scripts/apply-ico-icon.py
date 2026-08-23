from pathlib import Path

from PIL import Image


source_path = Path("/home/ubuntu/upload/Mavettarget.ico")
target_dir = Path(__file__).resolve().parent.parent / "assets" / "images"
targets = [
    "mavet-target-icon-v2.png",
    "mavet-target-ui-logo-v2.png",
    "icon.png",
    "splash-icon.png",
    "favicon.png",
    "android-icon-foreground.png",
    "android-icon-monochrome.png",
]

with Image.open(source_path) as source:
    source.seek(max(0, getattr(source, "n_frames", 1) - 1))
    icon = source.convert("RGBA")
    icon.thumbnail((512, 512), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (512, 512), "#FFFFFF")
    offset = ((512 - icon.width) // 2, (512 - icon.height) // 2)
    canvas.alpha_composite(icon, offset)
    for name in targets:
        canvas.save(target_dir / name, format="PNG", optimize=True, compress_level=9)
    Image.new("RGBA", (512, 512), "#FFFFFF").save(target_dir / "android-icon-background.png", format="PNG", optimize=True, compress_level=9)
