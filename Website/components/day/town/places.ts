// Town buildings built on the Glass Diorama builder (diorama.ts): houses with
// varied shapes and colours, ground-floor shops, and the three places the
// experiences happen in — the harbour restaurant, the cooking studio and the
// pottery workshop. Sizes are in the builder's units (×S in Town.tsx → metres;
// a typical house front is 0.2–0.3 wide).

import * as THREE from 'three';

import { Builder, gableRoof, type Materials, plasterTexture, shingleTexture, timberFrame } from './diorama';

const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);

/** Extra materials the town needs on top of the original set. */
export function createTownMaterials() {
  const plaster = ['#f2ead9', '#e9d3a8', '#eec2a4', '#d7e1e4', '#f4f1ea', '#e6c58f'].map((c) =>
    std({ map: plasterTexture(), color: new THREE.Color(c), roughness: 0.92 }),
  );
  const shutter = ['#2f5d4a', '#2d4c6e', '#7a3b2a', '#5a6b3a'].map((c) => std({ color: new THREE.Color(c), roughness: 0.7 }));
  return {
    plaster,
    shutter,
    leaves: std({ color: new THREE.Color('#3f6b2f'), roughness: 1 }),
    flowers: std({ color: new THREE.Color('#d0454f'), roughness: 0.9 }),
    iron: std({ color: new THREE.Color('#1c1c1e'), roughness: 0.6, metalness: 0.4 }),
    cloth: std({ color: new THREE.Color('#f1ead8'), roughness: 0.9, side: THREE.DoubleSide }),
    clothRed: std({ color: new THREE.Color('#b8392f'), roughness: 0.9, side: THREE.DoubleSide }),
    tile: std({ map: shingleTexture(), color: new THREE.Color('#a24a2f'), roughness: 0.8 }),
    steel: std({ color: new THREE.Color('#9aa3a8'), roughness: 0.35, metalness: 0.7 }),
    clay: std({ color: new THREE.Color('#b9734a'), roughness: 0.85 }),
    glaze: ['#2f6f8f', '#e8e2d2', '#8a4f2c', '#4f7a55'].map((c) => std({ color: new THREE.Color(c), roughness: 0.35 })),
    // light sources: their emissiveIntensity follows the town lights
    bulb: std({ color: new THREE.Color('#3a3226'), emissive: new THREE.Color('#ffcf7a'), emissiveIntensity: 0 }),
    interior: std({ color: new THREE.Color('#5a4232'), emissive: new THREE.Color('#ffb25c'), emissiveIntensity: 0 }),
    kiln: std({ color: new THREE.Color('#2a1a12'), emissive: new THREE.Color('#ff6a1e'), emissiveIntensity: 0 }),
    signs: [] as THREE.MeshStandardMaterial[],
  };
}
export type TownMaterials = ReturnType<typeof createTownMaterials>;

/** A painted sign board; it glows a little at night (lit from below). */
export function signMaterial(T: TownMaterials, text: string, bg = '#1f2a33', fg = '#f3e6c4') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = fg;
  g.lineWidth = 6;
  g.strokeRect(10, 10, 492, 108);
  g.fillStyle = fg;
  g.font = '600 62px Georgia, "Times New Roman", serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 8;
  const m = std({ map: t, emissiveMap: t, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0, roughness: 0.7 });
  T.signs.push(m);
  return m;
}

// ---- small parts ----

// window with frame, cross bars, shutters either side and maybe a flower box
function window2(B: Builder, M: Materials, T: TownMaterials, x: number, y: number, z: number, R: () => number, shutterMat: THREE.Material | null, flowers: boolean, tall = false) {
  const fw = 0.044, fh = tall ? 0.072 : 0.056;
  B.box(M.frame, fw + 0.008, fh + 0.008, 0.008, x, y, z);
  B.box(M.win, fw - 0.004, fh - 0.004, 0.01, x, y, z + 0.001);
  B.box(M.frame, 0.004, fh - 0.006, 0.012, x, y, z + 0.002);
  B.box(M.frame, fw - 0.004, 0.004, 0.012, x, y + fh * 0.12, z + 0.002);
  B.box(M.frame, fw + 0.016, 0.006, 0.02, x, y - fh / 2 - 0.004, z + 0.006); // sill
  if (shutterMat) {
    for (const s of [-1, 1]) B.box(shutterMat, 0.022, fh, 0.006, x + s * (fw / 2 + 0.014), y, z + 0.003);
  }
  if (flowers) {
    B.box(M.plankDark, fw + 0.01, 0.014, 0.02, x, y - fh / 2 - 0.014, z + 0.012);
    for (let i = 0; i < 5; i++) {
      const g = new THREE.SphereGeometry(0.007 + R() * 0.004, 6, 4);
      g.translate(x - fw / 2 + 0.006 + i * (fw / 4.4), y - fh / 2 - 0.004, z + 0.014);
      B.geo(i % 2 ? T.flowers : T.leaves, g);
    }
  }
}

// a sloped striped awning over a shopfront
function awning(B: Builder, T: TownMaterials, w: number, y: number, z: number, red: boolean) {
  const stripes = Math.max(4, Math.round(w / 0.03));
  for (let i = 0; i < stripes; i++) {
    const sw = w / stripes;
    B.box(i % 2 ? T.cloth : red ? T.clothRed : T.cloth, sw, 0.005, 0.07, -w / 2 + sw * (i + 0.5), y, z + 0.03, 1, 0, 0.45);
  }
}

// a shopfront: big lit window, door, awning and a sign
function shopfront(B: Builder, M: Materials, T: TownMaterials, w: number, z: number, sign: THREE.Material | null, red: boolean) {
  B.box(T.interior, w * 0.62, 0.065, 0.01, -w * 0.12, 0.06, z + 0.001);
  B.box(M.frame, w * 0.64, 0.006, 0.014, -w * 0.12, 0.094, z + 0.004);
  B.box(M.frame, w * 0.64, 0.006, 0.014, -w * 0.12, 0.026, z + 0.004);
  for (let i = -1; i <= 1; i++) B.box(M.frame, 0.004, 0.068, 0.014, -w * 0.12 + i * w * 0.2, 0.06, z + 0.004);
  B.box(M.door, 0.036, 0.075, 0.01, w * 0.36, 0.0475, z + 0.002, 8);
  B.box(T.interior, 0.018, 0.03, 0.012, w * 0.36, 0.06, z + 0.004); // lit door glass
  awning(B, T, w * 0.95, 0.118, z, red);
  if (sign) B.box(sign, w * 0.6, 0.032, 0.008, 0, 0.142, z + 0.006, 1);
}

function chimney(B: Builder, M: Materials, x: number, y: number, z: number) {
  B.box(M.stone, 0.032, 0.11, 0.032, x, y, z, 10);
  B.box(M.stone, 0.04, 0.012, 0.04, x, y + 0.058, z, 10);
}

function hipRoof(B: Builder, mat: THREE.Material, w: number, d: number, H: number, rise: number) {
  const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
  g.rotateY(Math.PI / 4);
  g.scale(w + 0.05, rise, d + 0.05);
  g.translate(0, H + rise / 2, 0);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 4, uv.getY(i) * 3);
  B.geo(mat, g);
}

// ---- houses ----

export type HouseOpts = { shop?: THREE.Material | null; red?: boolean };

/** A town house: varied width, floors, wall finish, roof shape and trim. */
export function makeHouse(M: Materials, T: TownMaterials, R: () => number, opts: HouseOpts = {}) {
  const B = new Builder();
  const floors = 2 + (R() < 0.45 ? 1 : 0);
  const w = 0.2 + R() * 0.12;
  const d = 0.17 + R() * 0.05;
  const fh = 0.105;
  const H = 0.03 + floors * fh;
  const wallKind = R();
  const wall = wallKind < 0.62 ? T.plaster[Math.floor(R() * T.plaster.length)] : wallKind < 0.85 ? M.stone : M.plankLight;
  const shut = R() < 0.7 ? T.shutter[Math.floor(R() * T.shutter.length)] : null;
  const roofMat = R() < 0.6 ? T.tile : M.roofs[Math.floor(R() * M.roofs.length)];
  const z = d / 2;

  B.box(M.stone, w + 0.012, 0.03, d + 0.012, 0, 0.015, 0, 10);              // plinth
  B.box(wall, w, H - 0.03, d, 0, 0.03 + (H - 0.03) / 2, 0, wall === M.stone ? 10 : 4);
  if (wall !== M.stone && R() < 0.4) timberFrame(B, M, w, d, 0.03 + fh, H - 0.03 - fh);
  // string course between floors
  for (let f = 1; f < floors; f++) B.box(M.frame, w + 0.006, 0.006, d + 0.006, 0, 0.03 + f * fh, 0);

  // ground floor: shopfront, or a door and windows
  if (opts.shop !== undefined) {
    shopfront(B, M, T, w, z, opts.shop, !!opts.red);
  } else {
    B.box(M.door, 0.04, 0.078, 0.01, -w * 0.25, 0.069, z + 0.002, 8);
    B.box(M.frame, 0.05, 0.006, 0.014, -w * 0.25, 0.11, z + 0.004);
    window2(B, M, T, w * 0.18, 0.085, z + 0.004, R, shut, false);
  }
  // upper floors: a row of windows, flower boxes on some, a balcony maybe
  const cols = w > 0.26 ? 3 : 2;
  for (let f = 1; f < floors; f++) {
    const y = 0.03 + f * fh + fh * 0.5;
    for (let c = 0; c < cols; c++) {
      const x = -w / 2 + (w / cols) * (c + 0.5);
      window2(B, M, T, x, y, z + 0.004, R, shut, R() < 0.45, f === 1 && R() < 0.4);
    }
    if (f === 1 && R() < 0.35) {
      // balcony with iron railing across the first floor
      B.box(M.stone, w * 0.7, 0.008, 0.04, 0, y - 0.035, z + 0.02);
      for (let i = 0; i <= 10; i++) B.box(T.iron, 0.003, 0.03, 0.003, -w * 0.35 + (w * 0.7 * i) / 10, y - 0.016, z + 0.038);
      B.box(T.iron, w * 0.7, 0.004, 0.004, 0, y - 0.0, z + 0.038);
    }
  }

  // roof: gable, hipped or flat with a parapet and a roof garden
  const roofKind = R();
  if (roofKind < 0.5) {
    const rise = gableRoof(B, M, roofMat, wall, w, d, H, 0.62 + R() * 0.2, 0.02);
    if (R() < 0.75) chimney(B, M, w * 0.3, H + rise * 0.6, -0.02);
  } else if (roofKind < 0.8) {
    hipRoof(B, roofMat, w, d, H, 0.07 + R() * 0.03);
    if (R() < 0.6) chimney(B, M, -w * 0.25, H + 0.06, 0.0);
  } else {
    B.box(wall, w + 0.008, 0.022, d + 0.008, 0, H + 0.011, 0, 4);
    B.box(M.stone, w - 0.01, 0.006, d - 0.01, 0, H + 0.004, 0, 10);
    for (let i = 0; i < 3; i++) {
      const g = new THREE.SphereGeometry(0.016, 7, 5);
      g.translate(-w / 3 + i * (w / 3), H + 0.03, -d / 4);
      B.geo(T.leaves, g);
    }
  }
  return { group: B.finish(), width: w };
}

// ---- the three places ----

/** Harbour restaurant: a wide two-storey house with a sign and a terrace of
 *  tables and parasols on the quay, strung with lights. */
export function makeRestaurant(M: Materials, T: TownMaterials, R: () => number) {
  const B = new Builder();
  const w = 0.42, d = 0.22, H = 0.25;
  const wall = T.plaster[2];
  const z = d / 2;
  B.box(M.stone, w + 0.014, 0.03, d + 0.014, 0, 0.015, 0, 10);
  B.box(wall, w, H - 0.03, d, 0, 0.03 + (H - 0.03) / 2, 0, 4);
  B.box(M.frame, w + 0.006, 0.008, d + 0.006, 0, 0.135, 0);
  // ground floor: three tall lit openings and a door
  for (const x of [-0.14, -0.05, 0.14]) {
    B.box(T.interior, 0.06, 0.08, 0.01, x, 0.075, z + 0.001);
    B.box(M.frame, 0.066, 0.006, 0.014, x, 0.118, z + 0.004);
    B.box(M.frame, 0.004, 0.08, 0.014, x, 0.075, z + 0.004);
  }
  B.box(M.door, 0.045, 0.09, 0.01, 0.05, 0.075, z + 0.002, 8);
  for (let c = 0; c < 4; c++) window2(B, M, T, -w / 2 + (w / 4) * (c + 0.5), 0.19, z + 0.004, R, T.shutter[0], true);
  B.box(signMaterial(T, 'TAVERNA', '#2c3e2f'), 0.24, 0.045, 0.01, 0, 0.152, z + 0.008, 1);
  hipRoof(B, T.tile, w, d, H, 0.09);
  chimney(B, M, 0.12, H + 0.07, -0.03);

  // terrace on the quay in front
  const tz = z + 0.16;
  B.box(M.plankLight, w + 0.06, 0.012, 0.26, 0, 0.006, tz, 6);
  for (let i = 0; i < 4; i++) {
    const x = -0.15 + i * 0.1;
    const zz = tz + (i % 2 ? 0.05 : -0.04);
    const top = new THREE.CylinderGeometry(0.022, 0.022, 0.004, 12); top.translate(x, 0.05, zz); B.geo(T.cloth, top);
    const leg = new THREE.CylinderGeometry(0.003, 0.003, 0.045, 5); leg.translate(x, 0.028, zz); B.geo(T.iron, leg);
    for (const s of [-1, 1]) B.box(T.iron, 0.016, 0.03, 0.016, x + s * 0.032, 0.026, zz, 1);
    const pole = new THREE.CylinderGeometry(0.002, 0.002, 0.12, 5); pole.translate(x, 0.075, zz); B.geo(M.timber, pole);
    const shade = new THREE.ConeGeometry(0.055, 0.03, 8, 1, true); shade.translate(x, 0.135, zz); B.geo(i % 2 ? T.cloth : T.clothRed, shade);
  }
  // string lights between four posts around the terrace
  const posts: Array<[number, number]> = [[-w / 2 - 0.02, z + 0.04], [w / 2 + 0.02, z + 0.04], [w / 2 + 0.02, tz + 0.12], [-w / 2 - 0.02, tz + 0.12]];
  for (const [x, zz] of posts) B.box(M.timber, 0.008, 0.17, 0.008, x, 0.085, zz);
  for (let k = 0; k < 4; k++) {
    const [x0, z0] = posts[k];
    const [x1, z1] = posts[(k + 1) % 4];
    for (let i = 1; i < 10; i++) {
      const t = i / 10;
      const sag = Math.sin(Math.PI * t) * 0.025;
      const b = new THREE.SphereGeometry(0.0045, 6, 4);
      b.translate(x0 + (x1 - x0) * t, 0.165 - sag, z0 + (z1 - z0) * t);
      B.geo(T.bulb, b);
    }
  }
  // planters at the terrace corners
  for (const x of [-w / 2, w / 2]) {
    B.box(M.plankDark, 0.03, 0.03, 0.03, x, 0.015, tz + 0.13);
    const g = new THREE.SphereGeometry(0.024, 7, 5); g.translate(x, 0.045, tz + 0.13); B.geo(T.leaves, g);
  }
  return B.finish();
}

/** Cooking studio: a glass-fronted kitchen — counters, a range and hanging
 *  pans visible inside — with herbs at the door. */
export function makeCookingStudio(M: Materials, T: TownMaterials) {
  const B = new Builder();
  const w = 0.36, d = 0.22, H = 0.24;
  const wall = M.stone;
  const z = d / 2;
  B.box(M.stone, w + 0.014, 0.03, d + 0.014, 0, 0.015, 0, 10);
  B.box(wall, w, H - 0.03, d, 0, 0.03 + (H - 0.03) / 2, 0, 10);
  // the glass front, recessed, with the kitchen behind it
  B.box(T.interior, w * 0.8, 0.1, 0.01, 0, 0.085, z - 0.03);              // lit back wall
  B.box(T.steel, w * 0.7, 0.03, 0.04, 0, 0.045, z - 0.008);               // counter
  for (let i = 0; i < 5; i++) {
    const pan = new THREE.CylinderGeometry(0.009, 0.009, 0.004, 10);
    pan.rotateX(Math.PI / 2);
    pan.translate(-0.1 + i * 0.05, 0.11, z - 0.02);
    B.geo(T.steel, pan);
  }
  B.box(M.frame, w * 0.82, 0.008, 0.012, 0, 0.138, z + 0.002);
  for (let i = 0; i <= 4; i++) B.box(M.frame, 0.005, 0.11, 0.012, -w * 0.4 + i * w * 0.2, 0.084, z + 0.002);
  B.box(M.win, w * 0.8, 0.105, 0.002, 0, 0.084, z - 0.001); // glass (lit at night too)
  // upper floor windows
  for (let c = 0; c < 3; c++) window2(B, M, T, -w / 2 + (w / 3) * (c + 0.5), 0.19, z + 0.004, () => 0.9, T.shutter[1], c !== 1);
  B.box(signMaterial(T, 'COOKING STUDIO', '#8a2f22'), 0.28, 0.04, 0.01, 0, 0.158, z + 0.008, 1);
  awning(B, T, w * 0.9, 0.15, z + 0.01, false);
  const rise = gableRoof(B, M, T.tile, wall, w, d, H, 0.6, 0.02);
  chimney(B, M, -0.11, H + rise * 0.6, 0);
  chimney(B, M, 0.12, H + rise * 0.5, 0.02);
  // herb pots by the door
  for (let i = 0; i < 4; i++) {
    const x = -w / 2 + 0.02 + i * 0.03;
    B.box(T.clay, 0.022, 0.022, 0.022, x, 0.041, z + 0.04);
    const g = new THREE.SphereGeometry(0.014, 6, 4); g.translate(x, 0.062, z + 0.04); B.geo(T.leaves, g);
  }
  return B.finish();
}

function pot(B: Builder, mat: THREE.Material, x: number, y: number, z: number, s: number, shape: number) {
  const pts = (shape < 0.33
    ? [[0, 0], [0.5, 0], [0.62, 0.3], [0.45, 0.8], [0.3, 1], [0.34, 1.1]]
    : shape < 0.66
      ? [[0, 0], [0.4, 0], [0.8, 0.35], [0.85, 0.55], [0.75, 0.6]]
      : [[0, 0], [0.35, 0], [0.55, 0.5], [0.5, 1.2], [0.25, 1.5], [0.3, 1.6]]
  ).map(([a, b]) => new THREE.Vector2(a * s, b * s));
  const g = new THREE.LatheGeometry(pts, 12);
  g.translate(x, y, z);
  B.geo(mat, g);
}

/** Pottery workshop: a low stone studio with an open front, a domed kiln
 *  glowing beside it, and shelves of finished pots outside. */
export function makePottery(M: Materials, T: TownMaterials, R: () => number) {
  const B = new Builder();
  const w = 0.34, d = 0.22, H = 0.15;
  const z = d / 2;
  B.box(M.stone, w + 0.014, 0.02, d + 0.014, 0, 0.01, 0, 10);
  B.box(M.stone, w, H - 0.02, d, 0, 0.02 + (H - 0.02) / 2, 0, 10);
  // wide open front with the lit workshop inside, a wheel and a worktable
  B.box(T.interior, w * 0.62, 0.09, 0.01, -0.03, 0.07, z + 0.001);
  B.box(M.timber, w * 0.66, 0.014, 0.02, -0.03, 0.12, z + 0.006);
  const wheel = new THREE.CylinderGeometry(0.018, 0.018, 0.006, 14); wheel.translate(-0.06, 0.05, z + 0.03); B.geo(T.clay, wheel);
  B.box(M.plankDark, 0.012, 0.045, 0.012, -0.06, 0.025, z + 0.03);
  pot(B, T.clay, -0.06, 0.053, z + 0.03, 0.018, 0.5);
  B.box(signMaterial(T, 'POTTERY', '#3b2b20'), 0.18, 0.036, 0.008, -0.03, 0.142, z + 0.01, 1);
  gableRoof(B, M, M.roofs[1], M.stone, w, d, H, 0.55, 0.03);
  // domed kiln with a glowing mouth and its chimney
  const dome = new THREE.SphereGeometry(0.06, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const uv = dome.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 6, uv.getY(i) * 2);
  dome.translate(w / 2 + 0.08, 0.0, 0.02);
  B.geo(M.stone, dome);
  B.box(T.kiln, 0.04, 0.03, 0.01, w / 2 + 0.08, 0.018, 0.08);
  chimney(B, M, w / 2 + 0.1, 0.09, -0.01);
  // shelves of pots in front
  for (let row = 0; row < 2; row++) {
    const sy = 0.03 + row * 0.045;
    B.box(M.plankLight, 0.2, 0.006, 0.035, -w / 2 - 0.0, sy, z + 0.08, 6);
    for (let i = 0; i < 5; i++) pot(B, T.glaze[Math.floor(R() * T.glaze.length)], -w / 2 - 0.08 + i * 0.04, sy + 0.003, z + 0.08, 0.012 + R() * 0.006, R());
  }
  for (const sx of [-w / 2 - 0.1, -w / 2 + 0.1]) B.box(M.timber, 0.008, 0.09, 0.008, sx, 0.045, z + 0.08);
  // big storage jars by the door
  for (let i = 0; i < 3; i++) pot(B, T.clay, 0.06 + i * 0.045, 0.0, z + 0.05, 0.022, 0.9);
  // lanterns either side of the opening
  for (const x of [-w * 0.36, w * 0.28]) {
    const g = new THREE.SphereGeometry(0.008, 8, 6); g.translate(x, 0.11, z + 0.015); B.geo(T.bulb, g);
  }
  return B.finish();
}
