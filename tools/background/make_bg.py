"""Generate a high-resolution space background for the RotE overview map.

Same composition as the old 750x500 map_rote_lines.jpeg (dark top, blue nebula band,
bright clouds lower down, spiral galaxy bottom-centre, coloured connection lines),
but rendered at SCALE x resolution so it stays sharp on large screens.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter, map_coordinates

import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lines import LINES, DOTTED

SCALE = 4
W, H = 750 * SCALE, 500 * SCALE
rng = np.random.default_rng(7)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
u, v = xx / W, yy / H  # 0..1


def fbm(octaves=6, base=3.0, persistence=0.55, seed=0):
    """Fractal noise in [0,1] built from blurred random fields."""
    r = np.random.default_rng(seed)
    out = np.zeros((H, W), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        cells = int(base * (2 ** o))
        small = r.random((max(2, cells * H // W + 2), cells + 2)).astype(np.float32)
        small = gaussian_filter(small, 0.8)
        cy = np.linspace(0, small.shape[0] - 1.001, H)
        cx = np.linspace(0, small.shape[1] - 1.001, W)
        gy, gx = np.meshgrid(cy, cx, indexing='ij')
        layer = map_coordinates(small, [gy, gx], order=3, mode='reflect')
        out += amp * layer
        total += amp
        amp *= persistence
    out /= total
    out = (out - out.min()) / (out.max() - out.min())
    return out


# --- Nebula -----------------------------------------------------------------
n1 = fbm(7, 2.5, 0.58, seed=1)
n2 = fbm(7, 4.0, 0.60, seed=2)
n3 = fbm(5, 8.0, 0.55, seed=3)

# Upper band of wispy teal clouds (around y ~ 0.25-0.45), heavy blue clouds in the lower half.
band = np.exp(-((v - 0.36) / 0.13) ** 2)
lower = np.clip((v - 0.48) / 0.35, 0, 1) ** 1.2
top_dark = np.clip(1 - v / 0.22, 0, 1)

cloud_upper = np.clip((n1 - 0.48) * 2.6, 0, 1) ** 1.6 * band
cloud_lower = np.clip((n2 - 0.38) * 2.0, 0, 1) ** 1.3 * (0.35 + 0.65 * lower)
wisps = np.clip((n3 - 0.55) * 3.0, 0, 1) ** 2 * (band * 0.7 + lower * 0.5)

img = np.zeros((H, W, 3), np.float32)
# deep space base: near-black at top, navy lower down
img[..., 0] = 0.004 + 0.02 * v
img[..., 1] = 0.008 + 0.04 * v
img[..., 2] = 0.025 + 0.12 * v

teal = np.array([0.16, 0.48, 0.62], np.float32)
blue = np.array([0.10, 0.30, 0.78], np.float32)
deep = np.array([0.05, 0.14, 0.42], np.float32)
img += cloud_upper[..., None] * teal * 0.75
img += cloud_lower[..., None] * (blue * 0.55 + deep * 0.6)
img += wisps[..., None] * np.array([0.35, 0.7, 0.85], np.float32) * 0.45
# brighter cyan glows at the lower left and lower right like the original
for cx, cy, r, col, k in [(0.03, 0.70, 0.16, (0.10, 0.65, 0.75), 0.55),
                          (0.97, 0.66, 0.18, (0.10, 0.45, 0.85), 0.45),
                          (0.75, 0.86, 0.22, (0.08, 0.30, 0.80), 0.35),
                          (0.22, 0.90, 0.20, (0.08, 0.28, 0.75), 0.30)]:
    d = ((u - cx) / r) ** 2 + ((v - cy) / (r * 1.5)) ** 2
    img += (np.exp(-d) * (0.5 + 0.8 * n2))[..., None] * np.array(col, np.float32) * k
img *= (1 - 0.85 * top_dark)[..., None]

# --- Spiral galaxy (bottom centre, matches the inner ring of the map) -------
gcx, gcy = 372.5 / 750, 428 / 500
dx, dy = (u - gcx) * (W / H), (v - gcy)
dy = dy / 0.62  # tilt the disc
rad = np.sqrt(dx ** 2 + dy ** 2) + 1e-6
ang = np.arctan2(dy, dx)
arms = 0.5 + 0.5 * np.cos(2 * (ang - np.log(rad) * 3.2))
arms = arms ** 3
disc = np.exp(-(rad / 0.16) ** 1.4)
core = np.exp(-(rad / 0.022) ** 2)
halo = np.exp(-(rad / 0.07) ** 2)
grain = 0.6 + 0.8 * n3
galaxy = disc * arms * grain * 0.55 + halo * 0.45 + core * 1.3
img += galaxy[..., None] * np.array([0.55, 0.68, 0.95], np.float32) * 0.85
img += (core * 0.9 + halo * 0.25)[..., None] * np.array([1.0, 0.85, 0.55], np.float32) * 0.6

# --- Stars ------------------------------------------------------------------
stars = np.zeros((H, W), np.float32)
n_small = int(W * H / 650)
sx = rng.integers(0, W, n_small); sy = rng.integers(0, H, n_small)
stars[sy, sx] += rng.random(n_small).astype(np.float32) ** 3 * 0.9
# denser stars inside the clouds and galaxy disc
dens = np.clip(cloud_upper + cloud_lower * 0.8 + disc * 1.2, 0, 1.5)
n_cl = int(W * H / 400)
cx_ = rng.integers(0, W, n_cl); cy_ = rng.integers(0, H, n_cl)
keep = rng.random(n_cl) < dens[cy_, cx_] * 0.7
stars[cy_[keep], cx_[keep]] += rng.random(keep.sum()).astype(np.float32) ** 2 * 0.8
star_img = gaussian_filter(stars, 0.7) * 4.0
# a few bright stars with soft glow
bright = np.zeros((H, W), np.float32)
nb = 260
bx = rng.integers(0, W, nb); by = rng.integers(0, H, nb)
bright[by, bx] = rng.random(nb).astype(np.float32) * 0.8 + 0.4
glow = gaussian_filter(bright, 2.2) * 30 + gaussian_filter(bright, 7) * 25
tint = rng.random((H, W)).astype(np.float32)
star_col = np.stack([0.85 + 0.15 * tint, 0.9 + 0.1 * tint, np.ones_like(tint)], -1)
img += (star_img + glow)[..., None] * star_col

# gentle tone map
img = 1 - np.exp(-img * 1.35)
img = np.clip(img, 0, 1)
out = Image.fromarray((img * 255).astype(np.uint8), 'RGB')

# --- Connection lines (drawn supersampled, then downsampled for smooth edges) ----
SS = 2
layer = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
d = ImageDraw.Draw(layer)
lw = int(5.2 * SCALE * SS)
for spec in LINES.values():
    pts = [(x * SCALE * SS, y * SCALE * SS) for x, y in spec['pts']]
    d.line(pts, fill=spec['color'] + (255,), width=lw, joint='curve')
    for p in (pts[0], pts[-1]):
        d.ellipse([p[0] - lw / 2, p[1] - lw / 2, p[0] + lw / 2, p[1] + lw / 2], fill=spec['color'] + (255,))
for spec in DOTTED:
    (x0, y0), (x1, y1) = [(x * SCALE * SS, y * SCALE * SS) for x, y in spec['pts']]
    length = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5
    dash, gap = 3.2 * SCALE * SS, 2.4 * SCALE * SS
    t = 0.0
    while t < length:
        t2 = min(t + dash, length)
        a = (x0 + (x1 - x0) * t / length, y0 + (y1 - y0) * t / length)
        b = (x0 + (x1 - x0) * t2 / length, y0 + (y1 - y0) * t2 / length)
        d.line([a, b], fill=spec['color'] + (255,), width=int(lw * 0.85))
        t += dash + gap
layer = layer.resize((W, H), Image.LANCZOS)
# subtle glow under the lines
glow_l = layer.filter(ImageFilter.GaussianBlur(5 * SCALE))
out = out.convert('RGBA')
g = np.array(glow_l).astype(np.float32)
g[..., 3] *= 0.55
out = Image.alpha_composite(out, Image.fromarray(g.astype(np.uint8), 'RGBA'))
out = Image.alpha_composite(out, layer).convert('RGB')

out.save(sys.argv[1] if len(sys.argv) > 1 else 'map_rote_hd.jpg', quality=88, optimize=True, progressive=True)
print('saved', out.size)
