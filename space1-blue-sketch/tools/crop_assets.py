from pathlib import Path
from PIL import Image, ImageOps
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "reference" / "blue sketch"
OUTPUT = ROOT / "assets" / "artworks"

# Normalized boxes follow the visible outer frame. They intentionally retain
# small amounts of glare and photographic perspective as part of the memory.
CROPS = {
    "IMG_3057.JPG": (0.07, 0.10, 0.94, 0.91),
    "IMG_3058.JPG": (0.08, 0.10, 0.98, 0.84),
    "IMG_3060.JPG": (0.0, 0.13, 1.0, 0.765),
    "IMG_3062.JPG": (0.04, 0.09, 0.97, 0.93),
    "IMG_3065.JPG": (0.08, 0.09, 0.94, 0.94),
    "IMG_3067.JPG": (0.03, 0.03, 0.93, 0.94),
    "IMG_3069.JPG": (0.17, 0.16, 0.84, 0.84),
    "IMG_3070.JPG": (0.08, 0.09, 0.95, 0.88),
    "IMG_3071.JPG": (0.08, 0.10, 0.82, 0.95),
    "IMG_3072.JPG": (0.10, 0.13, 0.87, 0.93),
}

PERSPECTIVE_CROPS = {
    "IMG_3063.JPG": {
        "source": [(150, 760), (3820, 300), (3940, 2680), (205, 2480)],
        "size": (1600, 1100),
        "trim": (0, 0, 1350, 1100),
        "trim_black": True,
    },
    "IMG_3066.JPG": {
        "source": [(400, 1200), (2250, 1420), (2450, 3050), (80, 3000)],
        "size": (1400, 1050),
    },
}

TRIO = {
    "small_01": (0.115, 0.36, 0.275, 0.59),
    "small_02": (0.405, 0.35, 0.565, 0.60),
    "small_03": (0.690, 0.35, 0.940, 0.62),
}


def crop_normalized(image: Image.Image, box: tuple[float, float, float, float]) -> Image.Image:
    width, height = image.size
    pixels = (
        round(box[0] * width),
        round(box[1] * height),
        round(box[2] * width),
        round(box[3] * height),
    )
    return image.crop(pixels)


def save_web_image(image: Image.Image, destination: Path) -> None:
    image = image.convert("RGB")
    image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
    image.save(destination, "JPEG", quality=88, optimize=True, progressive=True)


def perspective_crop(image: Image.Image, source: list[tuple[int, int]], size: tuple[int, int]) -> Image.Image:
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
    return image.transform(
        size,
        Image.Transform.PERSPECTIVE,
        coefficients,
        resample=Image.Resampling.BICUBIC,
    )


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    for filename, box in CROPS.items():
        image = ImageOps.exif_transpose(Image.open(SOURCE / filename))
        destination = OUTPUT / f"{Path(filename).stem.lower()}.jpg"
        save_web_image(crop_normalized(image, box), destination)

    for filename, settings in PERSPECTIVE_CROPS.items():
        image = ImageOps.exif_transpose(Image.open(SOURCE / filename)).convert("RGB")
        destination = OUTPUT / f"{Path(filename).stem.lower()}.jpg"
        corrected = perspective_crop(image, settings["source"], settings["size"])
        if "trim" in settings:
            corrected = corrected.crop(settings["trim"]).resize(settings["size"], Image.Resampling.LANCZOS)
        if settings.get("trim_black"):
            pixels = np.asarray(corrected)
            valid_columns = np.flatnonzero(pixels.mean(axis=(0, 2)) > 5)
            corrected = corrected.crop((0, 0, int(valid_columns[-1]) + 1, corrected.height))
            corrected = corrected.resize(settings["size"], Image.Resampling.LANCZOS)
        save_web_image(corrected, destination)

    trio = ImageOps.exif_transpose(Image.open(SOURCE / "IMG_3059.JPG"))
    for name, box in TRIO.items():
        save_web_image(crop_normalized(trio, box), OUTPUT / f"{name}.jpg")

    vessel = ImageOps.exif_transpose(Image.open(SOURCE / "IMG_3068.JPG"))
    save_web_image(crop_normalized(vessel, (0.18, 0.03, 0.94, 0.98)), OUTPUT / "vessel.jpg")

    print(f"Wrote {len(CROPS) + len(PERSPECTIVE_CROPS) + len(TRIO) + 1} assets to {OUTPUT}")


if __name__ == "__main__":
    main()
