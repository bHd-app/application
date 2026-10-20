// CPU copy of the mountain's height field in the sky shader (DaySky.tsx:
// massif / terrainFine), so the 3D trail, trees and rocks sit exactly on the
// ground the shader draws. Units are km; x right, z toward the viewer.

const fract = (x: number) => x - Math.floor(x);

function thash(x: number, y: number) {
  let p3x = fract(x * 0.1031), p3y = fract(y * 0.1031), p3z = fract(x * 0.1031);
  const d = p3x * (p3y + 33.33) + p3y * (p3z + 33.33) + p3z * (p3x + 33.33);
  p3x += d; p3y += d; p3z += d;
  return fract((p3x + p3y) * p3z);
}
function tnoise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = thash(ix, iy), b = thash(ix + 1, iy), c = thash(ix, iy + 1), d = thash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
// p = mat2(1.6, 1.2, -1.2, 1.6) * p + k  (GLSL mat2 is column-major)
const rot = (x: number, y: number, k: number): [number, number] => [1.6 * x - 1.2 * y + k, 1.2 * x + 1.6 * y + k];

function tfbm(x: number, y: number) {
  let v = 0, a = 0.5;
  for (let i = 0; i < 5; i++) { v += a * tnoise(x, y); [x, y] = rot(x, y, 7.3); a *= 0.5; }
  return v;
}
function ridged5(x: number, y: number) {
  let v = 0, a = 0.5;
  for (let i = 0; i < 5; i++) {
    const n = 1 - Math.abs(tnoise(x, y) * 2 - 1);
    v += a * n * n;
    [x, y] = rot(x, y, 3.1);
    a *= 0.5;
  }
  return v;
}
function cone(x: number, z: number, cx: number, cz: number, r: number) {
  const d = Math.hypot(x - cx, z - cz) / r;
  const e1 = Math.exp(-2.2 * d), e2 = Math.exp(-2.5 * d * d);
  return e1 + (e2 - e1) * 0.45;
}
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export function massif(x: number, z: number) {
  const m = 1.2 * cone(x, z, -2.25, -5.7, 2.7)
    + 0.78 * cone(x, z, -4.7, -6.2, 2.4)
    + 0.48 * cone(x, z, -0.85, -5.0, 1.7)
    + 0.4 * cone(x, z, -6.6, -3.9, 2.8)
    + 0.25 * cone(x, z, -3.3, -3.6, 1.6);
  // the harbour town's coast and the mountains behind it (as in the shader)
  const r = Math.hypot(x, z);
  const az = Math.atan2(x, -z);
  const coast = smooth(0.31, 0.36, r) * smooth(-0.32, -0.12, az) * (1 - smooth(1.15, 1.35, az));
  const hills = 0.3 * cone(x, z, 1.4, -2.8, 1.7)
    + 0.36 * cone(x, z, 0.1, -3.4, 1.8)
    + 0.32 * cone(x, z, 3.0, -1.9, 1.7)
    + 0.2 * cone(x, z, -0.9, -2.6, 1.3);
  return m + coast * (0.082 + hills * smooth(0.6, 1.4, r));
}
/** Ground height in km at (x, z) km — identical to the shader's terrainFine. */
export function terrain(x: number, z: number) {
  const b = massif(x, z);
  const e = ridged5(x * 1.5 + 4, z * 1.5 + 4);
  return b + (e - 0.42) * 0.32 * smooth(0.04, 0.7, b) - 0.07 + (tfbm(x * 9, z * 9) - 0.5) * 0.035 * smooth(0.09, 0.2, b);
}
