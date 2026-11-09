# Design QA: Space 02 artwork-first gallery

## Evidence and selection

- Source visual truth: `analysis/contact-sheet-1.jpg`, generated from all 37 photographs in `reference/1`.
- Included dedicated photographs: `IMG_3244`, `IMG_3249`, `IMG_3251`, `IMG_3254`, `IMG_3255`, `IMG_3257`, `IMG_3258`, `IMG_3263`, `IMG_3265`, `IMG_3270`, `IMG_3275`, and `IMG_3277`.
- Excluded: room views, labels, detail-only `IMG_3267`, and duplicate angles such as `IMG_3248`, `IMG_3259`, and `IMG_3278`.
- Implementation: `http://127.0.0.1:8773/index.html?v=35`.
- Comparison state: `http://127.0.0.1:8773/index.html?galleryqa=02&v=35`.
- Artwork metadata cross-check: `artwork-metadata-02.md`.

## Experience decision

Space 02 no longer claims to reproduce the supplied plan or exact wall placement. It uses the same artwork-first framework as Space 03: a quiet interactive white model behind one dominant photograph, with neighboring works visible at the edges. The two spaces keep independent artwork lists and counts.

## Verification

- Entry from the zone navigation opens Space 02 at `01 / 12`: passed.
- Portrait first work `IMG_3244` retains its complete outline and fills the available height: passed.
- All twelve Space 02 crops include a wider safety margin than the initial gallery version, without reintroducing large empty wall regions: passed.
- Small horizontal work `IMG_3254`, tall installation `IMG_3258`, and wide metal work `IMG_3263` retain their natural proportions: passed.
- Previous/next selection updates active and neighboring works from the twelve-item Space 02 list: passed.
- “我的想法” opens below the active Space 02 work and identifies the correct filename: passed.
- Clicking an active Space 02 work opens its original photograph and verified label information; `Esc` and the close button return focus to the work: passed.
- The original-image viewer supports button and wheel zoom from 100% to 400%, drag-to-pan while enlarged, and button or double-click reset to the complete composition: passed.
- Enlarged images can extend across the full modal canvas while the lower-right artwork information remains fixed and legible: passed.
- The fixed artwork-information panel uses a translucent dark background so the enlarged image remains perceptible behind it without reducing text contrast: passed.
- `IMG_3254` is explicitly marked as missing a reliable corresponding label instead of receiving inferred metadata: passed.
- Switching from Space 02 to Space 03 restores `01 / 14` and the original Space 03 list: passed.
- Switching from the artwork gallery to Space 04 restores spatial navigation and hides the gallery: passed.
- JavaScript syntax and local HTTP loading: passed.

final result: passed
