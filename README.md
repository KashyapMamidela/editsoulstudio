# Edit Soul Studio

Website for **Edit Soul Studio**, one creative studio in Nellore, Andhra Pradesh: videos and photos, branding and websites, Google and social growth, and custom software for businesses.

Founded by **Kashyap** (Co-founder & CEO) and **Yashu Singh** (Co-founder).

## Pages

- **Home**: giant STAND OUT with a 3D film reel weaving through it, four tracks becoming one cut, the four doors, the work reel, kits, process, founders, questions and the guided brief.
- **Content**, **Brand & Web**, **Growth**, **Systems**: what you can ask for, what you get and what we need from you, matching kits, work and questions.
- **Work**: every project, filterable by door.
- **About us**: founders, what you can count on, how it works.
- **Start a project**: three quick questions and your name, then WhatsApp opens with the message written.

## Edit the content

Open `js/data.js`:

```js
export const WHATSAPP = '91XXXXXXXXXX';   // your number with country code
export const WORK = [...];                // work items; add thumb: 'media/x.jpg' for real images
export const KITS = [...];                // kits shown on the home and door pages
export const BRIEF = {...};               // the Start a project questions
```

Page text lives in each page's `index.html`. The shared header, footer and `<head>` live in `partials/`; after changing them run:

```bash
node tools/sync.mjs
```

## Run locally

```bash
npx serve .
```

Then open the address it prints. Opening the files directly won't work because browsers block ES modules from `file://`.

## Put it online

GitHub repo **Settings → Pages**: deploy from branch `main`, folder `/ (root)`. For `editsoulstudio.in`, add it as the custom domain and point the domain's DNS at GitHub Pages.

## Files

```
index.html  content/  brand-web/  growth/  systems/  work/  studio/  start/
css/style.css     tokens and components
js/data.js        content you edit
js/site.js        motion, cards, brief
js/reel.js        3D film reel (home)
partials/         shared head, header, footer, logo
tools/sync.mjs    copies partials into every page
brand/            logos (SVG) and the script that generates them
```

Type: Anybody · Newsreader italic · Geist · Geist Mono. Colors: white `#F7F6FB`, black `#0B0A10`, violet `#5A2EFF`.
