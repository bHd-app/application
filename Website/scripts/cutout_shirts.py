#!/usr/bin/env python3
"""Turn the solid-background garment shots into clean transparent cut-outs.

The exterior background is a flat light-gray (~248). We flood-fill from the
borders, removing only connected background-like pixels, so interior light
details (e.g. a white pocket square) are preserved. The garment is then
auto-cropped and a soft 1px alpha feather trims the white fringe.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

SRC = "scrolling_character/shirts"
DST = "public/wardrobe/shirts"

LUM_BG = 222      # >= this and desaturated => background candidate
SAT_BG = 26       # max(r,g,b)-min(...) below this => desaturated


def cutout(n: int) -> None:
    im = Image.open(f"{SRC}/{n}.png").convert("RGB")
    arr = np.asarray(im).astype(np.int16)
    h, w, _ = arr.shape

    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    lum = (r + g + b) / 3.0
    sat = arr.max(axis=2) - arr.min(axis=2)
    bg_candidate = (lum >= LUM_BG) & (sat <= SAT_BG)

    # Flood fill background from every border pixel that is a candidate.
    is_bg = np.zeros((h, w), dtype=bool)
    dq = deque()
    for x in range(w):
        for y in (0, h - 1):
            if bg_candidate[y, x] and not is_bg[y, x]:
                is_bg[y, x] = True
                dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if bg_candidate[y, x] and not is_bg[y, x]:
                is_bg[y, x] = True
                dq.append((y, x))

    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not is_bg[ny, nx] and bg_candidate[ny, nx]:
                is_bg[ny, nx] = True
                dq.append((ny, nx))

    alpha = np.where(is_bg, 0, 255).astype(np.uint8)

    out = Image.fromarray(np.dstack([arr.astype(np.uint8), alpha]), "RGBA")
    # Soften the cut edge a touch to kill the hard white fringe.
    a = out.getchannel("A").filter(ImageFilter.GaussianBlur(0.8))
    out.putalpha(a)

    # Auto-crop to the garment bounds so the PNG frame hugs the garment;
    # this makes on-page sizing/positioning predictable.
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)

    out.save(f"{DST}/{n}.png")
    print(f"shirt {n}: {im.size} -> cropped {out.size}, "
          f"{100*is_bg.mean():.1f}% background removed")


if __name__ == "__main__":
    nums = [int(x) for x in sys.argv[1:]] or [1, 2, 3, 4]
    for n in nums:
        cutout(n)
