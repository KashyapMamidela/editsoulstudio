# Edit Soul Studio

Website for **Edit Soul Studio**, a video studio in Nellore, Andhra Pradesh: editing, AI video, shoots and post-production for filmmakers.

## The idea

A white page where a 3D **film reel** weaves through giant type: it passes behind some letters and in front of others. The reel is the showreel: its frames are the projects in `WORK`. Hover a frame to pause it, click to watch the video, and scroll to scrub it like a timeline. It appears through `SOUL` at the top and again through `LET'S MAKE IT` at the end.

How the weave works: two transparent WebGL canvases render the same scene, one clipped to everything behind the type and one to everything in front, with the HTML type sandwiched between them.

- **Hero:** a huge variable-width `SOUL`. Letters near the cursor thin out and turn violet. A rotating badge takes you to the services.
- **Marquee:** what the studio makes, drifting; scrolling speeds it up and flips its direction.
- **What are you making?** A frame follows the cursor over the list. The client picks their project (reel, YouTube, short film, AI video, shoot, writing) and sees exactly what they get and what you need from them. "Start this project" pre-fills the contact form.
- **The work:** a draggable strip of frames that tilt toward the cursor.
- **Process:** four steps from first message to final files. Key words get hand-drawn circles and underlines as they appear.
- **Team:** Kashyap and Yashu Singh.
- **Contact:** a form over a giant `LET'S MAKE IT` that opens WhatsApp with the message ready.

Type: Anybody (variable width, display) · Newsreader italic (voice) · Geist (body) · Geist Mono (labels).
Palette: white `#F7F6FB`, black `#0B0A10`, violet `#5A2EFF`.

## Logos

All logos are in `brand/` as SVGs with the text converted to shapes, so they look the same on any computer without installing fonts.

| File | Use |
| --- | --- |
| `editsoul-wordmark.svg` | Main logo on light backgrounds |
| `editsoul-wordmark-white.svg` | On dark backgrounds or photos |
| `editsoul-wordmark-black.svg` | One color: stamps, watermarks, print |
| `editsoul-wordmark-on-dark.svg` | White logo with its own black background |
| `editsoul-stacked.svg` / `-white` | Big "edit SOUL" lockup for posters and video end cards |
| `editsoul-badge.svg` / `-white` / `-black` | Round seal for stickers, watermarks and reel corners |
| `editsoul-icon-violet.svg` | Instagram / WhatsApp profile picture |
| `editsoul-icon-black.svg` / `-white` | Profile picture alternatives |
| `favicon.svg` | Browser tab icon for the website |

`brand/generate.py` rebuilds them from the font files if you change a color (`FONT_DIR=path/to/fonts python3 brand/generate.py`).

## Edit the content

Open `js/main.js`. The top of the file has a clearly marked block:

```js
const WHATSAPP = '91XXXXXXXXXX';   // your number with country code
const INSTAGRAM = 'https://www.instagram.com/editsoulstudio.in/';
const CHOICES = [...]  // the 'What are you making?' options
const WORK = [...]     // frames in the work strip
```

Section text lives in `index.html`. To put a real thumbnail on a reel frame, add `thumb: 'media/your-image.jpg'` to that item in `WORK` and put the image in a `media/` folder.

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
css/style.css   type, layout, depth layers, cursor, mobile
js/main.js      content, film reel (three.js), interactions
build.mjs       makes a single-file copy in dist/ (optional)
brand/          logos (SVG) and the script that generates them
```

On phones the reel is smaller and frames open with a tap. If WebGL isn't available the page still works without it. Respects "reduce motion".
