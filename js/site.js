// Edit Soul Studio — shared behaviour for every page.
// Content is readable without this file; it adds smooth scroll, scroll-driven motion, work cards and the guided brief.
import { WHATSAPP, INSTAGRAM, DOORS, WORK, KITS, BRIEF } from './data.js';
import { paintStill } from './stills.js';

const ROOT = new URL('../', import.meta.url).href;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasWA = !WHATSAPP.includes('X');
const waLink = text => `https://wa.me/${hasWA ? WHATSAPP : ''}?text=${encodeURIComponent(text)}`;
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(Math.round(n));

/* ---------- Nav ---------- */
const nav = document.querySelector('.nav');
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.getElementById('navLinks');
menuBtn?.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') !== 'true';
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu';
  navLinks.classList.toggle('open', open);
});
navLinks?.addEventListener('click', e => { if (e.target.closest('a') && menuBtn?.getAttribute('aria-expanded') === 'true') menuBtn.click(); });
const onScrollNav = () => nav?.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();

/* ---------- Contact links ---------- */
document.querySelectorAll('[data-wa]').forEach(a => {
  if (!hasWA) return; // until the number is set, WhatsApp links go to the Start page
  a.href = waLink('Hi Edit Soul Studio!'); a.target = '_blank'; a.rel = 'noopener';
});
document.querySelectorAll('[data-ig]').forEach(a => { a.href = INSTAGRAM; });

/* ---------- Work cards ---------- */
function card(w, i) {
  const a = document.createElement('a');
  a.className = 'card'; a.href = w.link; a.target = '_blank'; a.rel = 'noopener';
  a.innerHTML = `<div class="still">${w.thumb ? `<img src="${ROOT}${w.thumb}" alt="" loading="lazy">` : '<canvas width="480" height="600" aria-hidden="true"></canvas>'}
      <span class="tag">${DOORS[w.door].name}</span>
      ${w.sample ? '<span class="sample">Sample</span>' : ''}
      ${w.views ? `<span class="stat"><span data-count="${w.views}">${fmt(w.views)}</span><small>views</small></span>` : ''}</div>
    <h3></h3><p class="label"></p>`;
  a.querySelector('h3').textContent = w.title;
  a.querySelector('.label').textContent = w.kind + (w.sample ? ' · sample' : '');
  a.setAttribute('aria-label', `${w.title}, ${w.kind}${w.views ? `, ${fmt(w.views)} views` : ''}${w.sample ? ', sample project' : ''} (opens in a new tab)`);
  const cv = a.querySelector('canvas'); if (cv) paintStill(cv, w.still ?? i);
  return a;
}
document.querySelectorAll('[data-work]').forEach(box => {
  const door = box.dataset.work;
  const items = WORK.filter(w => !door || door === 'all' || w.door === door);
  box.textContent = '';
  items.forEach((w, i) => box.appendChild(card(w, i)));
});
// Work page filters
const filters = document.querySelector('[data-filters]');
if (filters) {
  const grid = document.querySelector('[data-work]');
  const make = (key, label) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.dataset.key = key;
    b.setAttribute('aria-pressed', String(key === 'all')); filters.appendChild(b); return b;
  };
  make('all', 'All work');
  Object.entries(DOORS).forEach(([k, d]) => make(k, d.name));
  filters.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    filters.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    grid.textContent = '';
    WORK.filter(w => b.dataset.key === 'all' || w.door === b.dataset.key).forEach((w, i) => grid.appendChild(card(w, i)));
  });
}

/* ---------- Kits (rendered where [data-kits] is) ---------- */
document.querySelectorAll('[data-kits]').forEach(box => {
  const door = box.dataset.kits;
  box.textContent = '';
  KITS.filter(k => !door || door === 'all' || k.doors.includes(door)).forEach(k => {
    const el = document.createElement('article');
    el.className = 'kit'; el.id = 'kit-' + k.id; el.setAttribute('data-reveal', '');
    el.innerHTML = `<h3></h3><p class="label violet"></p><ul></ul><a class="arrow-link" href="${ROOT}start/?kit=${k.id}">Ask about this kit</a>`;
    el.querySelector('h3').textContent = k.name;
    el.querySelector('.label').textContent = k.for;
    k.gets.forEach(g => { const li = document.createElement('li'); li.textContent = g; el.querySelector('ul').appendChild(li); });
    box.appendChild(el);
  });
});

/* ---------- Guided brief ---------- */
const briefBox = document.querySelector('[data-brief]');
if (briefBox) {
  const params = new URLSearchParams(location.search);
  const kit = KITS.find(k => k.id === params.get('kit'));
  const door = DOORS[params.get('door')];
  const interest = kit ? kit.name : door ? door.name : '';
  const group = (name, n, title, opts) => `<fieldset><legend><span>${n}</span>${title}</legend><div class="opts">${opts.map((o, i) =>
    `<label class="opt"><input type="radio" name="${name}" value="${i}"><span>${typeof o === 'string' ? o : o.label}</span></label>`).join('')}</div></fieldset>`;
  briefBox.innerHTML = `<form class="brief" id="brief" novalidate>
      ${interest ? `<p class="label violet">You're asking about: ${interest}</p>` : ''}
      ${group('who', '01', 'You are…', BRIEF.who)}
      ${group('want', '02', 'You want…', BRIEF.want)}
      ${group('when', '03', 'When?', BRIEF.when)}
      <div class="rec" id="rec" hidden><p class="label">Where we'd start</p><div class="rec-list" id="recList"></div></div>
      <div class="fields-2">
        <div class="field"><label for="f-name">Your name</label><input id="f-name" autocomplete="name" placeholder="Ravi Kumar"></div>
        <div class="field"><label for="f-msg">Anything else? (optional)</label><textarea id="f-msg" rows="2" placeholder="Your shop name, the idea, a deadline."></textarea></div>
      </div>
      <p class="err" id="formErr" hidden>Add your name and pick what you want, then send.</p>
      <div class="brief-foot"><button type="submit" class="btn btn-violet">Send on WhatsApp <span aria-hidden="true">↗</span></button>
        <p>Opens WhatsApp with your message written. Telugu or English, both fine.</p></div>
    </form>`;
  const form = briefBox.querySelector('form');
  const val = n => { const c = form.querySelector(`input[name="${n}"]:checked`); return c ? +c.value : -1; };
  const rec = form.querySelector('#rec'), recList = form.querySelector('#recList');
  form.addEventListener('change', () => {
    const w = val('want'); if (w < 0) return;
    recList.textContent = '';
    BRIEF.want[w].recs.slice(0, 3).forEach(r => {
      const [type, id] = r.split(':');
      const a = document.createElement('a');
      if (type === 'kit') { const k = KITS.find(x => x.id === id); a.textContent = k.name; a.href = `${ROOT}#kit-${id}`; }
      else { a.textContent = `${DOORS[id].name}: ${DOORS[id].verb.toLowerCase()}`; a.href = ROOT + DOORS[id].href; }
      recList.appendChild(a);
    });
    rec.hidden = false;
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('#f-name').value.trim();
    const w = val('want');
    const err = form.querySelector('#formErr');
    if (!name || w < 0) { err.hidden = false; return; }
    err.hidden = true;
    const who = val('who'), when = val('when'), more = form.querySelector('#f-msg').value.trim();
    const lines = [`Hi Edit Soul Studio, I'm ${name}.`];
    if (who >= 0) lines.push(`I am: ${BRIEF.who[who]}`);
    lines.push(`I want: ${BRIEF.want[w].label}`);
    if (when >= 0) lines.push(`When: ${BRIEF.when[when]}`);
    if (interest) lines.push(`Interested in: ${interest}`);
    if (more) lines.push('', more);
    const a = document.createElement('a'); a.href = waLink(lines.join('\n')); a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  });
}

/* ---------- Giant type: fit to width ---------- */
const giants = [...document.querySelectorAll('[data-fit]')];
function fitGiant() {
  giants.forEach(el => {
    const box = el.parentElement;
    const cs = getComputedStyle(box);
    const w = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const keep = el.style.getPropertyValue('--wdth');
    el.style.setProperty('--wdth', el.dataset.fitWdth || '150');
    el.style.fontSize = '100px';
    el.style.fontSize = (100 * w / el.scrollWidth * .99) + 'px';
    if (keep) el.style.setProperty('--wdth', keep); else el.style.removeProperty('--wdth');
  });
}
if (giants.length) {
  fitGiant();
  document.fonts?.ready.then(() => { fitGiant(); window.ScrollTrigger?.refresh(); });
  addEventListener('resize', fitGiant);
}

/* ---------- The reel (home only) ---------- */
if (document.querySelector('[data-reel]')) import('./reel.js').catch(() => {});

/* ---------- Motion ---------- */
const { gsap, ScrollTrigger, SplitText, Lenis } = window;
if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger, ...(SplitText ? [SplitText] : []));

  // Smooth scroll, driven by GSAP's clock so ScrollTrigger and Lenis stay in step.
  let lenis = null;
  if (Lenis && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.2 }); else target.scrollIntoView();
  });

  playhead(lenis);

  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 1021px)', motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, ctx => {
    const { desk, motion, reduce } = ctx.conditions;
    if (reduce || !motion) {
      // Reduced motion: no scrubbing or pinning, just a short fade as things arrive.
      gsap.utils.toArray('[data-reveal], [data-split]').forEach(el => gsap.from(el, { opacity: 0, duration: .2, ease: 'none', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
      return;
    }
    const nh = () => nav ? nav.offsetHeight : 72;

    // Headings: lines rise out of a mask, tied to scroll.
    if (SplitText) gsap.utils.toArray('[data-split]').forEach(el => {
      SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: self => gsap.from(self.lines, {
        yPercent: 105, stagger: .12, ease: 'none', scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 62%', scrub: .7 } }) });
    });
    // Blocks: drift up and in.
    gsap.utils.toArray('[data-reveal]').forEach(el => gsap.from(el, { y: 40, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 74%', scrub: .7 } }));

    // Hero: the giant word thins and narrows as you leave, like trimming a clip.
    const hero = document.querySelector('.hero');
    if (hero) {
      const giant = hero.querySelector('.giant');
      gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .8 } })
        .fromTo(giant, { '--wdth': 150, '--wght': 850 }, { '--wdth': 62, '--wght': 300, ease: 'none' }, 0)
        .to(hero.querySelector('.hero-front'), { yPercent: -12, ease: 'none' }, 0);
    }

    // Four tracks become one cut.
    const tracks = document.querySelector('[data-tracks]');
    if (tracks) {
      const rows = gsap.utils.toArray('.track', tracks);
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: desk
        ? { trigger: tracks.closest('section'), start: 'top top+=' + nh(), end: '+=160%', scrub: .8, pin: true }
        : { trigger: tracks, start: 'top 80%', end: 'bottom 55%', scrub: .8 } });
      if (desk) tl.fromTo(tracks.querySelector('.scan'), { x: 0 }, { x: () => tracks.clientWidth, duration: rows.length + 1 }, 0);
      rows.forEach((r, i) => {
        tl.from(r.querySelectorAll('.clip'), { scaleX: 0, stagger: .15, duration: .6 }, i)
          .from(r.querySelectorAll('.track-name, p'), { opacity: .2, duration: .4 }, i);
      });
      tl.from(tracks.querySelector('.cut-bar'), { scaleX: 0, duration: .8 }, rows.length);
    }

    // Door cards stack: the one underneath settles back as the next slides over it.
    const doors = desk ? gsap.utils.toArray('.door') : [];
    doors.forEach((d, i) => {
      const next = doors[i + 1]; if (!next) return;
      gsap.to(d, { scale: .94, opacity: .55, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: () => 'top ' + (nh() + 40) + 'px', scrub: true } });
    });

    // Work reel: vertical scroll moves the frames sideways (desktop). Phones swipe natively.
    const proof = document.querySelector('[data-hscroll]');
    if (proof && desk) {
      const track = proof.querySelector('.work-track');
      proof.classList.add('is-hscroll');
      const dist = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
      const tl = gsap.timeline({ scrollTrigger: { trigger: proof, start: 'top top+=' + nh(), end: () => '+=' + dist(), scrub: .8, pin: true, invalidateOnRefresh: true } });
      tl.to(track, { x: () => -dist(), ease: 'none', duration: 1 }, 0);
      track.querySelectorAll('[data-count]').forEach(el => {
        const c = el.closest('.card'); const at = Math.max(0, (c.offsetLeft - innerWidth * .6) / Math.max(1, track.scrollWidth));
        const o = { v: 0 }, end = +el.dataset.count;
        tl.to(o, { v: end, duration: .25, ease: 'none', onUpdate: () => { el.textContent = fmt(o.v); } }, at);
      });
      ctx.add(() => () => { proof.classList.remove('is-hscroll'); });
    }

    // Process: the line draws itself and lights each step.
    gsap.utils.toArray('.steps').forEach(s => {
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: s, start: 'top 80%', end: 'bottom 60%', scrub: .7 } });
      tl.from(s.querySelector('.steps-line i'), desk ? { scaleX: 0, duration: 1 } : { scaleY: 0, duration: 1 }, 0);
      s.querySelectorAll('.step').forEach((st, i, all) => tl.from(st, { opacity: .25, duration: .2 }, i / all.length));
    });

    // Portraits open from the bottom, like a frame wiping in.
    gsap.utils.toArray('.portrait').forEach(p => gsap.fromTo(p, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'none',
      scrollTrigger: { trigger: p, start: 'top 95%', end: 'top 55%', scrub: .7 } }));

    // Marquee drifts; scrolling speeds it up and turns it around.
    const mq = document.querySelector('.mq-track');
    if (mq) {
      const loop = gsap.to(mq, { xPercent: -50, ease: 'none', duration: 40, repeat: -1 });
      ScrollTrigger.create({ trigger: mq, start: 'top bottom', end: 'bottom top', onUpdate: self => {
        const v = self.getVelocity();
        gsap.to(loop, { timeScale: (v < 0 ? -1 : 1) * (1 + Math.min(5, Math.abs(v) / 300)), duration: .3, overwrite: true });
        gsap.to(loop, { timeScale: v < 0 ? -1 : 1, duration: 1.2, delay: .3, overwrite: false });
      } });
    }

    // Systems: before → scan → kitchen, scrubbed (desktop).
    const scene = document.querySelector('[data-scene]');
    if (scene && desk) {
      scene.classList.add('is-scene');
      const p = gsap.utils.toArray('.panel', scene);
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: scene, start: 'top top+=' + nh(), end: '+=200%', scrub: .8, pin: true } });
      p.forEach((panel, i) => { if (i === 0) return;
        tl.to(p[i - 1], { opacity: 0, y: -40, duration: 1 }, i - 1).fromTo(panel, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1 }, i - 1); });
      ctx.add(() => () => { scene.classList.remove('is-scene'); });
    }
  });

  // Recalculate once images and fonts settle.
  addEventListener('load', () => ScrollTrigger.refresh());
}

/* ---------- Scroll playhead: the page is the timeline ---------- */
function playhead(lenis) {
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const el = document.createElement('div');
  el.className = 'playhead'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="ph-rail"></div><div class="ph-head"><span class="ph-code"></span></div>';
  document.body.appendChild(el);
  const head = el.querySelector('.ph-head'), code = el.querySelector('.ph-code');
  const ticks = chapters.map(c => {
    const t = document.createElement('button'); t.className = 'ph-tick'; t.tabIndex = -1;
    t.addEventListener('click', () => lenis ? lenis.scrollTo(c, { offset: -80 }) : c.scrollIntoView());
    el.appendChild(t); return t;
  });
  const fps = 25;
  const tc = s => { const f = Math.floor((s % 1) * fps); s = Math.floor(s);
    return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60, f].map(n => String(n).padStart(2, '0')).join(':'); };
  let max = 1;
  const layout = () => {
    max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const h = el.clientHeight;
    chapters.forEach((c, i) => { ticks[i].style.top = (Math.min(1, (c.getBoundingClientRect().top + scrollY) / max) * h - 6) + 'px'; });
  };
  const narrow = matchMedia('(max-width: 1020px)');
  let idle = 0;
  const update = () => {
    el.classList.add('active'); clearTimeout(idle); idle = setTimeout(() => el.classList.remove('active'), 900);
    const p = Math.min(1, Math.max(0, scrollY / max));
    if (narrow.matches) { head.style.transform = `scaleX(${p})`; return; }
    head.style.transform = `translateY(${p * el.clientHeight}px)`;
    let cur = chapters[0];
    for (const c of chapters) if (c.getBoundingClientRect().top < innerHeight * .5) cur = c;
    code.innerHTML = `${tc(p * (max / innerHeight) * 4)}${cur ? `<b>${cur.dataset.chapter}</b>` : ''}`;
  };
  ScrollTrigger.addEventListener('refresh', layout);
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update });
  layout(); update(); el.classList.remove('active');
}
