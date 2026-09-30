// Edit Soul Studio — scroll-driven walkthrough.
// Scrolling moves the camera along one path through seven rooms.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* ================= EDIT THESE ================= */
const WHATSAPP = '91XXXXXXXXXX'; // country code + number, no + or spaces
const INSTAGRAM = 'https://www.instagram.com/editsoulstudio.in/';
// Portfolio frames in The Archive. Put each video's Instagram/YouTube URL in `link`.
const WORK = [
  { title: 'Baahubali masking edit', kind: 'Edit · 300K+ views', link: INSTAGRAM },
  { title: 'Café brand reel', kind: 'Instant reel · sample', link: INSTAGRAM },
  { title: 'Short film grade', kind: 'Color · sample', link: INSTAGRAM },
  { title: 'AI product film', kind: 'AI video · sample', link: INSTAGRAM },
  { title: 'Faceless explainer', kind: 'Animated · sample', link: INSTAGRAM },
  { title: 'Product shoot', kind: 'Photography · sample', link: INSTAGRAM },
];
/* ============================================== */

const CHAPTERS = [
  { name: 'Arrival', t: 0 },
  { name: 'The Cut', t: 0.19, side: 1 },
  { name: 'The Machine', t: 0.34, side: -1 },
  { name: 'The Field', t: 0.49, side: 1 },
  { name: 'The Screen', t: 0.63, side: -1 },
  { name: 'The Archive', t: 0.77, side: 0 },
  { name: 'The Two', t: 0.89, side: 1 },
  { name: 'Contact', t: 1 },
];
const LEAD = 0.05;       // camera sits this far (in path t) before each room
const CAM_END = 0.965;   // camera stops just before the portal

const VIOLET = new THREE.Color('#6A3DF0');
const LILAC = new THREE.Color('#B9A3FF');
const BONE = new THREE.Color('#F4F1FB');
const INK = new THREE.Color('#15111E');
const PAPER = 0xF1EEF7;

const isTouch = matchMedia('(hover: none)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 760;

/* ---------- DOM wiring (works even without WebGL) ---------- */
const panels = [...document.querySelectorAll('.panel')];
const chapterList = document.getElementById('chapterList');
const romans = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
CHAPTERS.forEach((c, i) => {
  const li = document.createElement('li');
  li.innerHTML = `<button type="button" data-go="${i}"><span class="t">${romans[i]} · ${c.name}</span><span class="d"></span></button>`;
  chapterList.appendChild(li);
});
const navButtons = [...chapterList.querySelectorAll('button')];

document.getElementById('igLink').href = INSTAGRAM;
document.getElementById('waText').textContent = WHATSAPP.includes('X') ? 'WhatsApp +91 XXXXX XXXXX' : 'WhatsApp +' + WHATSAPP;

const workList = document.getElementById('workList');
WORK.forEach(w => {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = w.link; a.target = '_blank'; a.rel = 'noopener'; a.textContent = w.title;
  li.appendChild(a); workList.appendChild(li);
});

function openLink(url) {
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
}

document.getElementById('brief').addEventListener('submit', e => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  const err = document.getElementById('formErr');
  if (!v('f-name') || !v('f-msg')) { err.hidden = false; return; }
  err.hidden = true;
  const text = `Hi Edit Soul Studio, I'm ${v('f-name')}.\nI need: ${v('f-svc')}\n\n${v('f-msg')}`;
  openLink('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text));
});

// scroll position <-> chapter
const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
const focusOf = i => i === 0 ? 0 : i === CHAPTERS.length - 1 ? CAM_END : CHAPTERS[i].t - LEAD;
function goTo(i) {
  const camT = focusOf(i);
  window.scrollTo({ top: (camT / CAM_END) * maxScroll(), behavior: reduceMotion ? 'auto' : 'smooth' });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]');
  if (!b) return;
  e.preventDefault();
  goTo(+b.dataset.go);
});

// custom cursor
const cursor = document.getElementById('cursor');
const tip = document.getElementById('frameTip');
const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, cx: innerWidth / 2, cy: innerHeight / 2, speed: 0 };
addEventListener('pointermove', e => {
  mouse.speed = Math.min(1, mouse.speed + Math.hypot(e.movementX || 0, e.movementY || 0) / 300);
  mouse.x = e.clientX; mouse.y = e.clientY;
  mouse.nx = (e.clientX / innerWidth) * 2 - 1;
  mouse.ny = -(e.clientY / innerHeight) * 2 + 1;
});
document.addEventListener('pointerover', e => {
  if (e.target.closest('a, button, input, select, textarea')) cursor.classList.add('big');
});
document.addEventListener('pointerout', e => {
  if (e.target.closest('a, button, input, select, textarea')) cursor.classList.remove('big');
});

/* ---------- WebGL ---------- */
const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' });
} catch (err) {
  document.documentElement.classList.add('no-webgl');
  finishLoader();
  throw err;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(PAPER, 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(PAPER);
scene.fog = new THREE.FogExp2(PAPER, 0.03);
const camera = new THREE.PerspectiveCamera(small ? 70 : 58, innerWidth / innerHeight, 0.1, 400);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.22, 0.4, 0.9);
composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ---------- The path ---------- */
const pathPts = [];
for (let i = 0; i <= 12; i++) {
  const z = 16 - i * 15;
  const x = i === 0 ? 0 : Math.sin(i * 0.95) * 6;
  const y = Math.sin(i * 0.7) * 1.4;
  pathPts.push(new THREE.Vector3(x, y, z));
}
const path = new THREE.CatmullRomCurve3(pathPts, false, 'catmullrom', 0.5);
const UP = new THREE.Vector3(0, 1, 0);
function beside(t, side, dist) {
  const p = path.getPointAt(t);
  const tan = path.getTangentAt(t);
  const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
  return p.addScaledVector(right, side * dist);
}

/* ---------- Shared GLSL ---------- */
const NOISE = /* glsl */`
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
}`;

const rooms = []; // { update(time, dt, camT) }
const clickables = []; // meshes with userData.link

/* ---------- Stars / dust ---------- */
{
  const N = small ? 2600 : 5200;
  const pos = new Float32Array(N * 3), seed = new Float32Array(N), col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = Math.random();
    const p = path.getPointAt(t);
    const r = 6 + Math.pow(Math.random(), 0.6) * 60;
    const a = Math.random() * Math.PI * 2;
    pos.set([p.x + Math.cos(a) * r, p.y + Math.sin(a) * r * 0.7, p.z + (Math.random() - 0.5) * 20], i * 3);
    seed[i] = Math.random();
    const c = Math.random() < 0.35 ? VIOLET : INK;
    col.set([c.r, c.g, c.b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexColors: true,
    uniforms: { uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() } },
    vertexShader: /* glsl */`
      attribute float aSeed; uniform float uTime; uniform float uPR; varying vec3 vColor; varying float vTw;
      void main(){ vColor=color; vec4 mv=modelViewMatrix*vec4(position,1.0);
        vTw=0.55+0.45*sin(uTime*(0.6+aSeed*2.0)+aSeed*40.0);
        gl_PointSize=(0.5+aSeed*1.4)*uPR*(55.0/-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor; varying float vTw;
      void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.0,d); gl_FragColor=vec4(vColor, a*vTw*0.55); }`,
  });
  const stars = new THREE.Points(g, m);
  scene.add(stars);
  rooms.push({ update: (time) => { m.uniforms.uTime.value = time; } });
}

/* ---------- 0 · The Soul (arrival) ---------- */
{
  const at = path.getPointAt(0.085);
  const geo = new THREE.IcosahedronGeometry(3.2, small ? 48 : 96);
  const mat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.DoubleSide, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uAmp: { value: 0.45 }, uViolet: { value: VIOLET }, uLilac: { value: LILAC }, uInk: { value: INK } },
    vertexShader: NOISE + /* glsl */`
      uniform float uTime; uniform float uAmp; varying vec3 vN; varying vec3 vView; varying float vD;
      void main(){ float n=snoise(position*0.42+vec3(0.0,uTime*0.18,uTime*0.12));
        float n2=snoise(position*1.3-uTime*0.25)*0.25;
        vD=n; vec3 p=position+normal*(n+n2)*uAmp;
        vec4 mv=modelViewMatrix*vec4(p,1.0); vN=normalize(normalMatrix*normal); vView=-mv.xyz; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: /* glsl */`
      uniform vec3 uViolet; uniform vec3 uLilac; uniform vec3 uInk; varying vec3 vN; varying vec3 vView; varying float vD;
      void main(){ float f=pow(1.0-abs(dot(normalize(vN),normalize(vView))),2.0);
        vec3 c=mix(uLilac, uViolet, smoothstep(-0.3,0.9,vD)*0.8+f*0.4);
        float bands=smoothstep(0.93,1.0,sin(vD*26.0));
        c=mix(c, uInk, bands*0.85);
        gl_FragColor=vec4(c, 0.10+f*0.55+bands*0.7); }`,
  });
  const soul = new THREE.Mesh(geo, mat);
  soul.position.copy(at);
  scene.add(soul);

  // a thin orbit of text-like particles
  const ringG = new THREE.RingGeometry(4.6, 4.62, 256);
  const ringM = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringG, ringM); ring.position.copy(at); ring.rotation.x = 1.2; scene.add(ring);
  const ring2 = ring.clone(); ring2.scale.setScalar(1.25); ring2.rotation.set(0.4, 0.9, 0); ring2.material = ringM.clone(); ring2.material.color = VIOLET.clone(); ring2.material.opacity = 0.8; scene.add(ring2);

  rooms.push({ update: (time, dt) => {
    mat.uniforms.uTime.value = time;
    mat.uniforms.uAmp.value = 0.45 + mouse.speed * 0.9;
    soul.rotation.y += dt * 0.05;
    ring.rotation.z += dt * 0.08; ring2.rotation.z -= dt * 0.05;
  } });
}

/* ---------- I · The Cut: a helix of frames ---------- */
{
  const c = CHAPTERS[1];
  const g = new THREE.Group(); g.position.copy(beside(c.t, c.side, 4.2)); scene.add(g);
  const plane = new THREE.PlaneGeometry(1.3, 0.73);
  const edges = new THREE.EdgesGeometry(plane);
  const lineM = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.8 });
  const N = 26;
  const frames = [];
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 4;
    const f = new THREE.Group();
    f.position.set(Math.cos(a) * 2.4, (i / N - 0.5) * 5.2, Math.sin(a) * 2.4);
    f.lookAt(0, f.position.y, 0);
    f.add(new THREE.LineSegments(edges, lineM));
    if (i % 9 === 4) {
      const fill = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
      f.add(fill);
    }
    g.add(f); frames.push(f);
  }
  // the blade: one bright line cutting through
  const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 7), new THREE.MeshBasicMaterial({ color: VIOLET, side: THREE.DoubleSide }));
  g.add(blade);
  rooms.push({ update: (time, dt) => {
    g.rotation.y += dt * 0.18;
    blade.rotation.z = Math.sin(time * 0.4) * 0.5;
    frames.forEach((f, i) => { f.position.y = ((i / N - 0.5) * 5.2) + Math.sin(time * 0.6 + i) * 0.06; });
  } });
}

/* ---------- II · The Machine: noise that assembles into form ---------- */
{
  const c = CHAPTERS[2];
  const center = beside(c.t, c.side, 4.4);
  const N = small ? 7000 : 14000;
  const knot = new THREE.TorusKnotGeometry(1.7, 0.55, 400, 40, 2, 3);
  const kp = knot.attributes.position;
  const pos = new Float32Array(N * 3), target = new Float32Array(N * 3), rnd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const k = Math.floor(Math.random() * kp.count);
    target.set([kp.getX(k), kp.getY(k), kp.getZ(k)], i * 3);
    const r = 3 + Math.random() * 6, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3);
    rnd[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
  g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uMix: { value: 0 }, uPR: { value: renderer.getPixelRatio() }, uViolet: { value: VIOLET }, uBone: { value: INK } },
    vertexShader: NOISE + /* glsl */`
      attribute vec3 aTarget; attribute float aRnd; uniform float uTime; uniform float uMix; uniform float uPR; varying float vR; varying float vM;
      void main(){ float d=clamp(uMix*1.6-aRnd*0.6,0.0,1.0); d=d*d*(3.0-2.0*d); vM=d; vR=aRnd;
        vec3 drift=vec3(snoise(position*0.3+uTime*0.2),snoise(position*0.3+7.0+uTime*0.2),snoise(position*0.3+13.0+uTime*0.2));
        vec3 p=mix(position+drift*1.2, aTarget+drift*0.05, d);
        vec4 mv=modelViewMatrix*vec4(p,1.0); gl_PointSize=(1.0+aRnd*1.6)*uPR*(28.0/-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: /* glsl */`
      uniform vec3 uViolet; uniform vec3 uBone; varying float vR; varying float vM;
      void main(){ float a=smoothstep(0.5,0.0,length(gl_PointCoord-0.5));
        vec3 c=mix(uViolet, uBone, step(0.7,vR)*(0.4+vM*0.6)); gl_FragColor=vec4(c, a*(0.35+vM*0.55)); }`,
  });
  const pts = new THREE.Points(g, m); pts.position.copy(center); scene.add(pts);
  rooms.push({ update: (time, dt, camT) => {
    m.uniforms.uTime.value = time;
    const near = 1 - THREE.MathUtils.smoothstep(Math.abs(camT - (c.t - LEAD)), 0.0, 0.07);
    m.uniforms.uMix.value += ((near) - m.uniforms.uMix.value) * Math.min(1, dt * 1.6);
    pts.rotation.y += dt * 0.12; pts.rotation.x = Math.sin(time * 0.2) * 0.2;
  } });
}

/* ---------- III · The Field: a circle of vertical monoliths ---------- */
{
  const c = CHAPTERS[3];
  const g = new THREE.Group(); g.position.copy(beside(c.t, c.side, 4.8)); g.position.y -= 0.6; scene.add(g);
  const box = new THREE.BoxGeometry(1.08, 1.92, 0.06); // 9:16
  const edges = new THREE.EdgesGeometry(box);
  const blackM = new THREE.MeshBasicMaterial({ color: 0xFBFAFD });
  const lineM = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.85 });
  const glowM = new THREE.MeshBasicMaterial({ color: VIOLET });
  const N = 9;
  const stones = [];
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2;
    const s = new THREE.Group();
    s.position.set(Math.cos(a) * 3, 0, Math.sin(a) * 3);
    s.lookAt(0, 0, 0);
    s.add(new THREE.Mesh(box, i === 2 ? glowM : blackM));
    s.add(new THREE.LineSegments(edges, lineM));
    g.add(s); stones.push(s);
  }
  const ground = new THREE.Mesh(new THREE.RingGeometry(3.9, 3.92, 200), new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.0; g.add(ground);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 32), new THREE.MeshBasicMaterial({ color: INK }));
  g.add(sun);
  rooms.push({ update: (time, dt) => {
    g.rotation.y += dt * 0.1;
    stones.forEach((s, i) => { s.position.y = Math.sin(time * 0.7 + i * 0.7) * 0.18; });
    sun.position.y = 1.9 + Math.sin(time * 0.5) * 0.3;
  } });
}

/* ---------- IV · The Screen: projector light on a 2.39:1 screen ---------- */
{
  const c = CHAPTERS[4];
  const at = beside(c.t, c.side, 5.2);
  const g = new THREE.Group(); g.position.copy(at); scene.add(g);
  const camSpot = path.getPointAt(c.t - LEAD);
  g.lookAt(camSpot.x, at.y, camSpot.z);
  const W = 8.4, H = W / 2.39;
  const screenM = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uViolet: { value: VIOLET }, uBone: { value: BONE } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: NOISE + /* glsl */`
      uniform float uTime; uniform vec3 uViolet; uniform vec3 uBone; varying vec2 vUv;
      void main(){ vec2 p=vUv*vec2(2.39,1.0);
        float n=snoise(vec3(p*1.4, uTime*0.12)); float n2=snoise(vec3(p*3.5+n, uTime*0.2));
        float light=smoothstep(-0.2,0.9,n*0.6+n2*0.4);
        vec3 c=mix(vec3(0.02,0.015,0.04), uViolet*0.9, light); c=mix(c, uBone, smoothstep(0.78,1.0,light));
        float edge=smoothstep(0.0,0.02,vUv.x)*smoothstep(0.0,0.02,1.0-vUv.x)*smoothstep(0.0,0.04,vUv.y)*smoothstep(0.0,0.04,1.0-vUv.y);
        float scan=0.92+0.08*sin(vUv.y*700.0);
        gl_FragColor=vec4(c*edge*scan, 1.0); }`,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(W, H), screenM);
  g.add(screen);
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(W + 0.3, H + 0.3)), new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.7 }));
  g.add(frame);
  // beam: a cone of faint light from the projector toward the screen
  const beamM = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uColor: { value: VIOLET } },
    vertexShader: `varying float vY; void main(){ vY=position.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 uColor; varying float vY; void main(){ float a=smoothstep(7.0,-7.0,vY)*0.07; gl_FragColor=vec4(uColor,a); }`,
  });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(H * 0.75, 14, 4, 1, true), beamM);
  beam.rotation.x = -Math.PI / 2; beam.rotation.y = Math.PI / 4; beam.position.z = 7; beam.scale.x = 2.39 * 0.6;
  g.add(beam);
  rooms.push({ update: (time) => { screenM.uniforms.uTime.value = time; } });
}

/* ---------- V · The Archive: clickable frames around the path ---------- */
const archiveFrames = [];
function makeFrameTexture(w, i) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 640;
  const x = cv.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 512, 640);
  gr.addColorStop(0, i % 2 ? '#2A1560' : '#16092E'); gr.addColorStop(1, '#060509');
  x.fillStyle = gr; x.fillRect(0, 0, 512, 640);
  // an abstract "still": a violet sun and horizon
  const cx = 150 + (i * 97) % 220, cy = 210 + (i * 53) % 120;
  const rg = x.createRadialGradient(cx, cy, 0, cx, cy, 220);
  rg.addColorStop(0, 'rgba(200,182,255,.95)'); rg.addColorStop(.25, 'rgba(124,77,255,.55)'); rg.addColorStop(1, 'rgba(124,77,255,0)');
  x.fillStyle = rg; x.fillRect(0, 0, 512, 640);
  x.fillStyle = 'rgba(244,241,251,.9)'; x.fillRect(40, 440, 432, 1.5);
  x.fillStyle = '#F4F1FB';
  x.font = 'italic 400 44px "Bodoni Moda", Didot, serif';
  wrap(x, w.title, 40, 510, 432, 48);
  x.font = '400 17px "IBM Plex Mono", monospace';
  x.fillStyle = '#C8B6FF';
  x.fillText(w.kind.toUpperCase(), 40, 604);
  x.fillText(String(i + 1).padStart(2, '0'), 440, 70);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function wrap(x, text, px, py, maxW, lh) {
  const words = text.split(' '); let line = ''; let y = py;
  for (const wd of words) {
    const test = line ? line + ' ' + wd : wd;
    if (x.measureText(test).width > maxW && line) { x.fillText(line, px, y); line = wd; y += lh; } else line = test;
  }
  x.fillText(line, px, y);
}
{
  const c = CHAPTERS[5];
  const plane = new THREE.PlaneGeometry(1.6, 2);
  const edges = new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.7, 2.1));
  WORK.forEach((w, i) => {
    const t = c.t - 0.045 + i * 0.016;
    const side = i % 2 ? 1 : -1;
    const p = beside(t, side, 2.6 + (i % 3) * 0.5);
    p.y += Math.sin(i * 2.1) * 0.9 + 0.3;
    const g = new THREE.Group(); g.position.copy(p);
    const look = path.getPointAt(Math.max(0, t - 0.03));
    g.lookAt(look);
    const mat = new THREE.MeshBasicMaterial({ map: makeFrameTexture(w, i), transparent: true });
    const mesh = new THREE.Mesh(plane, mat);
    mesh.userData = { link: w.link, title: w.title };
    const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.35 }));
    g.add(mesh, outline); scene.add(g);
    clickables.push(mesh);
    archiveFrames.push({ g, mesh, outline, base: g.position.y, i, hover: 0 });
  });
  document.fonts?.ready.then(() => archiveFrames.forEach(f => {
    const old = f.mesh.material.map; f.mesh.material.map = makeFrameTexture(WORK[f.i], f.i); f.mesh.material.needsUpdate = true; old.dispose();
  }));
  rooms.push({ update: (time, dt) => {
    archiveFrames.forEach(f => {
      f.g.position.y = f.base + Math.sin(time * 0.6 + f.i) * 0.12;
      const s = 1 + f.hover * 0.08; f.g.scale.setScalar(s);
      f.outline.material.opacity = 0.35 + f.hover * 0.6;
    });
  } });
}

/* ---------- VI · The Two: a binary star ---------- */
function labelSprite(text) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128;
  const x = cv.getContext('2d');
  x.font = 'italic 400 64px "Bodoni Moda", Didot, serif'; x.fillStyle = '#15111E'; x.textAlign = 'center';
  x.fillText(text, 256, 80);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  s.scale.set(2.2, 0.55, 1);
  return s;
}
{
  const c = CHAPTERS[6];
  const g = new THREE.Group(); g.position.copy(beside(c.t, c.side, 4)); scene.add(g);
  const a = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 48), new THREE.MeshBasicMaterial({ color: INK }));
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 48), new THREE.MeshBasicMaterial({ color: VIOLET }));
  const orbit = new THREE.Mesh(new THREE.RingGeometry(1.79, 1.805, 200), new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  orbit.rotation.x = Math.PI / 2 - 0.35;
  const la = labelSprite('Kashyap'), lb = labelSprite('Yashu');
  g.add(a, b, orbit, la, lb);
  let sa, sb;
  document.fonts?.ready.then(() => {
    g.remove(la, lb); sa = labelSprite('Kashyap'); sb = labelSprite('Yashu'); g.add(sa, sb);
  });
  rooms.push({ update: (time) => {
    const ang = time * 0.35;
    const tilt = 0.35;
    a.position.set(Math.cos(ang) * 1.8, Math.sin(ang) * 1.8 * Math.sin(tilt), Math.sin(ang) * 1.8 * Math.cos(tilt));
    b.position.copy(a.position).multiplyScalar(-1);
    const A = sa || la, B = sb || lb;
    A.position.copy(a.position).add(new THREE.Vector3(0, 0.95, 0));
    B.position.copy(b.position).add(new THREE.Vector3(0, 0.95, 0));
  } });
}

/* ---------- VII · The Portal ---------- */
{
  const end = path.getPointAt(1);
  const prev = path.getPointAt(0.97);
  const g = new THREE.Group(); g.position.copy(end); g.lookAt(prev); scene.add(g);
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.022, 12, 300), new THREE.MeshBasicMaterial({ color: INK }));
  const r2 = new THREE.Mesh(new THREE.TorusGeometry(3.9, 0.06, 12, 300), new THREE.MeshBasicMaterial({ color: VIOLET }));
  g.add(r1, r2);
  // swirling particles inside the ring
  const N = small ? 1500 : 3000;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = Math.sqrt(Math.random()) * 3.3, a = Math.random() * Math.PI * 2;
    pos.set([Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * 0.6 - Math.random() * 6], i * 3);
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({ color: VIOLET, size: 0.03, transparent: true, opacity: 0.7, depthWrite: false });
  const swirl = new THREE.Points(pg, pm); g.add(swirl);
  rooms.push({ update: (time, dt) => {
    swirl.rotation.z += dt * 0.25; r2.rotation.z -= dt * 0.1;
    const s = 1 + Math.sin(time * 1.2) * 0.012; r1.scale.setScalar(s);
  } });
}

/* ---------- Interaction: hover + click on archive frames ---------- */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let hovered = null;
canvas.addEventListener('click', () => { if (hovered) openLink(hovered.userData.link); });
// panels layer sits above the canvas; clicks that land on empty panel space pass through
document.getElementById('panels').addEventListener('click', e => {
  if (e.target === e.currentTarget && hovered) openLink(hovered.userData.link);
});
addEventListener('click', e => {
  if (!hovered) return;
  if (e.target.closest('a, button, input, select, textarea, form, .panel.show')) return;
  if (e.target === canvas) return; // handled above
  openLink(hovered.userData.link);
});

/* ---------- Scroll → camera ---------- */
let targetP = 0, p = 0;
function readScroll() { const m = maxScroll(); targetP = m > 0 ? scrollY / m : 0; }
addEventListener('scroll', readScroll, { passive: true });
readScroll(); p = targetP;

const camPos = new THREE.Vector3(), look = new THREE.Vector3(), lookSmooth = new THREE.Vector3();
const railFill = document.getElementById('railFill');
const tmp = new THREE.Vector3();

function panelOpacity(i, camT) {
  if (i === CHAPTERS.length - 1) return THREE.MathUtils.smoothstep(camT, CAM_END - 0.035, CAM_END - 0.008);
  const f = focusOf(i);
  const d = camT - f;
  if (i === 0) return 1 - THREE.MathUtils.smoothstep(d, 0.02, 0.05);
  return 1 - THREE.MathUtils.smoothstep(Math.abs(d), 0.025, 0.05);
}

function onResize() {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  bloom.resolution.set(innerWidth / 2, innerHeight / 2);
}
addEventListener('resize', onResize);

const clock = new THREE.Clock();
let first = true;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  p += (targetP - p) * (reduceMotion ? 1 : Math.min(1, dt * 3.2));
  const camT = THREE.MathUtils.clamp(p * CAM_END, 0, CAM_END);

  path.getPointAt(camT, camPos);
  path.getPointAt(Math.min(camT + 0.035, 1), look);

  // lean toward the room you're passing
  let bestW = 0; const lean = new THREE.Vector3();
  CHAPTERS.forEach((c, i) => {
    if (!c.side) return;
    const w = 1 - THREE.MathUtils.smoothstep(Math.abs(camT - focusOf(i)), 0.0, 0.06);
    if (w > bestW) { bestW = w; lean.copy(beside(c.t, c.side, 4.4)); }
  });
  if (bestW > 0) look.lerp(lean, bestW * 0.32);

  // parallax from the pointer, drifting when idle on touch
  const mx = isTouch ? Math.sin(time * 0.3) * 0.3 : mouse.nx;
  const my = isTouch ? Math.cos(time * 0.25) * 0.2 : mouse.ny;
  camPos.x += mx * 0.55; camPos.y += my * 0.35 + Math.sin(time * 0.5) * 0.05;
  camera.position.copy(camPos);
  // smooth the viewing direction (not the target point), so the camera never looks back
  tmp.subVectors(look, camPos).normalize();
  if (first) { lookSmooth.copy(tmp); first = false; }
  lookSmooth.lerp(tmp, Math.min(1, dt * 5)).normalize();
  camera.lookAt(tmp.copy(camPos).add(lookSmooth));

  rooms.forEach(r => r.update(time, dt, camT));
  mouse.speed *= 0.94;

  // hover on archive frames
  if (!isTouch) {
    ndc.set(mouse.nx, mouse.ny);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(clickables)[0];
    const next = hit && hit.distance < 16 ? hit.object : null;
    if (next !== hovered) {
      hovered = next;
      cursor.classList.toggle('big', !!hovered);
      tip.classList.toggle('on', !!hovered);
      if (hovered) tip.textContent = 'Watch · ' + hovered.userData.title;
    }
    archiveFrames.forEach(f => { f.hover += ((f.mesh === hovered ? 1 : 0) - f.hover) * Math.min(1, dt * 8); });
  }

  // panels + chapter index
  let active = 0, best = 0;
  panels.forEach(el => {
    const i = +el.dataset.ch;
    const o = panelOpacity(i, camT);
    el.style.opacity = o.toFixed(3);
    el.classList.toggle('show', o > 0.05);
    const shift = (1 - o) * 24;
    if (!small && el.classList.contains('left')) el.style.translate = `${-shift}px 0`;
    else if (!small && el.classList.contains('right')) el.style.translate = `${shift}px 0`;
    else el.style.translate = `0 ${shift}px`;
    if (o > best) { best = o; active = i; }
  });
  navButtons.forEach((b, i) => b.classList.toggle('on', i === active));
  railFill.style.height = (p * 100).toFixed(2) + '%';

  // cursor follows with a little lag
  mouse.cx += (mouse.x - mouse.cx) * 0.2; mouse.cy += (mouse.y - mouse.cy) * 0.2;
  cursor.style.transform = `translate(${mouse.cx}px, ${mouse.cy}px)`;
  tip.style.transform = `translate(${mouse.cx + 46}px, ${mouse.cy - 6}px)`;

  composer.render();
  requestAnimationFrame(frame);
}

/* ---------- Loader ---------- */
function finishLoader() {
  const el = document.getElementById('loader');
  const count = document.getElementById('loaderCount');
  let n = 0;
  const step = () => {
    n = Math.min(100, n + 4 + Math.random() * 7);
    count.textContent = String(Math.floor(n)).padStart(3, '0');
    if (n < 100) setTimeout(step, 40); else setTimeout(() => el.classList.add('gone'), 250);
  };
  step();
}
finishLoader();
requestAnimationFrame(frame);
