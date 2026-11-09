"""Create oriented web copies while keeping reference photographs untouched."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
for folder in ('photos', 'thumbs'):
    (ROOT / 'assets' / folder).mkdir(parents=True, exist_ok=True)
sources = sorted((ROOT / 'reference').rglob('*.JPG'))
for source in sources:
    with Image.open(source) as original:
        photo = ImageOps.exif_transpose(original).convert('RGB')
        for folder, size, quality in (('photos', 2200, 87), ('thumbs', 360, 78)):
            resized = photo.copy()
            resized.thumbnail((size, size))
            resized.save(ROOT / 'assets' / folder / f'{source.stem}.webp', quality=quality)
print(f'Prepared {len(sources)} photographs.')
