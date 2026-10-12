# The Hollydale: demo site

A speculative one-page website for The Hollydale, 115 Hollydale Road, London SE15 2TF. It's a static front end with no build step, CMS, database or backend.

## Preview locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Use a local server rather than opening the file directly, because the menu loads from `data/menu.json`.

## Deploy (GitHub Pages)

Go to Settings → Pages, choose "Deploy from a branch", pick this branch and `/ (root)`. All paths are relative, so the site works from a project sub-path.

## What's where

| File | Contents |
| --- | --- |
| `index.html` | The page and all its copy |
| `css/style.css` | Styles (mobile first) |
| `js/main.js` | Opening hours data and the live "Open now" line, menu rendering, nav, form |
| `data/menu.json` | Menu items. Placeholder burgers for now; set `price` to a number (e.g. `12.5`) and `placeholder` to `false` when real |

## Photo slots

No venue photos were available, so each photo position shows a marked slot. Add a photo with the matching filename to `images/` and it will appear in place of the slot:

| File | Section |
| --- | --- |
| `images/frontage.jpg` | Hero: the frontage on the corner of Brayards Road (portrait works best) |
| `images/bar.jpg` | The pub: the main bar (portrait, shown in an arch) |
| `images/burger.jpg` | Food (square) |
| `images/garden.jpg` | The garden (wide, full-bleed) |
| `images/archive.jpg` | Since 1878: an old photo of the pub, if one exists |

Aim for about 2000px on the long edge, saved as JPEG at roughly 75–80% quality.

## Placeholders still to fill

- Phone, email, Instagram and Facebook (Find us section)
- Three review slots (Reviews section): paste real Google reviews and reviewer names
- Landlord names and dates between 1878 and the 1940s (Since 1878 timeline)
- Menu dishes, descriptions and prices (`data/menu.json`)
- The ntfy topic in the script at the bottom of `index.html` (`YOUR-NTFY-TOPIC`)

## Before going live

- Remove `<meta name="robots" content="noindex">` from `index.html`
- Remove the "Concept site" line in the footer and the demo note in the private hire success message
- Connect the private hire form to a real inbox (it currently shows a success message only)
- Remove the demo ping script
