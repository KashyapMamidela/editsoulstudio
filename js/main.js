// Edit Soul Studio
// A 3D film reel weaves through the giant type: behind some letters, in front of others.
// Its frames are the work: hover pauses, click opens, scrolling scrubs.
import * as THREE from 'three';

/* ================= EDIT THESE ================= */
const WHATSAPP = '91XXXXXXXXXX'; // country code + number, no + or spaces
const INSTAGRAM = 'https://www.instagram.com/editsoulstudio.in/';

// "What are you making?" — the client picks one of these.
const CHOICES = [
  {
    title: 'A reel for my business',
    summary: 'We come to you, shoot on the spot and hand back reels built to stop the scroll.',
    get: ['Shoot at a location we choose together', 'Hook-first edit with captions and music', 'Color grade and sound cleanup', 'Delivered in 9:16, ready to post'],
    need: ['Your product, shop or place', 'About an hour on shoot day', 'Any reels you like, for reference'],
  },
  {
    title: 'A YouTube video',
    summary: 'Long-form edits that keep people watching, including faceless and animated channels.',
    get: ['Script and hook help if you need it', 'Edit paced for watch time', 'Sound cleanup, music and titles', 'Motion graphics or animation where it helps'],
    need: ['Your raw footage, or just the topic for faceless videos', 'Your channel link', 'Your upload schedule'],
  },
  {
    title: 'A short film or series',
    summary: 'A full post-production partner, from the first assembly to the release trailer.',
    get: ['Assembly, rough cut and final cut', 'Color grading and a consistent look', 'Sound design, dialogue cleanup and mix', 'Subtitles, credits, teaser and trailer'],
    need: ['Footage and script', 'Your references for the look', 'Release date'],
  },
  {
    title: 'An AI video',
    summary: 'We generate the footage with AI, then edit it until it feels made, not prompted.',
    get: ['Script and shot list', 'Generated scenes, characters and b-roll', 'Edit, color matching, voice and music', 'Every format: 9:16, 1:1, 16:9'],
    need: ['Your product or idea', 'Brand colors and logo', 'Written permission for any real face or voice'],
  },
  {
    title: 'A photo or video shoot',
    summary: 'Professional photography and videography for brands, products, events and people.',
    get: ['Planning the shots with you', 'The shoot itself', 'Edited photos and graded video', 'Files sized for web and print'],
    need: ['Date and place', 'What the photos are for', 'Products or people ready on the day'],
  },
  {
    title: 'Words first',
    summary: 'Content writing for video: the part that decides whether anyone watches.',
    get: ['Scripts and voiceover text', 'Hooks and opening lines', 'Captions and post copy', 'Video ideas for a month of posting'],
    need: ['What you sell or talk about', 'Who you want watching', 'Your tone: fun, calm, bold'],
  },
];

// The work strip. Put each video's Instagram/YouTube URL in `link`. sample:true shows a "Sample" tag.
const WORK = [
  { title: 'Baahubali masking edit', kind: 'Edit', stat: '300K+ views', link: INSTAGRAM, hue: 0 },
  { title: 'Café brand reel', kind: 'Instant reel', sample: true, link: INSTAGRAM, hue: 1 },
  { title: 'Short film color grade', kind: 'Film post', sample: true, link: INSTAGRAM, hue: 2 },
  { title: 'AI product film', kind: 'AI video', sample: true, link: INSTAGRAM, hue: 3 },
  { title: 'Faceless explainer', kind: 'Animated', sample: true, link: INSTAGRAM, hue: 4 },
  { title: 'Product shoot', kind: 'Photography', sample: true, link: INSTAGRAM, hue: 5 },
];
/* ============================================== */

document.documentElement.classList.add('js');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const small = () => innerWidth < 820;

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (window.Lenis && !reduceMotion) {
  lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
function scrollToEl(el) {
  if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.6 });
  else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  scrollToEl(target);
});

function openLink(url) {
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
}

/* ---------- Giant type: fit to width, split into letters ---------- */
function fitGiant() {
  document.querySelectorAll('[data-fit]').forEach(el => {
    const box = el.parentElement;
    const w = box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) - parseFloat(getComputedStyle(box).paddingRight);
    el.style.fontSize = '100px';
    const natural = el.scrollWidth;
    el.style.fontSize = (100 * w / natural * 0.995) + 'px';
  });
}
const heroWord = document.getElementById('heroWord');
const letters = [];
function splitHero() {
  const text = heroWord.textContent;
  heroWord.textContent = '';
  [...text].forEach(ch => {
    const s = document.createElement('span');
    s.className = 'ch'; s.textContent = ch;
    heroWord.appendChild(s); letters.push(s);
  });
}
splitHero();
fitGiant();
document.fonts?.ready.then(fitGiant);
addEventListener('resize', fitGiant);

// Variable-font lens: letters near the cursor get heavier and wider.
const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, speed: 0 };
addEventListener('pointermove', e => {
  mouse.speed = Math.min(1, mouse.speed + Math.hypot(e.movementX || 0, e.movementY || 0) / 250);
  mouse.x = e.clientX; mouse.y = e.clientY;
  mouse.nx = e.clientX / innerWidth * 2 - 1;
  mouse.ny = -(e.clientY / innerHeight) * 2 + 1;
});
function lens() {
  if (!finePointer || reduceMotion) return;
  letters.forEach(s => {
    const r = s.getBoundingClientRect();
    const d = Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2));
    const k = Math.max(0, 1 - d / (innerWidth * 0.32));
    const wght = 850 - k * 650; // near the cursor a letter thins out, like light passing through it
    s.style.fontVariationSettings = `"wdth" 150, "wght" ${wght.toFixed(0)}`;
    s.style.color = k > 0.55 ? 'var(--violet)' : '';
  });
}

/* ---------- Chooser ---------- */
const choicesEl = document.getElementById('choices');
const svcSelect = document.getElementById('f-svc');
CHOICES.forEach((c, i) => {
  const li = document.createElement('li');
  li.className = 'choice';
  li.dataset.open = i === 0 ? 'true' : 'false';
  const id = 'choice-' + i;
  li.innerHTML = `
    <button class="choice-row" type="button" aria-expanded="${i === 0}" aria-controls="${id}" data-cursor="${i === 0 ? 'Close' : 'Open'}">
      <span class="meta">${String(i + 1).padStart(2, '0')}</span><span class="t"></span><span class="arrow" aria-hidden="true">+</span>
    </button>
    <div class="detail" id="${id}"><div class="detail-inner"><div class="detail-grid">
      <p class="summary"></p>
      <div><p class="meta">You get</p><ul class="get"></ul></div>
      <div><p class="meta">We need from you</p><ul class="need"></ul></div>
      <button class="pill dark go" type="button" data-cursor="Start">Start this project <span aria-hidden="true">→</span></button>
    </div></div></div>`;
  li.querySelector('.t').textContent = c.title;
  li.querySelector('.summary').textContent = c.summary;
  c.get.forEach(t => { const x = document.createElement('li'); x.textContent = t; li.querySelector('.get').appendChild(x); });
  c.need.forEach(t => { const x = document.createElement('li'); x.textContent = t; li.querySelector('.need').appendChild(x); });
  li.querySelector('.choice-row').addEventListener('click', () => {
    const open = li.dataset.open === 'true';
    choicesEl.querySelectorAll('.choice').forEach(o => {
      o.dataset.open = 'false';
      const b = o.querySelector('.choice-row'); b.setAttribute('aria-expanded', 'false'); b.dataset.cursor = 'Open';
    });
    if (!open) {
      li.dataset.open = 'true';
      const b = li.querySelector('.choice-row'); b.setAttribute('aria-expanded', 'true'); b.dataset.cursor = 'Close';
    }
    setTimeout(() => lenis?.resize(), 650);
  });
  li.querySelector('.go').addEventListener('click', () => {
    svcSelect.value = c.title;
    scrollToEl(document.getElementById('contact'));
    setTimeout(() => document.getElementById('f-name').focus({ preventScroll: true }), 1400);
  });
  choicesEl.appendChild(li);
  const opt = document.createElement('option'); opt.textContent = c.title; svcSelect.appendChild(opt);
});
{ const opt = document.createElement('option'); opt.textContent = 'Not sure yet'; svcSelect.appendChild(opt); }

/* ---------- Work strip with generated stills ---------- */
const strip = document.getElementById('strip');
function paintStill(cv, i) {
  // Abstract "stills" in the studio palette, one composition per card, until real thumbnails are added.
  const x = cv.getContext('2d'); const W = cv.width, H = cv.height;
  const V = '90,46,255', L = '247,246,251';
  x.fillStyle = '#0B0A10'; x.fillRect(0, 0, W, H);
  const glow = (cx, cy, r, a = .9) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(${L},${a})`); g.addColorStop(.15, `rgba(170,140,255,${a * .85})`); g.addColorStop(.5, `rgba(${V},${a * .45})`); g.addColorStop(1, `rgba(${V},0)`);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  };
  x.lineWidth = 1;
  switch (i % 6) {
    case 0: // horizon waves
      glow(W * .32, H * .36, W * .9);
      x.strokeStyle = `rgba(${L},.5)`;
      for (let k = 0; k < 20; k++) { x.globalAlpha = 1 - k / 20; x.beginPath(); const y = H * (.56 + k * .021);
        for (let px = 0; px <= W; px += 8) x.lineTo(px, y + Math.sin(px / 46 + k * .6) * (5 + k)); x.stroke(); }
      break;
    case 1: // vertical beams (a reel)
      for (let k = 0; k < 9; k++) { const bx = W * (.1 + k * .1); const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, `rgba(${V},0)`); g.addColorStop(.5, `rgba(${V},${.25 + (k % 3) * .2})`); g.addColorStop(1, `rgba(${V},0)`);
        x.fillStyle = g; x.fillRect(bx, 0, 3 + (k % 4) * 6, H); }
      glow(W * .62, H * .5, W * .45, .7);
      break;
    case 2: // eclipse (film)
      glow(W * .5, H * .45, W * .75);
      x.fillStyle = '#0B0A10'; x.beginPath(); x.arc(W * .52, H * .44, W * .2, 0, 7); x.fill();
      x.strokeStyle = `rgba(${L},.8)`; x.beginPath(); x.arc(W * .52, H * .44, W * .2, 0, 7); x.stroke();
      break;
    case 3: // dot field forming (AI)
      for (let gy = 0; gy < 34; gy++) for (let gx = 0; gx < 27; gx++) {
        const px = W * (gx + .5) / 27, py = H * (gy + .5) / 34; const d = Math.hypot(px - W * .5, py - H * .5) / (W * .5);
        const r = Math.max(0, 2.6 - d * 2.2); if (r <= 0) continue;
        x.fillStyle = d < .5 ? `rgba(${L},.9)` : `rgba(${V},.9)`; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); }
      break;
    case 4: // concentric rings (animated / faceless)
      glow(W * .5, H * .55, W * .6, .5);
      x.strokeStyle = `rgba(${L},.55)`;
      for (let k = 1; k < 16; k++) { x.beginPath(); x.ellipse(W * .5, H * .55, k * 16, k * 11, 0, 0, 7); x.stroke(); }
      break;
    default: // split horizon (photography)
      x.fillStyle = `rgb(${L})`; x.fillRect(0, H * .58, W, H * .42);
      glow(W * .7, H * .58, W * .5);
      x.fillStyle = '#0B0A10'; x.fillRect(W * .18, H * .38, W * .08, H * .2);
  }
  x.globalAlpha = 1;
  x.fillStyle = '#0B0A10'; x.fillRect(0, 0, W, H * .06); x.fillRect(0, H * .94, W, H * .06);
}
WORK.forEach((w, i) => {
  const a = document.createElement('a');
  a.className = 'card'; a.href = w.link; a.target = '_blank'; a.rel = 'noopener'; a.dataset.cursor = 'Watch';
  a.innerHTML = `<div class="still"><canvas width="480" height="600"></canvas>
      <span class="tag">${String(i + 1).padStart(2, '0')} — ${w.kind}</span>
      ${w.sample ? '<span class="sample">Sample</span>' : ''}
      ${w.stat ? `<span class="stat">▲ ${w.stat}</span>` : ''}</div>
    <h3></h3><p class="meta"></p>`;
  a.querySelector('h3').textContent = w.title;
  a.querySelector('.meta').textContent = w.kind;
  paintStill(a.querySelector('canvas'), i);
  strip.appendChild(a);
});
// drag to scroll (mouse)
{
  let down = false, sx = 0, sl = 0, moved = 0;
  strip.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft; });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
    if (moved > 5) strip.classList.add('dragging');
    strip.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => { down = false; setTimeout(() => strip.classList.remove('dragging'), 0); });
  strip.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation(); }, { passive: true });
}

/* ---------- Contact form ---------- */
document.getElementById('igLink').href = INSTAGRAM;
document.getElementById('waText').textContent = WHATSAPP.includes('X') ? 'WhatsApp +91 XXXXX XXXXX' : 'WhatsApp +' + WHATSAPP;
document.getElementById('brief').addEventListener('submit', e => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  const err = document.getElementById('formErr');
  if (!v('f-name') || !v('f-msg')) { err.hidden = false; return; }
  err.hidden = true;
  const text = `Hi Edit Soul Studio, I'm ${v('f-name')}.\nI'm making: ${v('f-svc')}\n\n${v('f-msg')}`;
  openLink('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text));
});

/* ---------- Cursor ---------- */
const cursor = document.getElementById('cursor');
const cursorLabel = document.getElementById('cursorLabel');
const cur = { x: innerWidth / 2, y: innerHeight / 2 };
document.addEventListener('pointerover', e => {
  const t = e.target.closest('[data-cursor]');
  if (t) { cursorLabel.textContent = t.dataset.cursor; cursor.classList.add('on'); }
});
document.addEventListener('pointerout', e => {
  const t = e.target.closest('[data-cursor]');
  if (t && !t.contains(e.relatedTarget)) cursor.classList.remove('on');
});

/* ---------- Reveals ---------- */
const reveals = document.querySelectorAll('.reveal, .sec-head, .steps li, .person, .card, .choice');
reveals.forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
}), { rootMargin: '0px 0px -8% 0px' });
reveals.forEach(el => io.observe(el));
setTimeout(() => reveals.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('in'); }), 120);
setTimeout(() => reveals.forEach(el => el.classList.add('in')), 6000);


/* ---------- Marquee: what we make, drifting; scroll speeds it up and flips it ---------- */
const mq = document.getElementById('mq');
{
  const words = [['Reels', 'for cafés'], ['Short films', 'graded'], ['AI video', 'made, not prompted'], ['YouTube', 'cut for watch time'], ['Shoots', 'on location'], ['Scripts', 'words first']];
  const one = words.map(([a, b]) => `<span>${a}</span><em>${b}</em><i>✳</i>`).join('');
  mq.innerHTML = one + one;
}
const mqState = { x: 0, dir: 1, last: scrollY };

/* ---------- Chooser peek: a frame follows the cursor over the list ---------- */
const peek = document.getElementById('peek');
const peekCanvas = peek.querySelector('canvas');
const PEEK_STILL = [1, 4, 2, 3, 5, 0];
const pk = { x: 0, y: 0, vx: 0, on: false, idx: -1 };
choicesEl.querySelectorAll('.choice-row').forEach((row, i) => {
  row.addEventListener('pointerenter', () => {
    if (!finePointer) return;
    if (pk.idx !== i) { paintStill(peekCanvas, PEEK_STILL[i] ?? i); pk.idx = i; }
    pk.on = true; peek.classList.add('on');
  });
  row.addEventListener('pointerleave', () => { pk.on = false; peek.classList.remove('on'); });
});

/* ---------- Work cards tilt toward the cursor ---------- */
document.querySelectorAll('.card').forEach(card => {
  const still = card.querySelector('.still');
  card.addEventListener('pointermove', e => {
    const r = still.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    still.style.setProperty('--ry', (px * 10).toFixed(2) + 'deg');
    still.style.setProperty('--rx', (-py * 10).toFixed(2) + 'deg');
  });
  card.addEventListener('pointerleave', () => { still.style.setProperty('--rx', '0deg'); still.style.setProperty('--ry', '0deg'); });
});

const badgeSvg = document.querySelector('.badge svg');
const reelTip = document.getElementById('reelTip');

/* ---------- The reel: a 3D film strip that weaves through the giant type ----------
   Two canvases share one scene: the back one draws everything behind the type (z < 0),
   the front one everything in front (z > 0). So the strip passes behind some letters
   and in front of others. Its frames are the WORK list: hover pauses, click opens. */
const glBack = document.getElementById('glBack');
const glFront = document.getElementById('glFront');
let rBack = null, rFront = null;
try {
  rBack = new THREE.WebGLRenderer({ canvas: glBack, antialias: true, alpha: true });
  rFront = new THREE.WebGLRenderer({ canvas: glFront, antialias: true, alpha: true });
} catch (e) { rBack = rFront = null; document.documentElement.classList.add('no-gl'); }

const reel = { hover: -1, hoverTitle: '' };

if (rBack && rFront) {
  for (const r of [rBack, rFront]) {
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.setSize(innerWidth, innerHeight);
    r.setClearColor(0x000000, 0);
    r.localClippingEnabled = false;
  }
  rBack.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)];  // keep z <= 0
  rFront.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)];  // keep z >= 0

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 12);
  const halfH = Math.tan(THREE.MathUtils.degToRad(15)) * 12;

  // Film atlas: one frame per WORK item, with sprocket holes and edge numbers
  const FW = 512, FH = 384, PIC_H = 288, PAD = 48;
  const atlas = document.createElement('canvas');
  atlas.width = FW * WORK.length; atlas.height = FH;
  const ax = atlas.getContext('2d');
  const tex = new THREE.CanvasTexture(atlas);
  tex.wrapS = THREE.RepeatWrapping; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  function drawFrame(i, img) {
    const x0 = i * FW;
    ax.fillStyle = '#0B0A10'; ax.fillRect(x0, 0, FW, FH);
    // sprocket holes
    ax.fillStyle = '#F7F6FB';
    for (let k = 0; k < 8; k++) {
      const hx = x0 + 14 + k * 64;
      ax.beginPath(); ax.roundRect(hx, 12, 30, 22, 4); ax.fill();
      ax.beginPath(); ax.roundRect(hx, FH - 34, 30, 22, 4); ax.fill();
    }
    // picture
    const px = x0 + 16, py = PAD, pw = FW - 32, ph = PIC_H;
    if (img) {
      const s = Math.max(pw / img.width, ph / img.height);
      const w = img.width * s, h = img.height * s;
      ax.save(); ax.beginPath(); ax.rect(px, py, pw, ph); ax.clip();
      ax.drawImage(img, px + (pw - w) / 2, py + (ph - h) / 2, w, h); ax.restore();
    } else {
      const c = document.createElement('canvas'); c.width = pw; c.height = ph;
      paintStill(c, i); ax.drawImage(c, px, py);
    }
    // edge label
    ax.fillStyle = '#F7F6FB'; ax.font = '500 15px "Geist Mono", monospace';
    ax.fillText(String(i + 1).padStart(2, '0') + ' — ' + WORK[i].title.toUpperCase(), px + 12, py + ph - 14);
    tex.needsUpdate = true;
  }
  WORK.forEach((w, i) => {
    drawFrame(i);
    if (w.thumb) { const im = new Image(); im.onload = () => drawFrame(i, im); im.src = w.thumb; }
  });
  document.fonts?.ready.then(() => WORK.forEach((w, i) => { if (!w.thumb) drawFrame(i); }));

  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true });
  let strip = null, stripLen = 1, stripH = 1;

  // The path is written in screen units (x: -1..1 of half width, y: -1..1 of half height).
  const PATH = [[-1.5, -0.35, -2.4], [-0.95, 0.22, 1.9], [-0.35, -0.12, -2.2], [0.2, 0.2, 2.0], [0.75, -0.18, -1.9], [1.5, 0.3, 2.2]];
  function build() {
    if (strip) { scene.remove(strip); strip.geometry.dispose(); }
    const aspect = innerWidth / innerHeight, halfW = halfH * aspect;
    const mob = innerWidth < 820;
    const pts = PATH.map(([x, y, z]) => new THREE.Vector3(x * halfW, y * halfH * (mob ? 0.55 : 1), z * (mob ? 0.7 : 1)));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
    stripLen = curve.getLength();
    stripH = halfH * (mob ? 0.2 : 0.36);
    const frameW = stripH * FW / FH;
    const repeats = stripLen / (frameW * WORK.length);
    const M = 700;
    const pos = new Float32Array((M + 1) * 2 * 3), uv = new Float32Array((M + 1) * 2 * 2);
    const idx = [];
    const Z = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i <= M; i++) {
      const u = i / M;
      const p = curve.getPointAt(u), T = curve.getTangentAt(u);
      const B0 = new THREE.Vector3().crossVectors(Z, T).normalize();
      const N0 = new THREE.Vector3().crossVectors(T, B0).normalize();
      const twist = Math.sin(u * Math.PI * 2.2 + 0.6) * 0.75;
      const side = B0.multiplyScalar(Math.cos(twist)).add(N0.multiplyScalar(Math.sin(twist))).multiplyScalar(stripH / 2);
      pos.set([p.x + side.x, p.y + side.y, p.z + side.z, p.x - side.x, p.y - side.y, p.z - side.z], i * 6);
      uv.set([u * repeats, 1, u * repeats, 0], i * 4);
      if (i < M) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    strip = new THREE.Mesh(g, mat);
    strip.userData.repeats = repeats;
    scene.add(strip);
  }
  build();

  // Which giant word should the reel weave through right now?
  const anchors = [...document.querySelectorAll('[data-reel]')];
  function anchorY() {
    let best = null, bestD = Infinity;
    for (const el of anchors) {
      const r = el.getBoundingClientRect();
      const c = r.top + r.height / 2;
      const d = Math.abs(c - innerHeight / 2);
      if (d < bestD) { bestD = d; best = c; }
    }
    if (best === null || bestD > innerHeight * 1.2) return null;
    return -((best - innerHeight / 2) / innerHeight) * 2 * halfH;
  }

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let speed = 0.05, lastScroll = scrollY, scrub = 0;
  function pickAt(cx, cy) {
    if (!strip || !strip.visible) return -1;
    ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(strip)[0];
    if (!hit || !hit.uv) return -1;
    const f = ((hit.uv.x + tex.offset.x) % 1 + 1) % 1;
    return Math.min(WORK.length - 1, Math.floor(f * WORK.length));
  }
  addEventListener('click', e => {
    if (e.target.closest('a, button, input, select, textarea, label, .brief, .strip')) return;
    const i = pickAt(e.clientX, e.clientY);
    if (i >= 0) openLink(WORK[i].link);
  });

  addEventListener('resize', () => {
    for (const r of [rBack, rFront]) r.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    build();
  });

  const clock = new THREE.Clock();
  const loop = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const y = anchorY();
    strip.visible = y !== null;
    if (strip.visible) {
      strip.position.y = y;
      strip.rotation.x = mouse.ny * 0.08 + Math.sin(t * 0.3) * 0.03;
      strip.rotation.y = mouse.nx * 0.12;

      // scrolling scrubs the reel, hovering a frame pauses it
      const ds = scrollY - lastScroll; lastScroll = scrollY;
      scrub += (ds / innerHeight) * 0.5;
      scrub *= 0.9;
      const target = reel.hover >= 0 ? 0 : (reduceMotion ? 0.01 : 0.045);
      speed += (target - speed) * Math.min(1, dt * 4);
      tex.offset.x -= (speed * dt + scrub * 0.2);

      // hover
      reel.hover = finePointer ? pickAt(mouse.x, mouse.y) : -1;
      rBack.render(scene, camera);
      rFront.render(scene, camera);
    } else {
      reel.hover = -1;
      rBack.clear(); rFront.clear();
    }
    // cursor label follows the reel
    if (reel.hover >= 0) { cursorLabel.textContent = 'Watch'; cursor.classList.add('on', 'reel'); }
    else if (cursor.classList.contains('reel')) { cursor.classList.remove('on', 'reel'); }
    reelTip.textContent = reel.hover >= 0 ? WORK[reel.hover].title + (WORK[reel.hover].sample ? ' · sample' : '') : '';
    reelTip.classList.toggle('on', reel.hover >= 0);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- Per-frame DOM work ---------- */
const domTick = () => {
  cur.x += (mouse.x - cur.x) * 0.22; cur.y += (mouse.y - cur.y) * 0.22;
  cursor.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
  lens();
  // hero word squeezes as you scroll away, like trimming a clip
  const p = Math.min(1, scrollY / innerHeight);
  heroWord.style.transform = `translateY(${p * 12}vh) scaleY(${1 - p * 0.25})`;
  heroWord.style.transformOrigin = '50% 100%';

  // marquee
  const ds = scrollY - mqState.last; mqState.last = scrollY;
  if (ds !== 0) mqState.dir = ds > 0 ? 1 : -1;
  if (!reduceMotion) {
    mqState.x -= (0.6 + Math.min(12, Math.abs(ds) * 0.4)) * mqState.dir;
    const half = mq.scrollWidth / 2;
    if (half > 0) { if (mqState.x <= -half) mqState.x += half; if (mqState.x > 0) mqState.x -= half; }
    mq.style.transform = `translate3d(${mqState.x}px,0,0)`;
  }
  // badge turns with the page
  if (badgeSvg) badgeSvg.style.transform = `rotate(${(scrollY * 0.25 + performance.now() * (reduceMotion ? 0 : 0.008)) % 360}deg)`;
  // peek follows the cursor with a little lag and leans into the motion
  const nx = pk.x + (mouse.x - pk.x) * 0.16; pk.vx = nx - pk.x; pk.x = nx;
  pk.y += (mouse.y - pk.y) * 0.16;
  peek.style.transform = `translate(${pk.x + 28}px, ${pk.y - 80}px) rotate(${Math.max(-12, Math.min(12, pk.vx * 0.6))}deg)`;
  // reel tip sits beside the cursor
  reelTip.style.transform = `translate(${cur.x + 48}px, ${cur.y - 16}px)`;
  requestAnimationFrame(domTick);
};
requestAnimationFrame(domTick);
