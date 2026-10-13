"""Edit Soul logo set, v3: the playhead i.

The i in "editsoul" is a violet vertical line: the playhead of a video editor
and the text cursor of a code editor are the same shape. Studio gets the
playhead head (pointed), Systems gets the cursor block. One letter, both sides.

Run:  FONT_DIR=path/to/fonts python3 brand/generate.py
Needs geist-latin-wght-normal.woff2 and geist-mono-latin-500-normal.woff2
(from @fontsource-variable/geist and @fontsource/geist-mono), plus fonttools and brotli.
"""
import os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

F = os.environ.get('FONT_DIR', 'fonts/')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))

def load(name, axes=None):
    f = TTFont(os.path.join(F, name))
    if axes: f = instancer.instantiateVariableFont(f, axes)
    return f

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


BLACK, WHITE, VIOLET, LILAC = '#0B0A10', '#F7F6FB', '#5A2EFF', '#9C80FF'
light = load('geist-latin-wght-normal.woff2', {'wght': 430})
bold = load('geist-latin-wght-normal.woff2', {'wght': 680})
mono = load('geist-mono-latin-500-normal.woff2')

def stem_metrics(font, size):
    """Bounds of the dotless i, so the playhead line matches the letter exactly."""
    t = Text(font, 'ı', size)
    b = t.bounds(0, 0)
    return t, b

def head(kind, cx, top, w, color):
    """kind='play': video playhead (flat top, pointed bottom). kind='cursor': code cursor block."""
    if kind == 'play':
        h = w * 1.05
        return (f'<path fill="{color}" d="M{cx-w/2:.2f},{top-h:.2f} H{cx+w/2:.2f} V{top-h*0.42:.2f} '
                f'L{cx:.2f},{top:.2f} L{cx-w/2:.2f},{top-h*0.42:.2f} Z"/>')
    if kind == 'cursor':
        h = w * 0.62
        return f'<rect fill="{color}" x="{cx-w/2:.2f}" y="{top-h:.2f}" width="{w:.2f}" height="{h:.2f}" rx="{w*0.08:.2f}"/>'
    if kind == 'both':   # parent: playhead head with a cursor notch, half and half
        h = w * 1.05
        return (f'<path fill="{color}" d="M{cx-w/2:.2f},{top-h:.2f} H{cx+w/2:.2f} V{top-h*0.42:.2f} '
                f'L{cx:.2f},{top:.2f} L{cx-w/2:.2f},{top-h*0.42:.2f} Z"/>')
    return ''

def wordmark(kind, c_text, c_accent, size=200, label=None, c_label=None, extend=0.0):
    """'edit' light + 'soul' bold; the i is a violet line with a head."""
    tr = -0.035
    ed = Text(light, 'ed', size, tr)
    it, ib = stem_metrics(light, size)
    t_ = Text(light, 't', size, tr)
    so = Text(bold, 'soul', size, tr)
    x = 0; parts = []
    parts.append(f'<path fill="{c_text}" d="{ed.paths(x, 0)}"/>'); x += ed.width() + tr * size
    # the i: a clean rectangle the width of the real stem, from baseline (or below) to x-height
    sx0, sx1 = x + ib[0], x + ib[2]
    stem_w = sx1 - sx0; cx = (sx0 + sx1) / 2
    xh = ib[1]   # top of the dotless i (negative = above baseline)
    bottom = size * extend
    parts.append(f'<rect fill="{c_accent}" x="{sx0:.2f}" y="{xh:.2f}" width="{stem_w:.2f}" height="{-xh + bottom:.2f}"/>')
    gap = size * 0.07
    parts.append(head(kind, cx, xh - gap, stem_w * 2.3, c_accent))
    x += it.width() + tr * size
    parts.append(f'<path fill="{c_text}" d="{t_.paths(x, 0)}"/>'); x += t_.width() + size * 0.02
    parts.append(f'<path fill="{c_text}" d="{so.paths(x, 0)}"/>'); x += so.width()
    top = xh - gap - stem_w * 2.3 * 1.05
    asc = Text(light, 'd', size).bounds(0, 0)[1]
    box = [0, min(top, asc), x, bottom]
    if label:
        lt = Text(mono, label, size * 0.115, 0.3)
        lx = x - lt.width(); ly = size * 0.36
        parts.append(f'<path fill="{c_label or c_text}" d="{lt.paths(lx, ly)}"/>')
        box[3] = max(box[3], ly + 2)
    return ''.join(parts), box

def doc(body, box, pad, bg=None, scale=1):
    x0, y0, x1, y1 = box; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad
    w, h = x1 - x0, y1 - y0
    rect = f'<rect x="{x0:.1f}" y="{y0:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.1f} {y0:.1f} {w:.1f} {h:.1f}" width="{w*scale:.0f}" height="{h*scale:.0f}">'
            f'<title>Edit Soul</title>{rect}{body}</svg>\n')

def save(name, s):
    open(os.path.join(OUT, name), 'w').write(s)

def icon(kind, bg, c_accent, rounded=False):
    """App icon: the playhead-i alone, the brand symbol."""
    S = 1024
    stem_w = S * 0.1; head_w = stem_w * 2.3
    head_h = head_w * (1.05 if kind == 'play' else 0.62)
    gap = S * 0.035
    stem_h = S * 0.4
    total = head_h + gap + stem_h
    top = (S - total) / 2
    cx = S / 2
    body = (head(kind, cx, top + head_h, head_w, c_accent) +
            f'<rect fill="{c_accent}" x="{cx-stem_w/2:.1f}" y="{top+head_h+gap:.1f}" width="{stem_w:.1f}" height="{stem_h:.1f}"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}"><title>Edit Soul</title>'
            f'<rect width="{S}" height="{S}" rx="{S*0.22 if rounded else 0}" fill="{bg}"/>{body}</svg>\n')

def mark(kind, c_accent):
    """The symbol alone on transparent background."""
    return icon(kind, 'none', c_accent).replace('fill="none"', 'fill="none" fill-opacity="0"')

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    # Parent: "editsoul" with the playhead i + STUDIO · SYSTEMS
    for name, kind, label, ct, ca, cl, bg in [
        ('editsoul-logo.svg', 'play', 'STUDIO · SYSTEMS', BLACK, VIOLET, BLACK, None),
        ('editsoul-logo-white.svg', 'play', 'STUDIO · SYSTEMS', WHITE, LILAC, WHITE, None),
        ('editsoul-studio.svg', 'play', 'STUDIO', BLACK, VIOLET, BLACK, None),
        ('editsoul-studio-white.svg', 'play', 'STUDIO', WHITE, LILAC, WHITE, None),
        ('editsoul-systems.svg', 'cursor', 'SYSTEMS', BLACK, VIOLET, BLACK, None),
        ('editsoul-systems-white.svg', 'cursor', 'SYSTEMS', WHITE, LILAC, WHITE, None),
        ('editsoul-wordmark.svg', 'play', None, BLACK, VIOLET, None, None),
        ('editsoul-wordmark-white.svg', 'play', None, WHITE, LILAC, None, None),
    ]:
        body, box = wordmark(kind, ct, ca, label=label, c_label=cl)
        save(name, doc(body, box, 30, bg))
    save('editsoul-icon-black.svg', icon('play', BLACK, LILAC))
    save('editsoul-icon-violet.svg', icon('play', VIOLET, WHITE))
    save('editsoul-icon-white.svg', icon('play', WHITE, VIOLET))
    save('editsoul-systems-icon.svg', icon('cursor', BLACK, LILAC))
    save('editsoul-systems-icon-violet.svg', icon('cursor', VIOLET, WHITE))
    save('editsoul-mark.svg', mark('play', VIOLET))
    save('editsoul-systems-mark.svg', mark('cursor', VIOLET))
    save('favicon.svg', icon('play', VIOLET, WHITE, rounded=True))
    print('done')
