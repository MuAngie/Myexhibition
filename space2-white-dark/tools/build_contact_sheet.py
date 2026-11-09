from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "reference"
OUTPUT = ROOT / "_analysis" / "contact-sheet.jpg"

THUMB = (360, 270)
LABEL_HEIGHT = 34
COLUMNS = 4


def main() -> None:
    files = sorted(SOURCE.glob("*.JPG"))
    rows = (len(files) + COLUMNS - 1) // COLUMNS
    sheet = Image.new("RGB", (THUMB[0] * COLUMNS, (THUMB[1] + LABEL_HEIGHT) * rows), "#15191c")
    draw = ImageDraw.Draw(sheet)

    for index, path in enumerate(files):
        image = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        original_size = image.size
        image.thumbnail(THUMB, Image.Resampling.LANCZOS)
        column = index % COLUMNS
        row = index // COLUMNS
        x = column * THUMB[0] + (THUMB[0] - image.width) // 2
        y = row * (THUMB[1] + LABEL_HEIGHT) + (THUMB[1] - image.height) // 2
        sheet.paste(image, (x, y))
        label = f"{path.stem}  {original_size[0]}x{original_size[1]}"
        draw.text((column * THUMB[0] + 10, row * (THUMB[1] + LABEL_HEIGHT) + THUMB[1] + 9), label, fill="#e4e8eb")

    sheet.save(OUTPUT, "JPEG", quality=90, optimize=True)
    print(f"Wrote {OUTPUT} with {len(files)} images")


if __name__ == "__main__":
    main()
