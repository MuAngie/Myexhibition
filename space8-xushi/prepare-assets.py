"""Make proportional web copies; keep every original photograph untouched."""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
manifest = []
for source in sorted((ROOT / 'reference').glob('*.JPG')):
    with Image.open(source) as original:
        photo = ImageOps.exif_transpose(original).convert('RGB')
        for folder, limit, quality in [('photos', 2400, 88), ('thumbs', 320, 80)]:
            target = ROOT / 'assets' / folder
            target.mkdir(parents=True, exist_ok=True)
            resized = photo.copy()
            resized.thumbnail((limit, limit))
            resized.save(target / f'{source.stem}.webp', quality=quality)
        manifest.append({
            'source': source.name, 'width': photo.width, 'height': photo.height,
            'date': original.getexif().get(306), 'selected': True, 'crop': None,
            'photo': f'assets/photos/{source.stem}.webp',
            'thumbnail': f'assets/thumbs/{source.stem}.webp'
        })
(ROOT / 'assets' / 'manifest.json').write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Prepared {len(manifest)} complete photographs and thumbnails.')
