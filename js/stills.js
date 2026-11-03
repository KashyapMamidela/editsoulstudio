// Abstract "stills" in the studio palette, used until real thumbnails are added.
export function paintStill(cv, i) {
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
    case 1: // vertical beams
      for (let k = 0; k < 9; k++) { const bx = W * (.1 + k * .1); const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, `rgba(${V},0)`); g.addColorStop(.5, `rgba(${V},${.25 + (k % 3) * .2})`); g.addColorStop(1, `rgba(${V},0)`);
        x.fillStyle = g; x.fillRect(bx, 0, 3 + (k % 4) * 6, H); }
      glow(W * .62, H * .5, W * .45, .7);
      break;
    case 2: // eclipse
      glow(W * .5, H * .45, W * .75);
      x.fillStyle = '#0B0A10'; x.beginPath(); x.arc(W * .52, H * .44, W * .2, 0, 7); x.fill();
      x.strokeStyle = `rgba(${L},.8)`; x.beginPath(); x.arc(W * .52, H * .44, W * .2, 0, 7); x.stroke();
      break;
    case 3: // dot grid (a screen)
      for (let gy = 0; gy < 34; gy++) for (let gx = 0; gx < 27; gx++) {
        const px = W * (gx + .5) / 27, py = H * (gy + .5) / 34; const d = Math.hypot(px - W * .5, py - H * .5) / (W * .5);
        const r = Math.max(0, 2.6 - d * 2.2); if (r <= 0) continue;
        x.fillStyle = d < .5 ? `rgba(${L},.9)` : `rgba(${V},.9)`; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); }
      break;
    case 4: // concentric rings (a map pin)
      glow(W * .5, H * .55, W * .6, .5);
      x.strokeStyle = `rgba(${L},.55)`;
      for (let k = 1; k < 16; k++) { x.beginPath(); x.ellipse(W * .5, H * .55, k * W / 30, k * W / 44, 0, 0, 7); x.stroke(); }
      break;
    default: // split horizon
      x.fillStyle = `rgb(${L})`; x.fillRect(0, H * .58, W, H * .42);
      glow(W * .7, H * .58, W * .5);
      x.fillStyle = '#0B0A10'; x.fillRect(W * .18, H * .38, W * .08, H * .2);
  }
  x.globalAlpha = 1;
  x.fillStyle = '#0B0A10'; x.fillRect(0, 0, W, H * .05); x.fillRect(0, H * .95, W, H * .05);
}
