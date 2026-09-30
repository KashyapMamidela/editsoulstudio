"""Edit Soul Studio logo set, v2: "the cut".
A ring (the soul) sliced by one edit. The halves slide apart and read as an S.
Run: FONT_DIR=path/to/woff2 python3 brand/generate.py
"""
import math, os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

F = os.environ.get('FONT_DIR', 'fonts/')
OUT = os.path.dirname(os.path.abspath(__file__))
BLACK, WHITE, VIOLET, LILAC = '#0B0A10', '#F7F6FB', '#5A2EFF', '#9C80FF'

def load(name, axes=None):
    f = TTFont(os.path.join(F, name))
    if axes: f = instancer.instantiateVariableFont(f, axes)
    return f
display = load('anybody-latin-standard-normal.woff2', {'wdth': 96, 'wght': 820})
mono = load('geist-mono-latin-500-normal.woff2')

class Text:
    """Lay out a string in one font; returns path data and metrics in px."""
    def __init__(self, font, s, size, tracking=0.0):
        self.font, self.s, self.size, self.tracking = font, s, size, tracking
        self.upm = font['head'].unitsPerEm
        self.cmap = font.getBestCmap(); self.gs = font.getGlyphSet(); self.hmtx = font['hmtx']
        self.k = size / self.upm
    def glyph(self, ch):
        g = self.cmap[ord(ch)]; return g, self.hmtx[g][0]
    def width(self):
        w = 0
        for ch in self.s:
            _, adv = self.glyph(ch); w += adv * self.k + self.tracking * self.size
        return w - self.tracking * self.size
    def paths(self, x, y):
        out = []; cx = x
        for ch in self.s:
            g, adv = self.glyph(ch)
            pen = SVGPathPen(self.gs)
            self.gs[g].draw(TransformPen(pen, (self.k, 0, 0, -self.k, cx, y)))
            d = pen.getCommands()
            if d: out.append(d)
            cx += adv * self.k + self.tracking * self.size
        return ' '.join(out)
    def bounds(self, x, y):
        b = BoundsPen(self.gs); cx = x
        for ch in self.s:
            g, adv = self.glyph(ch)
            self.gs[g].draw(TransformPen(b, (self.k, 0, 0, -self.k, cx, y)))
            cx += adv * self.k + self.tracking * self.size
        return b.bounds
    def cap(self):
        return self.font['OS/2'].sCapHeight * self.k


# ---------- The mark ----------
# Geometry in a 100-unit box: ring radius 36, stroke 14; halves offset +/-13 vertically, +/-2 horizontally.
R, SW, OFF, GAP = 36, 14, 13, 2
def half(side, color):
    sweep = 0 if side == 'L' else 1
    ro, ri = R + SW / 2, R - SW / 2
    dx, dy = (-GAP, -OFF) if side == 'L' else (GAP, OFF)
    return (f'<path fill="{color}" transform="translate({dx} {dy})" '
            f'd="M50,{50-ro} A{ro},{ro} 0 0,{sweep} 50,{50+ro} L50,{50+ri} A{ri},{ri} 0 0,{1-sweep} 50,{50-ri} Z"/>')
def blade(color):
    return f'<rect x="48.8" y="{50-R-SW/2-OFF-4}" width="2.4" height="{2*(R+SW/2+OFF)+8}" fill="{color}"/>'
def mark_group(c_ring, c_blade, tx=0, ty=0, s=1):
    return f'<g transform="translate({tx} {ty}) scale({s})">{half("L", c_ring)}{half("R", c_ring)}{blade(c_blade)}</g>'
MARK_BOX = (50 - R - SW/2 - GAP, 50 - R - SW/2 - OFF - 4, 50 + R + SW/2 + GAP, 50 + R + SW/2 + OFF + 4)  # tight bounds

def doc(w, h, body, bg=None, vb=None):
    vb = vb or f'0 0 {w} {h}'
    rect = f'<rect x="{vb.split()[0]}" y="{vb.split()[1]}" width="100%" height="100%" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w:.0f}" height="{h:.0f}">'
            f'<title>Edit Soul Studio</title>{rect}{body}</svg>\n')

def save(name, content):
    with open(os.path.join(OUT, name), 'w') as f: f.write(content)

def mark_file(c_ring, c_blade, bg=None, pad=10):
    x0, y0, x1, y1 = MARK_BOX
    x0 -= pad; y0 -= pad; x1 += pad; y1 += pad
    w, h = x1 - x0, y1 - y0
    body = mark_group(c_ring, c_blade)
    rect = f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {w} {h}" width="{w*4:.0f}" height="{h*4:.0f}">'
            f'<title>Edit Soul Studio</title>{rect}{body}</svg>\n')

def icon_file(bg, c_ring, c_blade, rounded=False):
    S = 1024; s = S / 128
    tx = S / 2 - 50 * s; ty = S / 2 - 50 * s
    return doc(S, S, f'<rect width="{S}" height="{S}" rx="{S*0.22 if rounded else 0}" fill="{bg}"/>' + mark_group(c_ring, c_blade, tx, ty, s))

# ---------- The wordmark: EDIT high, SOUL low, the cut between ----------
def wordmark_parts(c_text, c_blade, c_small, size=100, studio=True):
    edit = Text(display, 'EDIT', size, -0.005)
    soul = Text(display, 'SOUL', size, -0.005)
    drop = size * 0.2
    gap = size * 0.16
    ex = 0; ey = 0
    bx = edit.width() + gap
    sx = bx + gap; sy = drop
    cap = edit.cap()
    parts = f'<path fill="{c_text}" d="{edit.paths(ex, ey)}"/><path fill="{c_text}" d="{soul.paths(sx, sy)}"/>'
    btop = -cap - size * 0.12; bbot = sy + size * 0.12
    parts += f'<rect x="{bx - size*0.012:.2f}" y="{btop:.2f}" width="{size*0.024:.2f}" height="{bbot-btop:.2f}" fill="{c_blade}"/>'
    box = [0, btop, sx + soul.width(), bbot + (size * 0.1 if studio else 0)]
    if studio:
        st = Text(mono, 'STUDIO', size * 0.16, 0)
        # track STUDIO so it spans exactly the width of EDIT
        st.tracking = (edit.width() - st.width()) / (len(st.s) - 1) / st.size
        stx = ex; sty = sy + size * 0.1
        parts += f'<path fill="{c_small}" d="{st.paths(stx, sty)}"/>'
    return parts, box

def wordmark_file(c_text, c_blade, c_small, bg=None):
    parts, (x0, y0, x1, y1) = wordmark_parts(c_text, c_blade, c_small)
    p = 20; x0 -= p; y0 -= p; x1 += p; y1 += p
    return doc(x1 - x0, y1 - y0, parts, bg, f'{x0:.1f} {y0:.1f} {x1-x0:.1f} {y1-y0:.1f}')

def horizontal_file(c_ring, c_text, c_blade, c_small, bg=None):
    parts, (wx0, wy0, wx1, wy1) = wordmark_parts(c_text, c_blade, c_small)
    mh = (wy1 - wy0) * 1.02
    s = mh / (MARK_BOX[3] - MARK_BOX[1])
    mw = (MARK_BOX[2] - MARK_BOX[0]) * s
    mx = -mw - 46 - MARK_BOX[0] * s
    my = wy0 - MARK_BOX[1] * s
    body = mark_group(c_ring, c_blade, mx, my, s) + parts
    x0 = -mw - 46 - 20; y0 = wy0 - 20; x1 = wx1 + 20; y1 = wy1 + 20
    return doc(x1 - x0, y1 - y0, body, bg, f'{x0:.1f} {y0:.1f} {x1-x0:.1f} {y1-y0:.1f}')

def stacked_file(c_ring, c_text, c_blade, c_small, bg=None):
    parts, (wx0, wy0, wx1, wy1) = wordmark_parts(c_text, c_blade, c_small, studio=False)
    ww = wx1 - wx0
    s = ww * 0.36 / (MARK_BOX[2] - MARK_BOX[0])
    mh = (MARK_BOX[3] - MARK_BOX[1]) * s
    mx = ww / 2 - 50 * s; my = wy0 - 40 - mh - MARK_BOX[1] * s
    st = Text(mono, 'STUDIO  ·  NELLORE', 24, 0.24)
    stx = ww / 2 - st.width() / 2; sty = wy1 + 40
    body = mark_group(c_ring, c_blade, mx, my, s) + parts + f'<path fill="{c_small}" d="{st.paths(stx, sty)}"/>'
    x0 = -30; y0 = wy0 - 40 - mh - 30; x1 = ww + 30; y1 = sty + 30
    return doc(x1 - x0, y1 - y0, body, bg, f'{x0:.1f} {y0:.1f} {x1-x0:.1f} {y1-y0:.1f}')

# ---------- Seal: text around the mark ----------
def seal_file(c_text, c_ring, c_blade, bg=None):
    S = 400; C = S / 2; Rt = 158
    t = Text(mono, 'EDIT · SHOOT · GENERATE · EDIT SOUL STUDIO · NELLORE · ', 21)
    circ = 2 * math.pi * Rt
    gl = [t.glyph(ch) for ch in t.s]
    natural = sum(a for _, a in gl) * t.k
    extra = (circ - natural) / len(gl)
    pos = 0; out = []
    for ch, (g, adv) in zip(t.s, gl):
        w = adv * t.k; ang = (pos + w / 2) / circ * 360
        pen = SVGPathPen(t.gs); t.gs[g].draw(TransformPen(pen, (t.k, 0, 0, -t.k, -w / 2, 0)))
        d = pen.getCommands()
        if d: out.append(f'<path transform="translate({C} {C}) rotate({ang:.3f}) translate(0 {-Rt+8})" d="{d}"/>')
        pos += w + extra
    s = 2.0
    body = f'<g fill="{c_text}">{"".join(out)}</g><circle cx="{C}" cy="{C}" r="{Rt-26}" fill="none" stroke="{c_text}" stroke-width="1"/>' + mark_group(c_ring, c_blade, C - 50 * s, C - 50 * s, s)
    return doc(S, S, body, bg)

# ---------- Animated mark: the ring closes, the edit cuts it, the S appears ----------
def animated_file(c_ring, c_blade, bg=None):
    ro, ri = R + SW / 2, R - SW / 2
    def hp(sweep):
        return f'M50,{50-ro} A{ro},{ro} 0 0,{sweep} 50,{50+ro} L50,{50+ri} A{ri},{ri} 0 0,{1-sweep} 50,{50-ri} Z'
    kt = '0;0.25;0.45;0.6;0.9;1'
    L = f'<path fill="{c_ring}" d="{hp(0)}"><animateTransform attributeName="transform" type="translate" dur="4s" repeatCount="indefinite" keyTimes="{kt}" values="0 0;0 0;0 0;-{GAP} -{OFF};-{GAP} -{OFF};0 0" calcMode="spline" keySplines="0 0 1 1;0 0 1 1;.2 .8 .1 1;0 0 1 1;.6 0 .4 1"/></path>'
    Rr = f'<path fill="{c_ring}" d="{hp(1)}"><animateTransform attributeName="transform" type="translate" dur="4s" repeatCount="indefinite" keyTimes="{kt}" values="0 0;0 0;0 0;{GAP} {OFF};{GAP} {OFF};0 0" calcMode="spline" keySplines="0 0 1 1;0 0 1 1;.2 .8 .1 1;0 0 1 1;.6 0 .4 1"/></path>'
    top = 50 - R - SW / 2 - OFF - 4; H = 2 * (R + SW / 2 + OFF) + 8
    Bl = (f'<rect x="48.8" y="{top}" width="2.4" height="{H}" fill="{c_blade}">'
          f'<animate attributeName="height" dur="4s" repeatCount="indefinite" keyTimes="{kt}" values="0;0;{H};{H};{H};0" calcMode="spline" keySplines="0 0 1 1;.7 0 .3 1;0 0 1 1;0 0 1 1;.6 0 .4 1"/></rect>')
    x0, y0, x1, y1 = MARK_BOX
    p = 10
    vb = f'{x0-p} {y0-p} {x1-x0+2*p} {y1-y0+2*p}'
    rect = f'<rect x="{x0-p}" y="{y0-p}" width="{x1-x0+2*p}" height="{y1-y0+2*p}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{(x1-x0+2*p)*4:.0f}" height="{(y1-y0+2*p)*4:.0f}">'
            f'<title>Edit Soul Studio</title>{rect}{L}{Rr}{Bl}</svg>\n')

if __name__ == '__main__':
    for f in os.listdir(OUT):
        if f.endswith('.svg'): os.remove(os.path.join(OUT, f))
    save('editsoul-mark.svg', mark_file(BLACK, VIOLET))
    save('editsoul-mark-white.svg', mark_file(WHITE, LILAC))
    save('editsoul-mark-violet.svg', mark_file(VIOLET, BLACK))
    save('editsoul-mark-animated.svg', animated_file(BLACK, VIOLET))
    save('editsoul-mark-animated-white.svg', animated_file(WHITE, LILAC, BLACK))
    save('editsoul-wordmark.svg', wordmark_file(BLACK, VIOLET, BLACK))
    save('editsoul-wordmark-white.svg', wordmark_file(WHITE, LILAC, WHITE))
    save('editsoul-logo.svg', horizontal_file(BLACK, BLACK, VIOLET, BLACK))
    save('editsoul-logo-white.svg', horizontal_file(WHITE, WHITE, LILAC, WHITE))
    save('editsoul-logo-stacked.svg', stacked_file(BLACK, BLACK, VIOLET, BLACK))
    save('editsoul-logo-stacked-white.svg', stacked_file(WHITE, WHITE, LILAC, WHITE))
    save('editsoul-seal.svg', seal_file(BLACK, BLACK, VIOLET))
    save('editsoul-seal-white.svg', seal_file(WHITE, WHITE, LILAC))
    save('editsoul-icon-violet.svg', icon_file(VIOLET, WHITE, BLACK))
    save('editsoul-icon-black.svg', icon_file(BLACK, WHITE, VIOLET))
    save('editsoul-icon-white.svg', icon_file(WHITE, BLACK, VIOLET))
    save('favicon.svg', icon_file(VIOLET, WHITE, BLACK, rounded=True))
    print(sorted(f for f in os.listdir(OUT) if f.endswith('.svg')))
