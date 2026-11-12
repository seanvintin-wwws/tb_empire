"""High-resolution background for a planet page.

Cuts the planet disc out of a large source image and places it at the same position
and size it had on the old 750x500 background (so mission icons still line up),
over a freshly generated starfield, at SCALE x resolution.

usage: make_planet_bg.py SOURCE OUT --src-circle CX CY R --dst-circle CX CY R [--glow R,G,B]
       (dst circle is in old 750x500 coordinates)
"""
import argparse
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import gaussian_filter, map_coordinates

ap = argparse.ArgumentParser()
ap.add_argument('source'); ap.add_argument('out')
ap.add_argument('--src-circle', nargs=3, type=float, required=True)
ap.add_argument('--dst-circle', nargs=3, type=float, required=True)
ap.add_argument('--glow', default='255,70,30')
ap.add_argument('--band', default='0.62,0.38,-0.35', help='milky band centre x,y (0-1) and slope')
ap.add_argument('--seed', type=int, default=11)
a = ap.parse_args()

SCALE = 4
W, H = 750 * SCALE, 500 * SCALE
rng = np.random.default_rng(a.seed)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
u, v = xx / W, yy / H


def fbm(octaves, base, persistence, seed):
    r = np.random.default_rng(seed)
    out = np.zeros((H, W), np.float32); amp = 1.0; total = 0.0
    for o in range(octaves):
        cells = int(base * 2 ** o)
        small = gaussian_filter(r.random((max(2, cells * H // W + 2), cells + 2)).astype(np.float32), 0.8)
        gy, gx = np.meshgrid(np.linspace(0, small.shape[0] - 1.001, H), np.linspace(0, small.shape[1] - 1.001, W), indexing='ij')
        out += amp * map_coordinates(small, [gy, gx], order=3, mode='reflect'); total += amp; amp *= persistence
    out /= total
    return (out - out.min()) / (out.max() - out.min())


# --- starfield with a faint milky band ---------------------------------------
bx, by, slope = [float(t) for t in a.band.split(',')]
dist = (v - by) - slope * (u - bx)
band = np.exp(-(dist / 0.10) ** 2) * np.clip(1 - np.abs(u - bx) / 0.75, 0, 1)
n = fbm(7, 3.0, 0.6, a.seed)
img = np.zeros((H, W, 3), np.float32)
img += np.array([0.006, 0.008, 0.014], np.float32)
img += (band * np.clip((n - 0.35) * 1.8, 0, 1))[..., None] * np.array([0.10, 0.13, 0.16], np.float32)

stars = np.zeros((H, W), np.float32)
ns = int(W * H / 700)
sx = rng.integers(0, W, ns); sy = rng.integers(0, H, ns)
stars[sy, sx] += rng.random(ns).astype(np.float32) ** 3
nb = int(W * H / 250)
cx_ = rng.integers(0, W, nb); cy_ = rng.integers(0, H, nb)
keep = rng.random(nb) < band[cy_, cx_] * 0.8
stars[cy_[keep], cx_[keep]] += rng.random(keep.sum()).astype(np.float32) ** 2 * 0.7
img += (gaussian_filter(stars, 0.7) * 4.0)[..., None] * np.array([0.9, 0.95, 1.0], np.float32)
big = np.zeros((H, W), np.float32)
k = 120
big[rng.integers(0, H, k), rng.integers(0, W, k)] = rng.random(k).astype(np.float32) * 0.8 + 0.3
img += (gaussian_filter(big, 2.0) * 25 + gaussian_filter(big, 6) * 18)[..., None] * np.array([0.9, 0.95, 1.0], np.float32)

# --- planet --------------------------------------------------------------------
scx, scy, sr = a.src_circle
dcx, dcy, dr = [t * SCALE for t in a.dst_circle]
src = Image.open(a.source).convert('RGB')
f = dr / sr
src = src.resize((round(src.width * f), round(src.height * f)), Image.LANCZOS)
ox, oy = round(dcx - scx * f), round(dcy - scy * f)
canvas = Image.new('RGB', (W, H)); canvas.paste(src, (ox, oy))
planet = np.array(canvas).astype(np.float32) / 255
rr = np.sqrt((xx - dcx) ** 2 + (yy - dcy) ** 2)
alpha = np.clip((dr - rr) / (1.5 * SCALE), 0, 1)  # trim slightly inside the edge, anti-aliased
alpha = np.clip((dr - 2 * SCALE - rr) / (1.5 * SCALE) + 1, 0, 1)

glow_col = np.array([int(t) for t in a.glow.split(',')], np.float32) / 255
outside = np.clip(rr - dr, 0, None)
atmo = np.exp(-outside / (7 * SCALE)) * 0.32 + np.exp(-outside / (28 * SCALE)) * 0.18
atmo *= (rr > dr - 2 * SCALE)
img += atmo[..., None] * glow_col
# thin bright rim just inside the edge
rim = np.exp(-((dr - rr) / (6 * SCALE)) ** 2) * (rr <= dr)
img = img * (1 - alpha[..., None]) + planet * alpha[..., None]
img += (rim * 0.12)[..., None] * glow_col

img = np.clip(img, 0, 1)
Image.fromarray((img * 255).astype(np.uint8)).save(a.out, quality=90, optimize=True, progressive=True)
print('saved', a.out, W, H)
