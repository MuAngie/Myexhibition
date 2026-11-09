from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "analysis"
OUTPUT.mkdir(exist_ok=True)
sources = sorted((ROOT / "reference").glob("*.JPG"))
for start in range(0, len(sources), 20):
    batch = sources[start:start + 20]
    sheet = Image.new("RGB", (1400, ((len(batch) + 3) // 4) * 280), "#242424")
    draw = ImageDraw.Draw(sheet)
    for index, source in enumerate(batch):
        with Image.open(source) as original:
            photo = ImageOps.exif_transpose(original).convert("RGB")
        photo.thumbnail((330, 244))
        x, y = (index % 4) * 350, (index // 4) * 280
        sheet.paste(photo, (x + (350 - photo.width) // 2, y + (250 - photo.height) // 2))
        draw.text((x + 12, y + 258), source.name, fill="white")
    target = OUTPUT / f"contact-{start // 20 + 1:02d}.jpg"
    sheet.save(target, quality=90)
    print(target)
