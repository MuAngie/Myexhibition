from pathlib import Path

import numpy as np
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "reference"
OUTPUT = ROOT / "assets" / "artworks"


CROPS = {
    "dark-pale.jpg": ("IMG_3080.JPG", (0.325, 0.365, 0.472, 0.575)),
    "stair-light.jpg": ("IMG_3082.JPG", (0.485, 0.172, 0.566, 0.322)),
    "stair-connection.jpg": ("IMG_3082.JPG", (0.16, 0.06, 0.84, 0.98)),
    "upper-red.jpg": ("IMG_3083.JPG", (0.17, 0.44, 0.295, 0.525)),
    "upper-pair.jpg": ("IMG_3083.JPG", (0.565, 0.47, 0.635, 0.535)),
    "corridor-light.jpg": ("IMG_3097.JPG", (0.455, 0.335, 0.523, 0.525)),
}


def normalized_crop(image: Image.Image, box: tuple[float, float, float, float]) -> Image.Image:
    width, height = image.size
    return image.crop(
        (
            round(box[0] * width),
            round(box[1] * height),
            round(box[2] * width),
            round(box[3] * height),
        )
    )


def perspective_crop(
    image: Image.Image,
    source: list[tuple[int, int]],
    size: tuple[int, int],
) -> Image.Image:
    width, height = size
    destination = [(0, 0), (width, 0), (width, height), (0, height)]
    matrix = []
    values = []
    for (x, y), (u, v) in zip(destination, source):
        matrix.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        values.append(u)
        matrix.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        values.append(v)
    coefficients = np.linalg.solve(np.asarray(matrix, dtype=float), np.asarray(values, dtype=float))
    return image.transform(size, Image.Transform.PERSPECTIVE, coefficients, Image.Resampling.BICUBIC)


def save_web_image(image: Image.Image, destination: Path, limit: int = 1800) -> None:
    image = image.convert("RGB")
    image.thumbnail((limit, limit), Image.Resampling.LANCZOS)
    image.save(destination, "JPEG", quality=90, optimize=True, progressive=True)


def build_story_strip() -> None:
    segments = []
    for index, number in enumerate(range(3089, 3097), start=1):
        source = ImageOps.exif_transpose(Image.open(SOURCE / f"IMG_{number}.JPG")).convert("RGB")
        segment = normalized_crop(source, (0.15, 0.25, 0.85, 0.75))
        segment.thumbnail((640, 640), Image.Resampling.LANCZOS)
        segments.append(segment)
        save_web_image(segment, OUTPUT / f"story-{index:02d}.jpg", 1200)

    width = min(segment.width for segment in segments)
    resized = [segment.resize((width, round(segment.height * width / segment.width)), Image.Resampling.LANCZOS) for segment in segments]
    strip = Image.new("RGB", (width, sum(segment.height for segment in resized)), "#d7d8d5")
    y = 0
    for segment in resized:
        strip.paste(segment, (0, y))
        y += segment.height
    strip.save(OUTPUT / "story-strip.jpg", "JPEG", quality=88, optimize=True, progressive=True)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    for destination, (source_name, box) in CROPS.items():
        source = ImageOps.exif_transpose(Image.open(SOURCE / source_name))
        save_web_image(normalized_crop(source, box), OUTPUT / destination)

    diptych_source = ImageOps.exif_transpose(Image.open(SOURCE / "IMG_3084.JPG")).convert("RGB")
    diptych = perspective_crop(
        diptych_source,
        [(620, 1410), (2100, 1265), (2060, 2730), (675, 2870)],
        (1600, 1450),
    )
    save_web_image(diptych, OUTPUT / "white-diptych.jpg")

    build_story_strip()
    print(f"Wrote assets to {OUTPUT}")


if __name__ == "__main__":
    main()
