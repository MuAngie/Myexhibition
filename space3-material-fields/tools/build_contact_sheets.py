from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "reference"
OUTPUT = ROOT / "analysis"
CELL = (240, 190)
IMAGE_BOX = (220, 154)
COLS = 5


def build_sheet(folder: Path) -> None:
    sources = sorted(folder.glob("*.JPG"))
    rows = (len(sources) + COLS - 1) // COLS
    sheet = Image.new("RGB", (CELL[0] * COLS, CELL[1] * rows), "#181817")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for index, source in enumerate(sources):
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")
        image.thumbnail(IMAGE_BOX, Image.Resampling.LANCZOS)
        col, row = index % COLS, index // COLS
        x = col * CELL[0] + (CELL[0] - image.width) // 2
        y = row * CELL[1] + 8 + (IMAGE_BOX[1] - image.height) // 2
        sheet.paste(image, (x, y))
        draw.text((col * CELL[0] + 10, row * CELL[1] + 168), source.stem, fill="#e9e7df", font=font)

    OUTPUT.mkdir(exist_ok=True)
    sheet.save(OUTPUT / f"contact-sheet-{folder.name}.jpg", quality=90, optimize=True)


for zone in sorted(path for path in REFERENCE.iterdir() if path.is_dir()):
    build_sheet(zone)
