"""Prepare proportional browser images without altering the exhibition originals."""
from pathlib import Path
import json
import math
import struct
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
sources = sorted((ROOT / 'reference').glob('*.JPG'))
manifest = []
for source in sources:
    with Image.open(source) as original:
        photo = ImageOps.exif_transpose(original).convert('RGB')
        for folder, limit, quality in [('photos', 2400, 86), ('thumbs', 360, 80)]:
            target = ROOT / 'assets' / folder
            target.mkdir(parents=True, exist_ok=True)
            resized = photo.copy()
            resized.thumbnail((limit, limit))
            resized.save(target / f'{source.stem}.webp', quality=quality)
        manifest.append({
            'source': f'reference/{source.name}', 'width': photo.width,
            'height': photo.height,
            'date': original.getexif().get(36867) or original.getexif().get(306),
            'photo': f'assets/photos/{source.stem}.webp',
            'thumbnail': f'assets/thumbs/{source.stem}.webp'
        })
(ROOT / 'assets' / 'manifest.json').write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')

video_source = ROOT / 'reference' / 'IMG_5557.MOV'
video_data = video_source.read_bytes()

def boxes(start, end):
    while start + 8 <= end:
        size, kind = struct.unpack_from('>I4s', video_data, start)
        if size == 1:
            size = struct.unpack_from('>Q', video_data, start + 8)[0]
        if not size:
            size = end - start
        yield kind, start, start + size
        start += size

def child(parent, name):
    return next(box for box in boxes(parent[1] + 8, parent[2]) if box[0] == name)

def media_duration(box):
    start = box[1]
    version = video_data[start + 8]
    scale, ticks = struct.unpack_from(
        '>II' if version == 0 else '>IQ', video_data,
        start + (20 if version == 0 else 28))
    return round(ticks / scale, 4)

movie = next(box for box in boxes(0, len(video_data)) if box[0] == b'moov')
tracks = []
for track in boxes(movie[1] + 8, movie[2]):
    if track[0] != b'trak':
        continue
    header = child(track, b'tkhd')
    media = child(track, b'mdia')
    handler = child(media, b'hdlr')
    sample = child(child(child(media, b'minf'), b'stbl'), b'stsd')
    kind = video_data[handler[1] + 16:handler[1] + 20].decode('ascii')
    codec = video_data[sample[1] + 20:sample[1] + 24].decode('ascii')
    details = {'type': kind, 'codec': codec,
               'durationSeconds': media_duration(child(media, b'mdhd'))}
    if kind == 'vide':
        width, height = struct.unpack_from('>II', video_data, header[2] - 8)
        matrix = struct.unpack_from('>9i', video_data, header[2] - 44)
        details.update(width=width // 65536, height=height // 65536,
                       rotationDegrees=round(math.degrees(math.atan2(matrix[1], matrix[0]))),
                       transformMatrix=list(matrix))
    tracks.append(details)
video_track = next(track for track in tracks if track['type'] == 'vide')
video = {
    'source': 'reference/IMG_5557.MOV',
    'container': 'QuickTime MOV',
    'codec': 'H.264 (avc1)',
    'width': video_track['width'], 'height': video_track['height'],
    'rotationDegrees': video_track['rotationDegrees'],
    'durationSeconds': media_duration(child(movie, b'mvhd')),
    'tracks': tracks,
    'bytes': video_source.stat().st_size,
    'transcoded': False
}
(ROOT / 'assets' / 'video-metadata.json').write_text(
    json.dumps(video, ensure_ascii=False, indent=2), encoding='utf-8')

analysis = ROOT / 'analysis'
analysis.mkdir(exist_ok=True)
columns, cell_width, cell_height = 4, 400, 440
rows = (len(sources) + columns - 1) // columns
sheet = Image.new('RGB', (columns * cell_width, rows * cell_height), '#e7e7e1')
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 23)
for index, source in enumerate(sources):
    with Image.open(ROOT / 'assets' / 'photos' / f'{source.stem}.webp') as photo:
        thumb = ImageOps.contain(photo, (380, 390))
        x, y = (index % columns) * cell_width, (index // columns) * cell_height
        sheet.paste(thumb, (x + (cell_width - thumb.width) // 2, y + (390 - thumb.height) // 2))
        draw.text((x + 14, y + 405), source.name, fill='#303632', font=font)
sheet.save(analysis / 'contact-sheet.jpg', quality=92)
print(f'Prepared {len(manifest)} photographs. Contact sheet: {analysis / "contact-sheet.jpg"}')
