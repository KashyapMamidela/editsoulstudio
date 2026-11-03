# Edit Soul Studio — project notes for Claude Code

Website for **Edit Soul Studio**, one creative studio in Nellore, Andhra Pradesh. Domain `editsoulstudio.in`, Instagram `@editsoulstudio.in`.

**Positioning (Nov 2026):** one all-in-one studio for everything people see of a business, a creator or a person. No separate divisions. Hero: giant **STAND OUT** + "One studio for everything people see of your business."
**Team on the site:** Kashyap, Co-founder & CEO · Yashu Singh, Co-founder (initials until real photos arrive; Instagram @kashyap_grit, @yashusingh_28). Nobody else.
**No prices** anywhere on the site. Copy must be plain enough for anyone to understand.

## Structure: four doors

| Page | Door | Verb |
| --- | --- | --- |
| `content/` | Content | Get noticed: reels, editing, shoots, AI video, writing |
| `brand-web/` | Brand & Web | Look the part: identity, websites, print |
| `growth/` | Growth | Get found: Google profile, SEO/AI search, social, channel growth, ads |
| `systems/` | Systems | Run smoother: custom software, QR menu + table ordering first |

Plus `index.html` (home), `work/`, `studio/` (about, founders), `start/` (guided brief → WhatsApp).
Nav: Content · Brand & Web · Growth · Systems · Work + "Start a project". The same four keys are used everywhere (nav, filters, kits, brief).

## Stack

Plain static site on GitHub Pages from `main`. No framework, no build step.
- `css/style.css` — all tokens (type scale, 8px spacing, grid, easing) and components.
- `js/data.js` — **edit content here**: `WHATSAPP` (still `91XXXXXXXXXX`), `INSTAGRAM`, `DOORS`, `WORK`, `KITS`, `BRIEF`.
- `js/site.js` — Lenis + GSAP/ScrollTrigger/SplitText (jsDelivr, pinned 3.13.0), scroll playhead, scroll-driven scenes, work cards, kits, brief.
- `js/reel.js` — three.js film reel (home only, via import map). `js/stills.js` — placeholder thumbnails.
- `partials/` — shared head, header, footer, logo. After editing them run `node tools/sync.mjs` to copy them into every page (between `<!-- name:start/end -->` markers). Pages use relative paths so the site works at a sub-path.
- `sitemap.xml`, `robots.txt`; home has ProfessionalService JSON-LD.

Run locally: `npx serve .` (ES modules don't work from `file://`). `.claude/launch.json` has a `site` config on port 3000.

## How the motion works

- Scroll is the timeline. Desktop (≥1021px): hero word scrubs width/weight, "four tracks → one cut" scene is pinned, door cards stack (sticky), work reel scrolls sideways (pinned) with counters, process line draws, portraits wipe in, Systems before/after scene is pinned.
- Phones: no pinning or horizontal hijack; work reel swipes natively; door cards scroll normally.
- `prefers-reduced-motion`: no Lenis, no scrub or pin, short fades only; the reel holds still.
- Content is visible without JS (scenes default to stacked layouts; JS adds `.is-hscroll` / `.is-scene`). Work cards, kits and the brief need JS; work and brief have fallbacks.
- **Depth layers (home):** `#glBack` (0) < `.back` giant type (1) < `#glFront` (2) < content (3). Sections holding `.back` (hero, contact) must never be pinned or given transform/opacity/z-index, or the weave breaks.

## Design system

Colors: white `#F7F6FB`, black `#0B0A10`, violet `#5A2EFF`, lilac `#9C80FF`. Light theme only.
Type: Anybody (display, variable `wdth`/`wght`), Newsreader italic (voice), Geist (body), Geist Mono (labels). Only use the `--t-*` and `--s-*` tokens.
Logo: the playhead i (`partials/logo.svg`, from `brand/`). The Studio/Systems division logos in `brand/` are retired.

## Placeholders still to fill

WhatsApp number and reply hours · real work links, thumbnails and confirmed view counts (Baahubali shows 241K, older copy said 300K) · founder photos (portraits show initials K / Y for now; put photos in `media/` and add an `<img>` inside `.portrait`). Founder Instagram: Yashu's specialty · Serve demo link · which kits to keep.

## Skills

`.claude/skills` is restored from `skills-lock.json` (`npx skills experimental_install`): Emil Kowalski motion skills, UX (cuellarfr/design-skills, impeccable, web-design-guidelines), copy/CRO/SEO (coreyhaines31/marketingskills), frontend-design, webapp-testing. Run `review-animations` on motion changes.

## Conventions

- Commit messages end with a `Co-Authored-By` line for Claude.
- Test at 1440px and 390px, with reduced motion, and check the console before pushing.
