# Space 3 reconstruction notes

## Scope

This is a desktop-first, photo-informed atmospheric reconstruction of four exhibition areas. It prioritizes recognizable scale, material contrast, spatial rhythm, and viewing sequence. It is not a measured CAD or BIM model.

Spaces 02 and 03 deliberately leave precise spatial reconstruction behind. Each presents its dedicated single-work photographs as a continuous floating collection over a simple interactive white model. Zones 01 and 04 remain spatial reconstructions.

## Evidence map

| Zone | Source folder | Strong photographic evidence | Interpretive completion |
|---|---|---|---|
| 01 Atrium | `reference/0` | Double-height volume, dark stone floor, luminous screen, blue folded forms, tall stacked vessels, stair edge | Exact installation spacing and unseen perimeter walls |
| 02 Open field | `reference/1` | Twelve dedicated single-work photographs, quiet white walls, grey floor, black ceiling, and material contrast | Exact architecture is intentionally replaced by an atmospheric white model with changing viewpoints |
| 03 Material field | `reference/2` | White walls, grey floor, black ceiling, material-heavy works, and fourteen dedicated single-work photographs | Exact architecture is intentionally replaced by an atmospheric white model with changing viewpoints |
| 04 Final hall | `reference/3` | Low foyer, sudden hall opening, black slatted ceiling, white beams and columns, central plinths | Direct connection between foyer and the reconstructed final hall |

## Spatial sequence

The four folders are treated as four chapters. Their physical connections are not fully documented, so each zone uses a restrained direct transition rather than claiming an exact building circulation.

## Experience decisions

- The palette comes from the photographs: warm off-white walls, cool grey mineral floors, black ceiling structure, and focused warm-white light.
- Interface language stays quiet and small. In Spaces 02 and 03, the active work floats in the center while nearby works remain visible at the edges.
- Clicking the active work advances; clicking an adjacent work selects it. The mouse wheel, previous/next controls, and left/right arrows move through each space's own sequence.
- Each work has a “我的想法” editor directly below the active work. Notes are keyed by photograph filename and stored locally in the current browser; switching works changes the note without leaving the gallery.
- Each Space 02 or 03 selection animates the WebGL white-model camera to a corresponding viewpoint. Spaces 01 and 04 retain mouse drag, wheel movement, WASD/arrow keys, reset, and reduced-motion handling.

## Space 02 selection

The Space 02 gallery contains twelve dedicated photographs: `IMG_3244`, `IMG_3249`, `IMG_3251`, `IMG_3254`, `IMG_3255`, `IMG_3257`, `IMG_3258`, `IMG_3263`, `IMG_3265`, `IMG_3270`, `IMG_3275`, and `IMG_3277`. Label-only photographs, room views, detail-only `IMG_3267`, and duplicate angles such as `IMG_3248`, `IMG_3259`, and `IMG_3278` are excluded.

## Assets

`tools/prepare_assets.py` creates web-sized artwork crops in `assets/textures`. Previous whole-wall crops and the former Space 02 geometry remain as analysis references but are not shown in the normal Space 02 experience. Originals remain untouched in `reference`.

## Space 03 selection

The Space 03 gallery contains fourteen dedicated photographs: `IMG_3206`, `IMG_3209`, `IMG_3210`, `IMG_3211`, `IMG_3213`, `IMG_3215`, `IMG_3218`, `IMG_3221`, `IMG_3222`, `IMG_3229`, `IMG_3231`, `IMG_3233`, `IMG_3236`, and `IMG_3239`. Space views, label-only shots, close-up details, and duplicate viewpoints are excluded. Each web crop has its own bounds and a small safety margin, preserving the work's portrait, landscape, or irregular silhouette instead of forcing one shared card ratio.

## Reusable workflow

The reusable method behind Spaces 02 and 03 is documented in [`skills/artwork-first-exhibition-gallery/SKILL.md`](skills/artwork-first-exhibition-gallery/SKILL.md). It is specifically for exhibitions where viewing individual works matters more than reconstructing the exhibition's architecture, circulation, scale, and spatial atmosphere. Use the separate `exhibition-space-reconstruction` workflow when the space itself is part of the work or the visitor experience.
