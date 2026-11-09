"""Create web-sized copies; the original photographs remain in reference/."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
for directory in ("photos", "thumbs"):
    (ROOT / "assets" / directory).mkdir(parents=True, exist_ok=True)
for source in sorted((ROOT / "reference").rglob("*.JPG")):
    with Image.open(source) as original:
        photo = ImageOps.exif_transpose(original).convert("RGB")
        for directory, size, quality in (("photos", 2200, 86), ("thumbs", 320, 76)):
            target = ROOT / "assets" / directory / f"{source.stem}.webp"
            if target.exists():
                continue
            resized = photo.copy()
            resized.thumbnail((size, size))
            resized.save(target, quality=quality)
