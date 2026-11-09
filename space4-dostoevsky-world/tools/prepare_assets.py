"""Build derived exhibition assets; reference photographs are never modified."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
OUT.mkdir(exist_ok=True)
for folder in ("artworks", "photos"):
    (OUT / folder).mkdir(exist_ok=True)

# Normalized bounds include complete frames/paper edges and a small safety margin.
CROPS = {
    3671: (.035,.025,.86,.84), 3672: (.10,.04,.88,.84),
    3675: (.045,.02,.96,.76), 3676: (.14,.075,.95,.73),
    3677: (.075,.005,.99,.75), 3678: (.02,.005,.995,.73),
    3679: (.04,.07,.99,.74), 3680: (.015,.015,.75,.97),
    3682: (.035,.005,.995,.92), 3686: (.025,.005,.98,.94),
    3689: (0,.05,1,.98), 3692: (.025,.005,.99,.71),
    3693: (.31,.20,1,.86), 3694: (.005,.207,.63,.765),
    3698: (.025,.02,.925,.845), 3699: (.035,0,.99,.72),
    3701: (.12,.005,.97,.73), 3704: (.015,.10,.995,.75),
    3708: (.015,0,.91,.92), 3710: (.015,0,1,.82),
    3711: (0,0,1,.72), 3712: (.095,0,.99,.73),
    3723: (.07,.005,.99,.74), 3724: (.015,.005,.99,.63),
    3727: (.23,.08,.81,.51), 3728: (0,0,.93,.85),
    3731: (.09,.01,.845,.875), 3735: (0,0,.96,.92),
    3736: (.04,.005,.99,.89), 3737: (.22,.035,.80,.70),
    3738: (.10,.015,.985,.995), 3741: (0,.02,1,1),
    3742: (.09,.13,.85,.91), 3749: (.015,.04,.90,.99),
}
ROOMS = {3666,3667,3668,3670,3673,3684,3688,3690,3695,3706,3721,3726,3730,3733,3741,3743,3749}
TEXTS = {3665,3669,3674,3681,3683,3685,3687,3691,3696,3697,3700,3702,3703,3705,3707,3709,3722,3725,3729,3732,3734,3739,3740}
PANELS = {3669:(.05,.02,.96,.98),3674:(.03,.02,.97,.98),3685:(.06,.03,.97,.98),3691:(.04,.01,.98,.98),3696:(.02,.02,.98,.98),3697:(.02,.02,.98,.98),3700:(.02,.02,.98,.98),3703:(.01,.01,.99,.98),3707:(.02,.02,.98,.98),3722:(.02,.02,.98,.98),3725:(.02,.02,.98,.98),3729:(.02,.02,.98,.98),3732:(.02,.02,.98,.98),3734:(.02,.02,.98,.98),3740:(.02,.02,.98,.98)}

PANELS[3670] = (.205,.05,.685,.985)

def zone(n):
    return "intro" if n < 3668 else "green" if n <= 3684 else "grey" if n <= 3694 else "blue" if n <= 3704 else "red" if n <= 3724 else "yellow"

manifest = []
for path in sorted((ROOT / "reference").glob("*.JPG")):
    n = int(path.stem[4:])
    with Image.open(path) as opened:
        photo = ImageOps.exif_transpose(opened).convert("RGB")
    width, height = photo.size
    preview = photo.copy()
    preview.thumbnail((2000,2000), Image.Resampling.LANCZOS)
    preview.save(OUT / "photos" / f"{path.stem}.jpg", quality=89, optimize=True)
    role = "sequence" if 3713 <= n <= 3720 else "detail" if 3744 <= n <= 3748 else "artwork" if n in CROPS else "room" if n in ROOMS else "text" if n in TEXTS else "intro"
    entry = dict(source=path.name, zone=zone(n), role=role, width=width, height=height,
                 photo=f"assets/photos/{path.stem}.jpg", confidence="high", selected=n in CROPS,
                 reason="8 frames share one viewing point" if role == "sequence" else "context or source information" if n not in CROPS else "dedicated work; group preserved where indivisible")
    bounds = CROPS.get(n) or PANELS.get(n)
    if bounds:
        pixels = tuple(round(v * (width if i % 2 == 0 else height)) for i,v in enumerate(bounds))
        crop = photo.crop(pixels)
        entry.update(crop=list(bounds), aspect=crop.width/crop.height, asset=f"assets/artworks/{path.stem}.jpg")
        crop.thumbnail((1600,1600), Image.Resampling.LANCZOS)
        crop.save(ROOT / entry["asset"], quality=92, optimize=True)
    manifest.append(entry)

(ROOT / "photo-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
(ROOT / "assets.js").write_text("window.PHOTO_MANIFEST = " + json.dumps(manifest,ensure_ascii=False) + ";\n", encoding="utf-8")
selected = [row for row in manifest if row["selected"]]
for start in range(0,len(selected),12):
    batch = selected[start:start+12]
    sheet = Image.new("RGB",(1440,1080),"#242422")
    draw = ImageDraw.Draw(sheet)
    for i,row in enumerate(batch):
        with Image.open(ROOT / row["asset"]) as opened:
            thumb = opened.copy()
        thumb.thumbnail((340,322))
        x,y=(i%4)*360,(i//4)*360
        sheet.paste(thumb,(x+(360-thumb.width)//2,y+(330-thumb.height)//2))
        draw.text((x+14,y+340),row["source"],fill="white")
    sheet.save(ROOT / "analysis" / f"crops-{start//12+1}.jpg",quality=91)
print(f"{len(manifest)} photos; {len(selected)} selected work/group assets; 8 optical frames in one sequence.")
