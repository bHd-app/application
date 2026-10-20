// CPU copy of the sky shader's light model (components/day/DaySky.tsx), so the
// three.js town can be lit with the same sun, sky and exposure.

type V3 = [number, number, number];

const BR: V3 = [5.8e-3, 13.5e-3, 33.1e-3];
const BM = 11e-3;
const BO: V3 = [0.65e-3, 1.881e-3, 0.085e-3];
const HR = 8;
const HM = 1.2;
const RE = 6360;
const RA = 6420;
const G = 0.76;

const ozone = (h: number) => Math.max(0, 1 - Math.abs(h - 25) / 15);
function raySphereFar(o: V3, d: V3, r: number) {
  const b = o[0] * d[0] + o[1] * d[1] + o[2] * d[2];
  const c = o[0] * o[0] + o[1] * o[1] + o[2] * o[2] - r * r;
  const disc = b * b - c;
  return disc < 0 ? -1 : -b + Math.sqrt(disc);
}

/** Sky radiance in direction rd for a sun in direction L (same as the shader's LUT). */
export function skyRadiance(rd: V3, L: V3): V3 {
  const ro: V3 = [0, RE + 0.002, 0];
  const seg = raySphereFar(ro, rd, RA) / 14;
  const mu = rd[0] * L[0] + rd[1] * L[1] + rd[2] * L[2];
  const phR = (3 / (16 * Math.PI)) * (1 + mu * mu);
  const g2 = G * G;
  const phM = ((3 / (8 * Math.PI)) * ((1 - g2) * (1 + mu * mu))) / ((2 + g2) * Math.pow(1 + g2 - 2 * G * mu, 1.5));
  const sumR: V3 = [0, 0, 0];
  const sumM: V3 = [0, 0, 0];
  let odR = 0, odM = 0, odO = 0;
  for (let i = 0; i < 14; i++) {
    const t = seg * (i + 0.5);
    const p: V3 = [ro[0] + rd[0] * t, ro[1] + rd[1] * t, ro[2] + rd[2] * t];
    const h = Math.hypot(p[0], p[1], p[2]) - RE;
    const hr = Math.exp(-h / HR) * seg;
    const hm = Math.exp(-h / HM) * seg;
    odR += hr; odM += hm; odO += ozone(h) * seg;
    const sl = raySphereFar(p, L, RA) / 6;
    let lR = 0, lM = 0, lO = 0, lit = true;
    for (let j = 0; j < 6; j++) {
      const s = sl * (j + 0.5);
      const hl = Math.hypot(p[0] + L[0] * s, p[1] + L[1] * s, p[2] + L[2] * s) - RE;
      if (hl < 0) { lit = false; break; }
      lR += Math.exp(-hl / HR) * sl;
      lM += Math.exp(-hl / HM) * sl;
      lO += ozone(hl) * sl;
    }
    if (!lit) continue;
    for (let c = 0; c < 3; c++) {
      const att = Math.exp(-(BR[c] * (odR + lR) + BM * 1.1 * (odM + lM) + BO[c] * (odO + lO)));
      sumR[c] += att * hr;
      sumM[c] += att * hm;
    }
  }
  return [0, 1, 2].map((c) => 22 * (sumR[c] * BR[c] * phR + sumM[c] * BM * phM)) as V3;
}

/** Direct sunlight colour after the atmosphere (same as the shader's sunLight()). */
export function sunLight(sunY: number): V3 {
  const airmass = 1 / (Math.max(sunY, 0) + 0.035);
  const up = Math.min(1, Math.max(0, (sunY + 0.03) / 0.05));
  const fade = up * up * (3 - 2 * up);
  return [0, 1, 2].map((c) => {
    const tau = BR[c] * 8 + BM * 1.2 * 1.1 + BO[c] * 15;
    return 22 * 0.08 * Math.exp(-tau * airmass) * fade;
  }) as V3;
}

/** Exposure used by the shader for a given sun elevation (degrees). */
export function exposureFor(sunElev: number) {
  const t = Math.min(1, Math.max(0, (4 - sunElev) / 14));
  return 0.75 + t * t * t * 40;
}

/** The shader's tone curve (Narkowicz ACES fit), for colours set directly. */
export const aces = (x: number) => Math.min(1, Math.max(0, (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14)));
