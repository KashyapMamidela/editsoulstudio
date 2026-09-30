// Edit Soul Studio
// One chrome "soul" lives between the giant type (behind) and the content (in front).
// It moves to a new place for every section as you scroll.
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

/* ---------- The soul: chrome blob ---------- */
const canvas = document.getElementById('gl');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { renderer = null; }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 12);

  // A studio built only from white, black and violet light — chrome reflects nothing else.
  function studioEnv() {
    const s = new THREE.Scene();
    const box = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0xE9E6F3, side: THREE.BackSide }));
    s.add(box);
    const panel = (w, h, color, intensity, pos, rot) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
      m.position.set(...pos); m.rotation.set(...rot); s.add(m);
    };
    panel(30, 30, 0x0B0A10, 1, [0, -12, 0], [-Math.PI / 2, 0, 0]);           // black floor
    panel(22, 6, 0xFFFFFF, 3.2, [0, 13, 0], [Math.PI / 2, 0, 0]);            // soft box above
    panel(8, 26, 0x5A2EFF, 2.4, [-13, 0, 2], [0, Math.PI / 2, 0]);           // violet wall left
    panel(3, 26, 0x0B0A10, 1, [13, 0, -4], [0, -Math.PI / 2, 0]);            // black strips right
    panel(2, 26, 0x0B0A10, 1, [13, 0, 4], [0, -Math.PI / 2, 0]);
    panel(6, 20, 0xFFFFFF, 2.2, [13, 0, 0], [0, -Math.PI / 2, 0]);           // white strip right
    panel(14, 4, 0x8A66FF, 1.6, [0, 4, -13], [0, 0, 0]);                     // violet band behind
    panel(30, 10, 0x0B0A10, 1, [0, -6, 13], [0, Math.PI, 0]);                // dark band in front
    const pmrem = new THREE.PMREMGenerator(renderer);
    const tex = pmrem.fromScene(s, 0.035).texture;
    pmrem.dispose();
    return tex;
  }
  const env = studioEnv();

  const NOISE = `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_); vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw); vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
  uniform float uTime; uniform float uAmp; uniform float uTwist;
  vec3 warp(vec3 p){
    // twist around Y, then a slow liquid swell
    float a = p.y * uTwist;
    p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
    float n = snoise(p * 0.75 + vec3(0.0, uTime * 0.2, uTime * 0.14));
    float n2 = snoise(p * 1.9 - uTime * 0.25) * 0.12;
    return p + normalize(p) * (n + n2) * uAmp;
  }`;

  const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.32 }, uTwist: { value: 0.6 } };
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 1, roughness: 0.07, envMap: env, envMapIntensity: 1.15,
    clearcoat: 1, clearcoatRoughness: 0.06, iridescence: 0.55, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 420],
  });
  mat.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + NOISE)
      .replace('#include <beginnormal_vertex>', `
        vec3 sp = normalize(position);
        vec3 tA = normalize(cross(sp, abs(sp.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0)));
        vec3 tB = normalize(cross(sp, tA));
        float eps = 0.012;
        vec3 wp = warp(position);
        vec3 w1 = warp(normalize(position + tA * eps) * length(position));
        vec3 w2 = warp(normalize(position + tB * eps) * length(position));
        vec3 objectNormal = normalize(cross(w1 - wp, w2 - wp));
        if (dot(objectNormal, wp) < 0.0) objectNormal = -objectNormal;
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3(tangent.xyz);
        #endif`)
      .replace('#include <begin_vertex>', 'vec3 transformed = wp;');
  };
  const detail = innerWidth < 820 ? 64 : 120;
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1, detail), mat);
  scene.add(blob);

  // Keyframes from each section's data-blob="x,y,scale,energy" (x,y in screen halves: -1..1)
  const sections = [...document.querySelectorAll('[data-blob]')];
  const keysDesk = sections.map(s => s.dataset.blob.split(',').map(Number));
  // phones: the sculpture becomes a small companion in the top-right corner unless a section says otherwise
  const keysMob = sections.map((s, i) => s.dataset.blobM ? s.dataset.blobM.split(',').map(Number) : [0.62, 0.66, 0.3, keysDesk[i][3]]);
  let keys = innerWidth < 820 ? keysMob : keysDesk;
  addEventListener('resize', () => { keys = innerWidth < 820 ? keysMob : keysDesk; });
  const state = { x: keys[0][0], y: keys[0][1], s: keys[0][2], e: keys[0][3] };

  function targetKey() {
    const mid = scrollY + innerHeight * 0.5;
    let i = 0;
    for (let k = 0; k < sections.length; k++) if (sections[k].offsetTop <= mid) i = k;
    const sec = sections[i], next = keys[i + 1] || keys[i];
    const t = THREE.MathUtils.clamp((mid - sec.offsetTop) / sec.offsetHeight, 0, 1);
    const f = THREE.MathUtils.smoothstep(t, 0.6, 1.0);
    const a = keys[i];
    return a.map((v, j) => v + (next[j] - v) * f);
  }

  function resize() {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  addEventListener('resize', resize);

  const clock = new THREE.Clock();
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  let spin = 0;
  const tick = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;
    const k = targetKey();
    const ease = reduceMotion ? 1 : Math.min(1, dt * 2.6);
    state.x += (k[0] - state.x) * ease; state.y += (k[1] - state.y) * ease;
    state.s += (k[2] - state.s) * ease; state.e += (k[3] - state.e) * ease;

    const aspect = innerWidth / innerHeight;
    const halfW = halfH * aspect;
    const mob = innerWidth < 820;
    // phones: keep the sculpture in the top half, smaller, nearer the center
    const x = state.x, y = state.y;
    const radius = state.s * halfH * 0.5 * (mob ? Math.min(1, aspect * 1.6) : Math.min(1, aspect / 1.2 + 0.25));

    blob.position.set(x * halfW + mouse.nx * 0.25, y * halfH + mouse.ny * 0.2 + Math.sin(time * 0.6) * 0.06, 0);
    blob.scale.setScalar(Math.max(radius, 0.001));
    spin += dt * (0.12 + mouse.speed * 0.8);
    blob.rotation.set(Math.sin(time * 0.3) * 0.25 + mouse.ny * 0.3, spin + mouse.nx * 0.4, 0);

    uniforms.uTime.value = time * (reduceMotion ? 0.2 : 1);
    uniforms.uAmp.value = 0.16 + state.e * 0.16 + mouse.speed * 0.22;
    uniforms.uTwist.value = 0.35 + state.e * 0.45 + Math.sin(time * 0.4) * 0.15;
    mouse.speed *= 0.95;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
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
  requestAnimationFrame(domTick);
};
requestAnimationFrame(domTick);
