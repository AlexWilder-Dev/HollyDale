# The Hollydale Peckham: concept site

A speculative one-page website for The Hollydale, 115 Hollydale Road, London SE15 2TF. It's a static front end with no build step, CMS, database or backend.

The design takes its look from the pub itself: the bottle-green fascia with gilt lettering and the "THP @ 115" corner sign, the white walls over a green dado, the menu card with its H roundel, the chalkboards by the bar, the cork "THP Goings On" noticeboard and the El Rayo mural in the garden. Colours and type follow the pub's own Linktree settings (cream `#FFF6E6`, green `#254F1A`, EB Garamond).

## Preview locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Use a local server rather than opening the file directly, because the menu, what's on and quotes load from `data/`.

## Deploy (GitHub Pages)

Go to Settings → Pages, choose "Deploy from a branch", pick `gh-pages` and `/ (root)`. All paths are relative.

## Editing

| File | Contents |
| --- | --- |
| `index.html` | Page structure and copy |
| `css/style.css` | Styles (mobile first) |
| `js/main.js` | Opening hours and the live "Open now" line, menu/what's on/quote rendering, nav, form |
| `data/menu.json` | The menu. `price` is a number; `star` marks the famous one; `tags` adds veg/vegan pills |
| `data/goings-on.json` | Cards on the noticeboard. `colour`: yellow, pink, orange, mint, teal, purple, paper or chalk |
| `data/reviews.json` | Google rating and quotes. Add real Google reviews as extra entries in `quotes` |

## Where the content comes from

- **Hours, phone/WhatsApp, email, party-hire terms, sample menu and prices, quiz and sip-and-paint details:** the pub's own site (thehollydalepeckham.com, now offline), as indexed by search engines.
- **Story (Richard, 2021 visit, 2024 reopening, wooden bar, cinema seats, El Rayo mural, Fran Giffard's birds, noticeboard) and Richard's quote:** [CityStack](https://www.citystack.co/pub/the-hollydale).
- **Chalkboard lines** ("Need a space for a party? You're in one…", Holly Dice, 2-4-1 cocktails, THP Street Food Special): the pub's chalkboards, seen in CityStack's photos.
- **Kids' Table:** the poster on the pub's noticeboard (CityStack photo). **Burger & a Bevy, World Cup final, Nunhead Art Trail 2026:** [Mato](https://ma.to/venue/thehollydalepeckham).
- **Name change and painted-out sign:** [Pubs Galore forum](https://forums.pubsgalore.co.uk/archive/index.php/t-44780.html).
- **Licensees 1878–1944:** [pubwiki](https://pubwiki.co.uk/LondonPubs/Camberwell/Hollydale.shtml) (Post Office directories and census).
- **Walled garden, layout:** Savills letting particulars for Wellington Pub Company.
- **Quotes:** CityStack and [Transpontine](http://transpont.blogspot.com/2025/01/hollydale-tavern-reopens.html).

## Photos

See `images/CREDITS.md`. The pub photos come from CityStack's feature and are used here for the pitch only. Swap in the pub's own photography, or get permission, before this goes anywhere public.

## Before going live

- Confirm the menu, prices and what's-on details with the pub
- Replace or license the photos
- Remove `<meta name="robots" content="noindex">`, the "Concept site" footer line and the demo note in the party form
- Connect the party form to a real inbox
- Set the ntfy topic in the script at the bottom of `index.html` (`YOUR-NTFY-TOPIC`), or remove the script
