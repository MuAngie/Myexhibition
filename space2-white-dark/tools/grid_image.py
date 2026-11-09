import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


def main() -> None:
    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
    draw = ImageDraw.Draw(image)
    step = 150
    for x in range(0, image.width, step):
        draw.line((x, 0, x, image.height), fill="#ff3b30", width=2)
        draw.text((x + 4, 4), str(x), fill="#ff3b30")
    for y in range(0, image.height, step):
        draw.line((0, y, image.width, y), fill="#ff3b30", width=2)
        draw.text((4, y + 4), str(y), fill="#ff3b30")
    image.save(destination, "JPEG", quality=92)
    print(image.size)


if __name__ == "__main__":
    main()
