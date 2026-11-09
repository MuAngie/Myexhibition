# Design QA: Space 04 artwork-first gallery

## Evidence and selection

- Source visual truth: `analysis/contact-sheet-3.jpg`, generated from all 34 photographs in `reference/3`.
- Included dedicated photographs: IMG_3287, IMG_3289, IMG_3293, IMG_3295, IMG_3296, IMG_3297, IMG_3301, IMG_3305, IMG_3307, IMG_3309, IMG_3311, IMG_3312, and IMG_3317.
- Excluded: room views, label-only photographs, detail-only IMG_3303, and detail-only IMG_3308.
- Implementation: `http://127.0.0.1:8773/index.html?v=38`.
- Comparison state: `http://127.0.0.1:8773/index.html?galleryqa=04&v=38`.
- Artwork metadata cross-check: `artwork-metadata-04.md`.

## Experience decision

Space 04 uses the shared artwork-first white-model background. Its thirteen selected photographs follow the capture order; wall works and individually photographed material objects remain separate entries.

## Verification

- Space 04 opens at `01 / 13` and uses only the `reference/3` artwork list: passed.
- Previous, next, wheel, arrow-key, and side-work selection stay synchronized: passed.
- Every active work keeps its natural portrait, landscape, or near-square ratio: passed.
- IMG_3287, IMG_3289, IMG_3301, IMG_3311, and IMG_3317 use boundary-first crops: single-work or group bounds are identified first, then expanded by a visible safety margin before unrelated wall area is removed: passed.
- “我的想法” stores text independently for each Space 04 photograph: passed.
- Clicking the active work opens the full original image, verified information when available, and an explicit missing-label state otherwise: passed.
- The full-canvas zoom, drag, reset, `Esc`, and translucent information panel remain available: passed.
- Switching among Spaces 02, 03, and 04 restores each independent list and total: passed.
- Local HTTP loading completes without script or missing-resource errors: passed.

final result: passed
