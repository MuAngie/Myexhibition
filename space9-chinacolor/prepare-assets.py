"""Create proportional web copies and contact sheets, leaving originals intact."""
from pathlib import Path
import json
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
sources = sorted(ROOT.glob('*.JPG'))
manifest = []
for source in sources:
    with Image.open(source) as original:
        photo = ImageOps.exif_transpose(original).convert('RGB')
        for folder, limit, quality in [('photos', 2400, 86), ('thumbs', 360, 78)]:
            target = ROOT / 'assets' / folder
            target.mkdir(parents=True, exist_ok=True)
            resized = photo.copy()
            resized.thumbnail((limit, limit))
            resized.save(target / f'{source.stem}.webp', quality=quality)
        manifest.append({'source': source.name, 'width': photo.width, 'height': photo.height,
                         'date': original.getexif().get(36867) or original.getexif().get(306),
                         'photo': f'assets/photos/{source.stem}.webp',
                         'thumbnail': f'assets/thumbs/{source.stem}.webp'})
(ROOT / 'assets' / 'manifest.json').write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
(ROOT / 'analysis').mkdir(exist_ok=True)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
for page in range((len(sources) + 23) // 24):
    sheet = Image.new('RGB', (1440, 1120), '#e8e7e2')
    draw = ImageDraw.Draw(sheet)
    for index, source in enumerate(sources[page * 24:(page + 1) * 24]):
        with Image.open(ROOT / 'assets' / 'thumbs' / f'{source.stem}.webp') as photo:
            thumb = ImageOps.contain(photo, (228, 240))
            x, y = (index % 6) * 240, (index // 6) * 280
            sheet.paste(thumb, (x + (240 - thumb.width) // 2, y + (240 - thumb.height) // 2))
            draw.text((x + 10, y + 249), source.name, fill='#303632', font=font)
    sheet.save(ROOT / 'analysis' / f'contact-{page + 1}.jpg', quality=90)
print(f'Prepared {len(manifest)} photographs and three contact sheets.')
