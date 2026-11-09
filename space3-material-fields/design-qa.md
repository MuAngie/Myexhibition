# Design QA — Space 03 floating collection

## Comparison setup

- Source visual truth: `analysis/contact-sheet-2.jpg` (1200 × 1330 px), generated from every photograph in `reference/2`.
- Supporting spatial sources: `IMG_3207.JPG`, `IMG_3208.JPG`, `IMG_3214.JPG`, `IMG_3217.JPG`, `IMG_3219.JPG`, `IMG_3220.JPG`, `IMG_3226.JPG`, `IMG_3227.JPG`, `IMG_3230.JPG`, and `IMG_3237.JPG`.
- Implementation: `http://127.0.0.1:8773/index.html?v=42`.
- Combined comparison state: `http://127.0.0.1:8773/index.html?galleryqa=03&v=42`, which renders the source contact sheet alongside the floating collection.
- Implementation screenshot: in-app browser capture of the combined comparison state, displayed inline in the task; the browser surface does not expose a filesystem export path.
- Browser viewport: 1080 × 900 CSS px at device scale 1. No density normalization was needed because the source contact sheet is a catalog reference rather than a pixel-matched interface.

## Full-view comparison evidence

The page uses a continuous WebGL white model as its full-frame background. One work stays dominant in the foreground while adjacent works remain partially visible, avoiding the feeling of separate slides or wall pages. Fourteen dedicated artwork photographs follow the order inferred from the supplied photographs.

## Focused region comparison evidence

- Sequence 01–05: `IMG_3206`, `IMG_3209`, `IMG_3210`, `IMG_3211`, and `IMG_3213`.
- Sequence 06–09: `IMG_3215`, `IMG_3218`, `IMG_3221`, and `IMG_3222`.
- Sequence 10–12: `IMG_3229`, `IMG_3231`, and `IMG_3233`.
- Sequence 13–14: `IMG_3236` and `IMG_3239`.
- Label-only photographs `IMG_3212`, `IMG_3223`, `IMG_3228`, `IMG_3232`, `IMG_3234`, `IMG_3235`, and `IMG_3240` are excluded.
- Detail crops `IMG_3216`, `IMG_3224`, and `IMG_3225`, plus room views, are excluded from the artwork count.

## Required fidelity surfaces

- Fonts and typography: existing Microsoft YaHei/Noto Sans stack is retained; interface hierarchy stays quiet and legible.
- Spacing and layout rhythm: the active work is centered in a responsive display field. Landscape works can reach 74% of the viewport width; portrait works can reach 74% of the viewport height. Adjacent photographs recede to 30% scale so they remain visible and clickable.
- Colors and tokens: a warm white model, pale mineral floor, charcoal text, and low-contrast dividers follow the requested quiet material atmosphere.
- Image quality and fidelity: every floating image comes from the supplied photograph. Display crops now keep a safety margin around the complete work, retain their intrinsic portrait or landscape proportions, and use `object-fit: contain` so the interface cannot crop their edges.
- Copy and content: the filename appears beneath the active work so each selected source remains identifiable.

## Interaction verification

- Enter exhibition and switch to 03: passed.
- Active artwork click opens the original photograph and artwork information: passed.
- Detail-view zoom controls, wheel zoom, drag-to-pan, reset, close, and Escape handling: passed.
- Adjacent artwork click selects that work: passed.
- Mouse wheel and previous/next controls move through all fourteen works: passed.
- Left/right arrow-key switching: passed.
- Each switch animates the white-model camera to a corresponding viewpoint: passed.
- Portrait, landscape, and irregular-outline crop review across all fourteen generated assets: passed.
- Responsive sizing review with `IMG_3215` landscape and `IMG_3221` portrait at 1081 × 898 px: passed.
- Per-artwork “我的想法” panel open, close, Escape handling, character count, work switching, and browser-local persistence: passed.
- Switch from 03 back to 04 and restore 3D navigation: passed.
- Browser console errors and warnings: none in the final check.

## Findings and comparison history

- P0: none.
- P1: fixed. The earlier four-wall interface read like separate slides; it is now a continuous floating collection over a full-frame white model.
- P2: fixed. Initial 03 assets represented only eight works; six additional dedicated photographs were added so all fourteen qualifying single-work photographs appear.
- P2: fixed. A selector-specificity conflict left visible artworks unable to receive pointer events; active and adjacent works are now clickable.
- P2: fixed. Re-entering 03 now consistently opens on the first work.
- P2: fixed. Several Space 03 crops sat too close to the photographed object boundary; all fourteen now use revised per-work crop bounds and intrinsic-ratio display.
- P2: fixed. Personal reactions previously had no place in the experience; each work now has an inline note panel stored independently in the current browser.
- P2: fixed. The “我的想法” control now follows the active artwork below its filename; the expanded editor opens beneath the lifted work instead of occupying the right side.
- P2: fixed. Space 02 now shares the artwork-first gallery framework while retaining an independent twelve-work sequence; switching back to Space 03 restores all fourteen original works.
- P2: fixed. `IMG_3206` is cropped to the complete framed relief and its right-side label; excess wall above and the large shadowed wall area below are removed.
- P2: fixed. Space 03 now follows the same boundary-first crop standard as Spaces 02 and 04: each crop starts from the complete single-work or union boundary, keeps related frames, labels, supports, hanging hardware, protrusions, and cast shadows, then adds a visible 3–5% safety margin. `IMG_3239` stays at the full source frame because the sculpture already approaches the photographed edges.
- P2: fixed. Space 03 previously disabled artwork details and had no metadata mapping. All fourteen displayed photographs now open the shared original-image viewer and show the matched label information; `IMG_3233` preserves both works in its shared frame.
- P3: some thumbnails intentionally retain photographed wall, shadow, or label fragments because the gallery lists the user's photographs rather than pretending to isolate perfect artwork scans.

final result: passed
