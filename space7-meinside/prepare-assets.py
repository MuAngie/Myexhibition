"""Prepare web photographs without changing the original exhibition records."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
SIZES = (('photos', 2400, 87), ('thumbs', 280, 78), ('ambient', 1000, 65))

for folder, _, _ in SIZES:
    (ROOT / 'assets' / folder).mkdir(parents=True, exist_ok=True)

sources = sorted((ROOT / 'reference').glob('*.JPG'))
for source in sources:
    with Image.open(source) as original:
        photo = ImageOps.exif_transpose(original).convert('RGB')
        for folder, size, quality in SIZES:
            resized = photo.copy()
            resized.thumbnail((size, size))
            resized.save(ROOT / 'assets' / folder / f'{source.stem}.webp', quality=quality)

print(f'Prepared {len(sources)} photographs, thumbnails and ambient images.')
