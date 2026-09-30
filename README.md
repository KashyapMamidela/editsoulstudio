# Edit Soul Studio

A scroll-driven 3D walkthrough website for **Edit Soul Studio**, a video studio in Nellore, Andhra Pradesh. Instead of a normal page, visitors walk through the studio: each chapter is a room in a lilac-white mist, with a sculpture that stands for a service.

| Chapter | Room | What it says |
| --- | --- | --- |
| 0 · Arrival | A breathing, contour-lined soul you fly *through* | Who we are |
| I · The Cut | A helix of film frames and a violet blade | Video editing, color, sound, titles, writing |
| II · The Machine | A cloud of noise that assembles into a form as you approach | AI videos, animated and faceless content |
| III · The Field | A circle of 9:16 monoliths | Instant reels, photo and video shoots |
| IV · The Screen | A 2.39:1 screen with projector light | Studio partner for short films and YouTube series |
| V · The Archive | Floating frames you can click | Portfolio |
| VI · The Two | A binary star | Kashyap and Yashu Singh |
| VII · Contact | A portal | WhatsApp enquiry form |

Palette: paper white, ink black, ultraviolet. Type: Bodoni Moda, Manrope, IBM Plex Mono.

## Design choices

- **Curiosity first.** Rooms are hidden in the mist and appear only as you get close, so scrolling feels like discovery.
- **One idea per screen.** Each room shows one service, so visitors aren't overwhelmed.
- **Progress you can see.** The chapter rail on the right shows how far along you are and lets people jump anywhere.
- **One clear action.** "Begin a project" is always in the corner, and the walk ends at the contact form.

## Edit the content

Open `js/main.js`. The top of the file has a clearly marked block:

```js
const WHATSAPP = '91XXXXXXXXXX';   // your number with country code
const INSTAGRAM = 'https://www.instagram.com/editsoulstudio.in/';
const WORK = [ { title, kind, link }, ... ];   // frames in The Archive
```

Text for each chapter lives in `index.html` inside the `<section class="panel">` blocks.

## Run locally

It is plain HTML, CSS and JavaScript (three.js loads from a CDN), so no build step is needed:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Open http://localhost:8000. Opening `index.html` directly from the file system won't work because browsers block ES modules there.

## Put it online (GitHub Pages)

1. Repo **Settings → Pages**.
2. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site appears at `https://kashyapmamidela.github.io/editsoulstudio/`.

For the domain `editsoulstudio.in`: add it under **Settings → Pages → Custom domain**, then at your domain registrar add the four GitHub Pages `A` records and a `CNAME` for `www` pointing to `kashyapmamidela.github.io`.

## Files

```
index.html      page structure and chapter text
css/style.css   typography, panels, cursor, mobile layout
js/main.js      three.js scene, camera path, rooms, interactions
build.mjs       makes a single-file copy in dist/ (optional)
```

Works on phones (text moves to the bottom, fewer particles) and falls back to a plain scrolling page if WebGL isn't available. Respects "reduce motion".
