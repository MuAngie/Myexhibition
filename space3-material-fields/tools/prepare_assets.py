from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "reference"
OUTPUT = ROOT / "assets" / "textures"

# Representative, low-resolution display textures only. They establish scale and
# colour rhythm in the spatial model; no enlarged artwork viewer is generated.
CROPS = {
    "atrium-screen.jpg": ("0/IMG_3203.JPG", (0.145, 0.105, 0.56, 0.49)),
    "atrium-diptych.jpg": ("0/IMG_3283.JPG", (0.05, 0.15, 0.95, 0.86)),
    # Space 02 individual-work photographs. Labels, detail-only images, duplicate
    # angles, and works only visible in wide room photographs are intentionally omitted.
    "hall1-work-bird.jpg": ("1/IMG_3244.JPG", (0.10, 0.00, 0.84, 0.92)),
    "hall1-work-textile.jpg": ("1/IMG_3249.JPG", (0.00, 0.00, 1.00, 1.00)),
    "hall1-work-blue-light.jpg": ("1/IMG_3251.JPG", (0.02, 0.17, 0.98, 0.84)),
    "hall1-work-small-sculpture.jpg": ("1/IMG_3254.JPG", (0.03, 0.43, 0.77, 0.83)),
    "hall1-work-window-blue.jpg": ("1/IMG_3255.JPG", (0.14, 0.20, 0.82, 0.71)),
    "hall1-work-window-red.jpg": ("1/IMG_3257.JPG", (0.02, 0.06, 0.96, 0.77)),
    "hall1-work-numbers.jpg": ("1/IMG_3258.JPG", (0.28, 0.00, 0.79, 1.00)),
    "hall1-work-black-metal.jpg": ("1/IMG_3263.JPG", (0.00, 0.10, 0.96, 0.84)),
    "hall1-work-green.jpg": ("1/IMG_3265.JPG", (0.10, 0.08, 0.77, 0.77)),
    "hall1-work-circle.jpg": ("1/IMG_3270.JPG", (0.00, 0.20, 0.99, 0.91)),
    "hall1-work-triptych.jpg": ("1/IMG_3275.JPG", (0.04, 0.08, 0.97, 0.85)),
    "hall1-work-blue-framed.jpg": ("1/IMG_3277.JPG", (0.06, 0.15, 0.92, 0.89)),
    # Previous whole-wall crops remain available as reconstruction references,
    # but the current Space 02 model no longer places them on wall geometry.
    "hall1-rear-back-wall.jpg": ("1/IMG_3268.JPG", (0.37, 0.18, 0.99, 0.72)),
    # Space 03 crops keep a visible safety margin around every work. The crop
    # follows each object's portrait/landscape silhouette instead of forcing a
    # shared card ratio, so irregular edges are never clipped by the thumbnail.
    "hall2-relief.jpg": ("2/IMG_3206.JPG", (0.00, 0.10, 0.93, 0.86)),
    "hall2-black.jpg": ("2/IMG_3209.JPG", (0.18, 0.02, 0.82, 0.92)),
    "hall2-scaffold.jpg": ("2/IMG_3210.JPG", (0.00, 0.00, 0.84, 0.96)),
    "hall2-organic.jpg": ("2/IMG_3211.JPG", (0.00, 0.12, 0.98, 0.93)),
    "hall2-grid-object.jpg": ("2/IMG_3213.JPG", (0.03, 0.09, 0.88, 0.80)),
    "hall2-grey-square.jpg": ("2/IMG_3215.JPG", (0.02, 0.00, 0.90, 0.98)),
    "hall2-color.jpg": ("2/IMG_3218.JPG", (0.00, 0.01, 0.98, 0.98)),
    "hall2-pink.jpg": ("2/IMG_3221.JPG", (0.08, 0.00, 0.91, 1.00)),
    "hall2-grey.jpg": ("2/IMG_3222.JPG", (0.01, 0.00, 0.99, 1.00)),
    "hall2-small.jpg": ("2/IMG_3229.JPG", (0.00, 0.13, 0.99, 0.82)),
    "hall2-cast-grid.jpg": ("2/IMG_3231.JPG", (0.00, 0.10, 0.96, 0.85)),
    "hall2-paper.jpg": ("2/IMG_3233.JPG", (0.02, 0.15, 0.99, 0.87)),
    "hall2-redblue.jpg": ("2/IMG_3236.JPG", (0.00, 0.13, 1.00, 0.87)),
    "hall2-sculpture.jpg": ("2/IMG_3239.JPG", (0.00, 0.00, 1.00, 1.00)),
    "foyer-mural.jpg": ("3/IMG_3284.JPG", (0.00, 0.02, 0.68, 0.98)),
    "hall3-abstract.jpg": ("3/IMG_3287.JPG", (0.00, 0.14, 1.00, 0.86)),
    "hall3-straps.jpg": ("3/IMG_3289.JPG", (0.01, 0.00, 0.94, 1.00)),
    "hall3-geometry.jpg": ("3/IMG_3293.JPG", (0.05, 0.07, 0.95, 0.91)),
    "hall3-vessel-dark.jpg": ("3/IMG_3295.JPG", (0.05, 0.00, 0.95, 1.00)),
    "hall3-vessel-clear.jpg": ("3/IMG_3296.JPG", (0.05, 0.00, 0.95, 1.00)),
    "hall3-vessel-blue.jpg": ("3/IMG_3297.JPG", (0.04, 0.00, 0.96, 1.00)),
    "hall3-red.jpg": ("3/IMG_3301.JPG", (0.00, 0.08, 1.00, 0.86)),
    "hall3-green.jpg": ("3/IMG_3305.JPG", (0.06, 0.06, 0.94, 0.92)),
    "hall3-bw.jpg": ("3/IMG_3307.JPG", (0.15, 0.03, 0.85, 0.97)),
    "hall3-calligraphy.jpg": ("3/IMG_3309.JPG", (0.14, 0.02, 0.84, 0.98)),
    "hall3-orange.jpg": ("3/IMG_3311.JPG", (0.00, 0.00, 1.00, 1.00)),
    "hall3-branch.jpg": ("3/IMG_3312.JPG", (0.02, 0.00, 0.98, 1.00)),
    "hall3-pink.jpg": ("3/IMG_3317.JPG", (0.00, 0.11, 1.00, 0.86)),
}

WALL_QUADS = {
    "hall1-entry-relief-wall.jpg": ("1/IMG_3242.JPG", ((0.025, 0.00), (0.015, 0.675), (0.44, 0.64), (0.44, 0.11)), (1400, 1000)),
    "hall1-entry-corner-wall.jpg": ("1/IMG_3242.JPG", ((0.67, 0.25), (0.67, 0.66), (0.995, 0.70), (0.995, 0.14)), (1700, 900)),
    "hall1-entry-return-wall.jpg": ("1/IMG_3243.JPG", ((0.66, 0.15), (0.67, 0.59), (0.995, 0.60), (0.995, 0.00)), (1300, 1000)),
    "hall1-bay-left-wall.jpg": ("1/IMG_3246.JPG", ((0.00, 0.00), (0.00, 0.78), (0.42, 0.68), (0.38, 0.27)), (1600, 850)),
    "hall1-bay-right-wall.jpg": ("1/IMG_3246.JPG", ((0.67, 0.27), (0.69, 0.66), (0.995, 0.76), (0.995, 0.00)), (1600, 850)),
    "hall1-bay-end-wall.jpg": ("1/IMG_3246.JPG", ((0.39, 0.21), (0.38, 0.70), (0.61, 0.70), (0.61, 0.20)), (1100, 900)),
    "hall1-number-end-wall.jpg": ("1/IMG_3258.JPG", ((0.35, 0.00), (0.32, 0.99), (0.75, 0.99), (0.68, 0.00)), (650, 1800)),
    "hall1-rear-left-wall.jpg": ("1/IMG_3264.JPG", ((0.02, 0.22), (0.02, 0.73), (0.39, 0.64), (0.39, 0.35)), (1600, 850)),
    "hall1-rear-left-angle-wall.jpg": ("1/IMG_3264.JPG", ((0.36, 0.34), (0.36, 0.68), (0.67, 0.67), (0.67, 0.33)), (1300, 900)),
    "hall1-rear-right-wall.jpg": ("1/IMG_3261.JPG", ((0.54, 0.25), (0.54, 0.70), (0.99, 0.82), (0.99, 0.05)), (1600, 850)),
    "hall1-rear-right-angle-wall.jpg": ("1/IMG_3268.JPG", ((0.67, 0.30), (0.68, 0.72), (0.99, 0.78), (0.99, 0.14)), (1300, 900)),
    "hall1-alcove-left-wall.jpg": ("1/IMG_3272.JPG", ((0.02, 0.15), (0.00, 0.84), (0.36, 0.68), (0.31, 0.17)), (1300, 1000)),
    "hall1-alcove-back-wall.jpg": ("1/IMG_3272.JPG", ((0.37, 0.18), (0.37, 0.73), (0.68, 0.73), (0.68, 0.18)), (1300, 1000)),
    "hall1-alcove-right-wall.jpg": ("1/IMG_3272.JPG", ((0.68, 0.18), (0.68, 0.73), (0.995, 0.85), (0.995, 0.15)), (1300, 1000)),
}


def crop_normalized(image: Image.Image, box: tuple[float, float, float, float]) -> Image.Image:
    width, height = image.size
    left, top, right, bottom = box
    return image.crop((int(left * width), int(top * height), int(right * width), int(bottom * height)))


OUTPUT.mkdir(parents=True, exist_ok=True)
for destination, (source_name, box) in CROPS.items():
    with Image.open(REFERENCE / source_name) as opened:
        source = ImageOps.exif_transpose(opened).convert("RGB")
    image = crop_normalized(source, box)
    image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    image.save(OUTPUT / destination, quality=86, optimize=True, progressive=True)

for destination, (source_name, normalized_quad, output_size) in WALL_QUADS.items():
    with Image.open(REFERENCE / source_name) as opened:
        source = ImageOps.exif_transpose(opened).convert("RGB")
    width, height = source.size
    quad = tuple(coordinate for x, y in normalized_quad for coordinate in (x * width, y * height))
    image = source.transform(output_size, Image.Transform.QUAD, quad, Image.Resampling.BICUBIC)
    image.save(OUTPUT / destination, quality=86, optimize=True, progressive=True)

print(f"Wrote {len(CROPS) + len(WALL_QUADS)} textures to {OUTPUT}")
