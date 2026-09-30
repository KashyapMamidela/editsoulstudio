"""Generate the Edit Soul Studio logo set as outlined SVGs (no fonts needed to view them)."""
import math, os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

F = os.environ.get('FONT_DIR', 'fonts/')  # folder with the Anybody, Newsreader and Geist Mono .woff2 files
OUT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUT, exist_ok=True)

BLACK, WHITE, VIOLET, LILAC, PAPER = '#0B0A10', '#F7F6FB', '#5A2EFF', '#9C80FF', '#F7F6FB'

def load(name, axes=None):
    f = TTFont(F + name)
    if axes: f = instancer.instantiateVariableFont(f, axes)
    return f

anybody = load('anybody-latin-standard-normal.woff2', {'wdth': 70, 'wght': 800})
anybody_wide = load('anybody-latin-standard-normal.woff2', {'wdth': 150, 'wght': 850})
news = load('newsreader-latin-standard-italic.woff2', {'wght': 380, 'opsz': 72})
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

def union(*bs):
    bs = [b for b in bs if b]
    return (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))

def svg(parts, box, pad, bg=None, title='Edit Soul Studio'):
    x0, y0, x1, y1 = box
    x0 -= pad; y0 -= pad; x1 += pad; y1 += pad
    w, h = x1 - x0, y1 - y0
    body = ''.join(f'<path fill="{c}" d="{d}"/>' for d, c in parts)
    rect = f'<rect x="{x0:.1f}" y="{y0:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.1f} {y0:.1f} {w:.1f} {h:.1f}" width="{w:.0f}" height="{h:.0f}">'
            f'<title>{title}</title>{rect}{body}</svg>\n')

def save(name, content):
    with open(os.path.join(OUT, name), 'w') as f: f.write(content)

# ---------- 1. Horizontal wordmark: EDIT soul STUDIO ----------
def wordmark(c_edit, c_soul, c_studio, bg=None):
    edit = Text(anybody, 'EDIT', 100, -0.01)
    soul = Text(news, 'soul', 112)
    studio = Text(mono, 'STUDIO', 20, 0.16)
    base = 0
    ex = 0; sx = edit.width() + 14
    tx = sx + soul.width() + 16
    ty = base - edit.cap() + studio.cap()   # top-aligned with the caps
    parts = [(edit.paths(ex, base), c_edit), (soul.paths(sx, base), c_soul), (studio.paths(tx, ty), c_studio)]
    box = union(edit.bounds(ex, base), soul.bounds(sx, base), studio.bounds(tx, ty))
    return svg(parts, box, 24, bg)

save('editsoul-wordmark.svg', wordmark(BLACK, VIOLET, BLACK))
save('editsoul-wordmark-white.svg', wordmark(WHITE, LILAC, WHITE))
save('editsoul-wordmark-black.svg', wordmark(BLACK, BLACK, BLACK))
save('editsoul-wordmark-on-dark.svg', wordmark(WHITE, LILAC, WHITE, BLACK))

# ---------- 2. Stacked lockup: like the website hero ----------
def stacked(c_main, c_soul, c_small, bg=None):
    soul = Text(anybody_wide, 'SOUL', 200, -0.02)
    edit = Text(news, 'edit', 120)
    studio = Text(mono, 'STUDIO  ·  NELLORE', 22, 0.16)
    base = 0
    parts = [(soul.paths(0, base), c_main)]
    ex = 6; ey = base - soul.cap() - 18
    parts.append((edit.paths(ex, ey), c_soul))
    sw = soul.width()
    stx = sw - studio.width(); sty = base + 52
    parts.append((studio.paths(stx, sty), c_small))
    box = union(soul.bounds(0, base), edit.bounds(ex, ey), studio.bounds(stx, sty))
    return svg(parts, box, 32, bg)

save('editsoul-stacked.svg', stacked(BLACK, VIOLET, BLACK))
save('editsoul-stacked-white.svg', stacked(WHITE, LILAC, WHITE))

# ---------- 3. Circular badge (the rotating seal from the site) ----------
def asterisk(cx, cy, r, color, width):
    lines = []
    for k in range(4):
        a = math.pi / 4 * k
        dx, dy = math.cos(a) * r, math.sin(a) * r
        lines.append(f'<line x1="{cx-dx:.2f}" y1="{cy-dy:.2f}" x2="{cx+dx:.2f}" y2="{cy+dy:.2f}"/>')
    return f'<g stroke="{color}" stroke-width="{width}" stroke-linecap="round">{"".join(lines)}</g>'

def badge(c_text, c_core, c_star, bg=None):
    S = 400; C = S / 2; R = 150
    t = Text(mono, 'EDIT · SHOOT · GENERATE · EDIT SOUL STUDIO · ', 26)
    circ = 2 * math.pi * R
    glyphs = [t.glyph(ch) for ch in t.s]
    natural = sum(a for _, a in glyphs) * t.k
    extra = (circ - natural) / len(glyphs)
    pos = 0; paths = []
    for ch, (g, adv) in zip(t.s, glyphs):
        w = adv * t.k
        center = pos + w / 2
        ang = center / circ * 360
        pen = SVGPathPen(t.gs)
        t.gs[g].draw(TransformPen(pen, (t.k, 0, 0, -t.k, -w / 2, 0)))
        d = pen.getCommands()
        if d: paths.append(f'<path transform="translate({C} {C}) rotate({ang:.3f}) translate(0 {-R+9})" d="{d}"/>')
        pos += w + extra
    rect = f'<rect width="{S}" height="{S}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}"><title>Edit Soul Studio</title>{rect}'
            f'<g fill="{c_text}">{"".join(paths)}</g>'
            f'<circle cx="{C}" cy="{C}" r="78" fill="{c_core}"/>{asterisk(C, C, 30, c_star, 7)}</svg>\n')

save('editsoul-badge.svg', badge(BLACK, VIOLET, WHITE))
save('editsoul-badge-white.svg', badge(WHITE, VIOLET, WHITE))
save('editsoul-badge-black.svg', badge(BLACK, BLACK, WHITE))

# ---------- 4. Icon / profile picture: Es monogram ----------
def icon(bg, c_e, c_s, rounded=False, name='icon'):
    S = 1024
    e = Text(anybody, 'E', 560, 0)
    s = Text(news, 's', 600)
    total = e.width() + 10 + s.width()
    x = (S - total) / 2
    base = S / 2 + e.cap() / 2
    parts = [(e.paths(x, base), c_e), (s.paths(x + e.width() + 10, base), c_s)]
    body = ''.join(f'<path fill="{c}" d="{d}"/>' for d, c in parts)
    shape = f'<rect width="{S}" height="{S}" rx="{S*0.22 if rounded else 0}" fill="{bg}"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}"><title>Edit Soul Studio</title>{shape}{body}</svg>\n'

save('editsoul-icon-violet.svg', icon(VIOLET, WHITE, WHITE))
save('editsoul-icon-black.svg', icon(BLACK, WHITE, LILAC))
save('editsoul-icon-white.svg', icon(PAPER, BLACK, VIOLET))
save('favicon.svg', icon(VIOLET, WHITE, WHITE, rounded=True))
print(sorted(os.listdir(OUT)))
