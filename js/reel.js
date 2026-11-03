// The reel: a 3D film strip that weaves through the giant type, behind some letters and in front of others.
// Two canvases share one scene: the back one draws z <= 0, the front one z >= 0, with the HTML type between them.
// Its frames are the work. Scroll position moves the frames, hovering a frame pauses it, clicking opens it.
import * as THREE from 'three';
import { WORK } from './data.js';
import { paintStill } from './stills.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const glBack = document.getElementById('glBack');
const glFront = document.getElementById('glFront');
const tip = document.getElementById('reelTip');

let rBack, rFront;
try {
  rBack = new THREE.WebGLRenderer({ canvas: glBack, antialias: true, alpha: true });
  rFront = new THREE.WebGLRenderer({ canvas: glFront, antialias: true, alpha: true });
} catch (e) { rBack = rFront = null; }

if (rBack && rFront) {
  for (const r of [rBack, rFront]) {
    r.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 820 ? 1.5 : 2));
    r.setSize(innerWidth, innerHeight);
    r.setClearColor(0x000000, 0);
  }
  rBack.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)];
  rFront.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)];

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 12);
  const halfH = Math.tan(THREE.MathUtils.degToRad(15)) * 12;

  // Film atlas: one frame per work item, with sprocket holes and an edge label.
  const FW = 512, FH = 384, PIC_H = 288, PAD = 48;
  const atlas = document.createElement('canvas');
  atlas.width = FW * WORK.length; atlas.height = FH;
  const ax = atlas.getContext('2d');
  const tex = new THREE.CanvasTexture(atlas);
  tex.wrapS = THREE.RepeatWrapping; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  function drawFrame(i, img) {
    const x0 = i * FW;
    ax.fillStyle = '#0B0A10'; ax.fillRect(x0, 0, FW, FH);
    ax.fillStyle = '#F7F6FB';
    for (let k = 0; k < 8; k++) {
      const hx = x0 + 14 + k * 64;
      ax.beginPath(); ax.roundRect(hx, 12, 30, 22, 4); ax.fill();
      ax.beginPath(); ax.roundRect(hx, FH - 34, 30, 22, 4); ax.fill();
    }
    const px = x0 + 16, py = PAD, pw = FW - 32, ph = PIC_H;
    if (img) {
      const s = Math.max(pw / img.width, ph / img.height), w = img.width * s, h = img.height * s;
      ax.save(); ax.beginPath(); ax.rect(px, py, pw, ph); ax.clip();
      ax.drawImage(img, px + (pw - w) / 2, py + (ph - h) / 2, w, h); ax.restore();
    } else {
      const c = document.createElement('canvas'); c.width = pw; c.height = ph;
      paintStill(c, WORK[i].still ?? i); ax.drawImage(c, px, py);
    }
    ax.fillStyle = '#F7F6FB'; ax.font = '500 15px "Geist Mono", monospace';
    ax.fillText(String(i + 1).padStart(2, '0') + ' — ' + WORK[i].title.toUpperCase(), px + 12, py + ph - 14);
    tex.needsUpdate = true;
  }
  const base = new URL('../', import.meta.url).href;
  WORK.forEach((w, i) => {
    drawFrame(i);
    if (w.thumb) { const im = new Image(); im.onload = () => drawFrame(i, im); im.src = base + w.thumb; }
  });
  document.fonts?.ready.then(() => WORK.forEach((w, i) => { if (!w.thumb) drawFrame(i); }));

  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true });
  let strip = null;
  // Path in screen units (x: -1..1 of half width, y: -1..1 of half height), z alternates behind/in front.
  const PATH = [[-1.5, -0.35, -2.4], [-0.95, 0.22, 1.9], [-0.35, -0.12, -2.2], [0.2, 0.2, 2.0], [0.75, -0.18, -1.9], [1.5, 0.3, 2.2]];
  function build() {
    if (strip) { scene.remove(strip); strip.geometry.dispose(); }
    const halfW = halfH * (innerWidth / innerHeight);
    const mob = innerWidth < 820;
    const pts = PATH.map(([x, y, z]) => new THREE.Vector3(x * halfW, y * halfH * (mob ? 0.4 : 0.8), z * (mob ? 0.7 : 1)));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
    const len = curve.getLength();
    const stripH = halfH * (mob ? 0.18 : 0.3);
    const repeats = len / (stripH * FW / FH * WORK.length);
    const M = 600;
    const pos = new Float32Array((M + 1) * 6), uv = new Float32Array((M + 1) * 4), idx = [];
    const Z = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i <= M; i++) {
      const u = i / M, p = curve.getPointAt(u), T = curve.getTangentAt(u);
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
    scene.add(strip);
  }
  build();

  // Which giant word is closest to the middle of the screen?
  const anchors = [...document.querySelectorAll('[data-reel]')];
  function anchorY() {
    let best = null, bestD = Infinity;
    for (const el of anchors) {
      const r = el.getBoundingClientRect(), c = r.top + r.height / 2, d = Math.abs(c - innerHeight / 2);
      if (d < bestD) { bestD = d; best = c; }
    }
    if (best === null || bestD > innerHeight * 1.1) return null;
    return -((best - innerHeight / 2) / innerHeight) * 2 * halfH;
  }

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const mouse = { x: -1, y: -1, nx: 0, ny: 0 };
  addEventListener('pointermove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = e.clientX / innerWidth * 2 - 1; mouse.ny = -(e.clientY / innerHeight) * 2 + 1;
  }, { passive: true });
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
    if (e.target.closest('a, button, input, textarea, label, form, .nav')) return;
    const i = pickAt(e.clientX, e.clientY);
    if (i < 0) return;
    const a = document.createElement('a'); a.href = WORK[i].link; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  });

  addEventListener('resize', () => {
    for (const r of [rBack, rFront]) r.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    build();
  });

  // Drift when idle, scroll position scrubs, hover pauses.
  let drift = 0, speed = 0.04, hover = -1, last = performance.now(), tipX = 0, tipY = 0;
  const loop = now => {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const y = anchorY();
    strip.visible = y !== null;
    if (strip.visible) {
      strip.position.y = y;
      strip.rotation.x = mouse.ny * 0.06;
      strip.rotation.y = mouse.nx * 0.1;
      hover = finePointer ? pickAt(mouse.x, mouse.y) : -1;
      const target = hover >= 0 || reduceMotion ? 0 : 0.04;
      speed += (target - speed) * Math.min(1, dt * 4);
      drift += speed * dt;
      tex.offset.x = -(drift + (reduceMotion ? 0 : scrollY / innerHeight * 0.22));
      rBack.render(scene, camera);
      rFront.render(scene, camera);
    } else {
      hover = -1;
      rBack.clear(); rFront.clear();
    }
    if (tip) {
      tip.classList.toggle('on', hover >= 0);
      if (hover >= 0) {
        tip.textContent = WORK[hover].title + (WORK[hover].sample ? ' · sample' : ' · watch');
        tipX += (mouse.x + 22 - tipX) * 0.25; tipY += (mouse.y - 14 - tipY) * 0.25;
        tip.style.transform = `translate(${tipX}px, ${tipY}px)`;
      }
      document.body.style.cursor = hover >= 0 ? 'pointer' : '';
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
