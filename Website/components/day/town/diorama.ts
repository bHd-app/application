// Village buildings, ported from Glass Diorama's village builder:
//   https://github.com/SanLin-He/glass-diorama-open (src/life/village.js,
//   src/core/textures.js, src/core/util.js)
//
// MIT License — Copyright (c) 2026 Good Thing (SanLin He)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// Changes from the original: kept the house, shop stall, dock and lamp-post
// builders and their canvas textures; dropped the build animation, the
// "uber" material batching, styles, seasons and villager simulation; geometry
// is merged per material with plain MeshStandardMaterials instead.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- canvas textures ----
function canvas(w: number, h = w): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}
function tex(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  // the sky shader works in plain (non-gamma) values, so the town does too
  t.colorSpace = THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
const cache: Record<string, THREE.Texture> = {};
const once = (k: string, f: () => THREE.Texture) => cache[k] || (cache[k] = f());

export const plankTexture = () =>
  once('plank', () => {
    const [c, g] = canvas(256);
    const r = mulberry(21);
    const W = 256 / 8;
    for (let i = 0; i < 8; i++) {
      const l = 165 + r() * 50;
      g.fillStyle = `rgb(${l},${l * 0.93},${l * 0.85})`;
      g.fillRect(i * W, 0, W, 256);
      for (let k = 0; k < 14; k++) {
        g.strokeStyle = `rgba(60,40,20,${0.08 + r() * 0.12})`;
        g.lineWidth = 0.5 + r();
        const x = i * W + r() * W;
        g.beginPath();
        g.moveTo(x, 0);
        g.bezierCurveTo(x + r() * 4 - 2, 80, x + r() * 4 - 2, 170, x + r() * 3 - 1.5, 256);
        g.stroke();
      }
      g.fillStyle = 'rgba(30,18,8,0.55)';
      g.fillRect(i * W, 0, 2, 256);
      if (r() < 0.6) {
        g.fillStyle = 'rgba(30,18,8,0.4)';
        g.fillRect(i * W, Math.floor(r() * 256), W, 2);
      }
    }
    return tex(c);
  });

export const shingleTexture = () =>
  once('shingle', () => {
    const [c, g] = canvas(256);
    const r = mulberry(31);
    g.fillStyle = '#6a6a6a';
    g.fillRect(0, 0, 256, 256);
    const rows = 10;
    const H = 256 / rows;
    const Wd = 256 / 7;
    for (let j = 0; j < rows; j++) {
      const off = j % 2 ? Wd / 2 : 0;
      for (let i = -1; i < 8; i++) {
        const l = 150 + r() * 80;
        g.fillStyle = `rgb(${l},${l},${l})`;
        const x = i * Wd + off + 1;
        const y = j * H + 1;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Wd - 2, y);
        g.lineTo(x + Wd - 2, y + H * 0.8);
        g.quadraticCurveTo(x + Wd / 2, y + H + 1, x, y + H * 0.8);
        g.closePath();
        g.fill();
        g.fillStyle = 'rgba(0,0,0,0.28)';
        g.fillRect(x, y + H - 3, Wd - 2, 3);
      }
    }
    return tex(c);
  });

export const stoneTexture = () =>
  once('stone', () => {
    const [c, g] = canvas(256);
    const r = mulberry(41);
    g.fillStyle = '#4a4744';
    g.fillRect(0, 0, 256, 256);
    let y = 0;
    while (y < 256) {
      const h = 18 + r() * 16;
      let x = -r() * 30;
      while (x < 256) {
        const w = 24 + r() * 30;
        const l = 120 + r() * 70;
        g.fillStyle = `rgb(${l},${l * 0.97},${l * 0.92})`;
        g.beginPath();
        g.roundRect(x + 2, y + 2, w - 4, h - 4, 6);
        g.fill();
        x += w;
      }
      y += h;
    }
    return tex(c);
  });

export const plasterTexture = () =>
  once('plaster', () => {
    const [c, g] = canvas(128);
    const r = mulberry(51);
    g.fillStyle = '#e9e1d0';
    g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 900; i++) {
      const l = 200 + r() * 55;
      g.fillStyle = `rgba(${l},${l * 0.96},${l * 0.9},0.35)`;
      g.fillRect(r() * 128, r() * 128, 1 + r() * 3, 1 + r() * 3);
    }
    return tex(c);
  });

// ---- materials ----
const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
// The sky shader treats colours as plain values with no gamma step, so turn
// three.js colour management off and take the original hex colours as they are.
THREE.ColorManagement.enabled = false;
const col = (hex: string) => new THREE.Color(hex);

export function createMaterials() {
  const M = {
    plankDark: std({ map: plankTexture(), color: col('#7a5a40'), roughness: 0.85 }),
    plankLight: std({ map: plankTexture(), color: col('#b08a62'), roughness: 0.85 }),
    plankRed: std({ map: plankTexture(), color: col('#9a3f2c'), roughness: 0.85 }),
    plaster: std({ map: plasterTexture(), color: col('#f2ead9'), roughness: 0.92 }),
    stone: std({ map: stoneTexture(), color: col('#b3ada2'), roughness: 0.95 }),
    timber: std({ color: col('#3a281a'), roughness: 0.8 }),
    frame: std({ color: col('#e6dcc6'), roughness: 0.7 }),
    win: std({ color: col('#25303a'), roughness: 0.2, metalness: 0.2, emissive: col('#ffb052'), emissiveIntensity: 0 }),
    door: std({ map: plankTexture(), color: col('#5a3b24'), roughness: 0.8 }),
    awningA: std({ color: col('#c94a36'), roughness: 0.8 }),
    awningB: std({ color: col('#efe6d2'), roughness: 0.8 }),
    goods: std({ color: col('#e0a040'), roughness: 0.9, emissive: col('#ffb052'), emissiveIntensity: 0 }),
    lamp: std({ color: col('#2a2016'), emissive: col('#ffc874'), emissiveIntensity: 0 }),
  };
  const roofs = ['#5b4a40', '#8a4330', '#4d5763', '#5e6a4c', '#6e5a3c', '#9a4a32'].map((c) =>
    std({ map: shingleTexture(), color: col(c), roughness: 0.8 }),
  );
  return { ...M, roofs };
}
export type Materials = ReturnType<typeof createMaterials>;

// ---- geometry builder: collects pieces per material and merges them ----
export class Builder {
  parts = new Map<THREE.Material, THREE.BufferGeometry[]>();
  add(mat: THREE.Material, g: THREE.BufferGeometry) {
    const list = this.parts.get(mat) ?? [];
    // keep attributes consistent for merging
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    list.push(g.index ? g.toNonIndexed() : g);
    this.parts.set(mat, list);
  }
  box(mat: THREE.Material, w: number, h: number, d: number, x: number, y: number, z: number, ts = 4, ry = 0, rx = 0) {
    const g = new THREE.BoxGeometry(w, h, d);
    const uv = g.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++)
      for (let k = 0; k < 4; k++) {
        const i = f * 4 + k;
        uv.setXY(i, uv.getX(i) * dims[f][0] * ts, uv.getY(i) * dims[f][1] * ts);
      }
    if (rx) g.rotateX(rx);
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    this.add(mat, g);
  }
  geo(mat: THREE.Material, g: THREE.BufferGeometry) {
    this.add(mat, g);
  }
  finish() {
    const group = new THREE.Group();
    for (const [mat, list] of this.parts) {
      const mesh = new THREE.Mesh(mergeGeometries(list), mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return group;
  }
}

export function gableRoof(B: Builder, M: Materials, roofMat: THREE.Material, wallMat: THREE.Material, w: number, d: number, H: number, pitch: number, ov = 0.025) {
  const rise = (d / 2) * Math.tan(pitch);
  const slope = (d / 2 + ov) / Math.cos(pitch);
  for (const s of [-1, 1]) {
    const zc = (s * (d / 2 + ov)) / 2;
    const yc = H + rise - (rise + ov * Math.tan(pitch)) / 2 + 0.008;
    B.box(roofMat, w + 2 * ov, 0.014, slope, 0, yc, zc, 7, 0, s * pitch);
  }
  B.box(M.timber, w + 2 * ov + 0.01, 0.014, 0.022, 0, H + rise + 0.01, 0, 4);
  const sh = new THREE.Shape();
  sh.moveTo(-d / 2, 0);
  sh.lineTo(d / 2, 0);
  sh.lineTo(0, rise);
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false });
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 4, uv.getY(i) * 4);
  g.rotateY(Math.PI / 2);
  g.translate(-w / 2, H, 0);
  B.geo(wallMat, g);
  return rise;
}

export function windows(B: Builder, M: Materials, w: number, d: number, y: number, list: Array<[string, number]>) {
  for (const [face, off] of list) {
    const fw = 0.042;
    const fh = 0.052;
    let x = 0;
    let z = 0;
    let ry = 0;
    if (face === 'f') { x = off; z = d / 2; }
    else if (face === 'b') { x = off; z = -d / 2; ry = Math.PI; }
    else if (face === 'r') { x = w / 2; z = off; ry = Math.PI / 2; }
    else { x = -w / 2; z = off; ry = -Math.PI / 2; }
    const g1 = new THREE.BoxGeometry(fw, fh, 0.008); g1.rotateY(ry); g1.translate(x, y, z); B.geo(M.frame, g1);
    const g2 = new THREE.BoxGeometry(fw - 0.012, fh - 0.012, 0.01); g2.rotateY(ry); g2.translate(x, y, z); B.geo(M.win, g2);
    const g3 = new THREE.BoxGeometry(0.004, fh - 0.01, 0.012); g3.rotateY(ry); g3.translate(x, y, z); B.geo(M.frame, g3);
    const g4 = new THREE.BoxGeometry(fw - 0.01, 0.004, 0.012); g4.rotateY(ry); g4.translate(x, y, z); B.geo(M.frame, g4);
  }
}

export function timberFrame(B: Builder, M: Materials, w: number, d: number, y0: number, h: number) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) B.box(M.timber, 0.014, h, 0.014, (sx * w) / 2, y0 + h / 2, (sz * d) / 2);
  B.box(M.timber, w + 0.012, 0.012, d + 0.012, 0, y0 + h - 0.006, 0);
  for (const sz of [-1, 1]) {
    B.box(M.timber, 0.01, h, 0.012, 0, y0 + h / 2, (sz * d) / 2);
    const br = new THREE.BoxGeometry(0.009, Math.hypot(w / 2, h) * 0.98, 0.011);
    br.rotateZ(Math.atan2(w / 2, h) * (sz > 0 ? 1 : -1));
    br.translate((-w / 4) * sz, y0 + h / 2, (sz * d) / 2);
    B.geo(M.timber, br);
  }
}

export function lampPost(M: Materials) {
  const B = new Builder();
  const post = new THREE.CylinderGeometry(0.004, 0.005, 0.09, 5); post.translate(0, 0.045, 0);
  const bulb = new THREE.SphereGeometry(0.011, 8, 6); bulb.translate(0, 0.095, 0);
  B.geo(M.timber, post);
  B.geo(M.lamp, bulb);
  return B.finish();
}

export type Kind = 'cabin' | 'cottage' | 'house2' | 'tower' | 'stall' | 'dock';

/** Build one building in the original's local units (a cottage is ~0.22 wide). */
export function makeBuilding(kind: Kind, M: Materials, R: () => number) {
  const B = new Builder();
  const roofM = M.roofs[Math.floor(R() * M.roofs.length)];
  switch (kind) {
    case 'cabin': {
      const w = 0.2, d = 0.17, H = 0.12;
      B.box(M.stone, w + 0.02, 0.025, d + 0.02, 0, 0.0125, 0, 10);
      B.box(M.plankDark, w, H, d, 0, 0.025 + H / 2, 0, 5);
      const rise = gableRoof(B, M, roofM, M.plankDark, w, d, H + 0.025, 0.72);
      windows(B, M, w, d, 0.1, [['f', 0.05], ['r', 0], ['l', 0]]);
      B.box(M.door, 0.04, 0.075, 0.008, -0.05, 0.062, d / 2, 8);
      B.box(M.stone, 0.035, 0.12, 0.035, w / 2 - 0.035, H + rise * 0.6, -0.02, 10);
      break;
    }
    case 'cottage': {
      const w = 0.22, d = 0.18, H = 0.13;
      B.box(M.stone, w + 0.02, 0.025, d + 0.02, 0, 0.0125, 0, 10);
      B.box(M.plaster, w, H, d, 0, 0.025 + H / 2, 0, 4);
      timberFrame(B, M, w, d, 0.025, H);
      const rise = gableRoof(B, M, roofM, M.plaster, w, d, H + 0.025, 0.75);
      windows(B, M, w, d, 0.1, [['f', 0.055], ['b', 0], ['r', 0], ['l', 0.02]]);
      B.box(M.door, 0.04, 0.075, 0.008, -0.055, 0.062, d / 2, 8);
      if (R() < 0.7) B.box(M.stone, 0.032, 0.11, 0.032, -w / 2 + 0.04, H + rise * 0.6, 0.02, 10);
      break;
    }
    case 'house2': {
      const w = 0.22, d = 0.18, H1 = 0.12, H2 = 0.11;
      B.box(M.stone, w, H1, d, 0, H1 / 2, 0, 10);
      B.box(M.plaster, w + 0.02, H2, d + 0.02, 0, H1 + H2 / 2, 0, 4);
      timberFrame(B, M, w + 0.02, d + 0.02, H1, H2);
      const rise = gableRoof(B, M, roofM, M.plaster, w + 0.02, d + 0.02, H1 + H2, 0.8);
      windows(B, M, w, d, 0.065, [['f', 0.06], ['r', 0]]);
      windows(B, M, w + 0.02, d + 0.02, H1 + 0.06, [['f', -0.05], ['f', 0.05], ['b', 0], ['l', 0], ['r', 0]]);
      B.box(M.door, 0.04, 0.08, 0.008, -0.05, 0.04, d / 2, 8);
      B.box(M.stone, 0.034, 0.12, 0.034, w / 2 - 0.03, H1 + H2 + rise * 0.6, 0, 10);
      break;
    }
    case 'tower': {
      const w = 0.15, H = 0.36;
      B.box(M.stone, w, H, w, 0, H / 2, 0, 10);
      B.box(M.timber, w + 0.03, 0.02, w + 0.03, 0, H, 0);
      const cone = new THREE.ConeGeometry(0.14, 0.17, 4);
      cone.rotateY(Math.PI / 4);
      cone.translate(0, H + 0.095, 0);
      const uv = cone.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 2);
      B.geo(roofM, cone);
      windows(B, M, w, w, 0.12, [['f', 0], ['r', 0], ['l', 0]]);
      windows(B, M, w, w, 0.26, [['f', 0], ['b', 0], ['r', 0], ['l', 0]]);
      B.box(M.door, 0.04, 0.075, 0.008, 0, 0.04, w / 2, 8);
      break;
    }
    case 'dock': {
      for (let i = 0; i < 9; i++) B.box(M.plankLight, 0.09, 0.008, 0.035, 0, 0.0, -i * 0.038, 6);
      for (const s of [-1, 1]) for (let i = 0; i < 4; i++) B.box(M.timber, 0.012, 0.12, 0.012, s * 0.04, -0.05, -i * 0.1);
      break;
    }
    default: {
      // market stall: counter, posts, striped awning and goods on display
      B.box(M.plankLight, 0.17, 0.04, 0.1, 0, 0.03, 0.02, 6);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) B.box(M.timber, 0.01, 0.13, 0.01, sx * 0.08, 0.065, sz * 0.05);
      for (let i = 0; i < 4; i++) B.box(i % 2 ? M.awningB : M.awningA, 0.045, 0.006, 0.13, -0.067 + i * 0.045, 0.14, 0.02, 1, 0, 0.3);
      for (let i = 0; i < 3; i++) B.box([M.awningA, M.goods, M.plankLight][i], 0.035, 0.022, 0.035, -0.05 + i * 0.05, 0.062, 0.02);
    }
  }
  return B.finish();
}
