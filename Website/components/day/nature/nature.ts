// The hiking trail: a patch of the mountainside in real 3D, with a dirt path
// winding up through a pine and aspen forest, and boulders along the way.
//
// The ground follows the very same height field the sky shader ray-marches
// (lib/terrain.ts), so the patch sits seamlessly in the mountain around it.
// Trees come from EZ-Tree (see eztree/SOURCE.md), generated once per kind and
// drawn instanced. World units are metres, like the town.

import * as THREE from 'three';

import { terrain } from '@/lib/terrain';
import { Tree } from './eztree/tree.js';

const rand = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Ground height in metres at world (x, z) metres. */
export const groundAt = (x: number, z: number) => terrain(x / 1000, z / 1000) * 1000;

// The trail, as control points in metres (switchbacks up the spur).
const TRAIL_PTS: Array<[number, number]> = [
  [-2700, -2920], [-2900, -3040], [-2790, -3200], [-2960, -3350], [-2830, -3520], [-2950, -3700], [-2860, -3880],
];
export const trailCurve = new THREE.CatmullRomCurve3(TRAIL_PTS.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');

/** A point `t` (0..1) along the trail, on the ground, plus the direction it climbs. */
export function trailPoint(t: number) {
  const p = trailCurve.getPointAt(t);
  const ahead = trailCurve.getPointAt(Math.min(1, t + 0.02));
  return { x: p.x, z: p.z, y: groundAt(p.x, p.z), heading: Math.atan2(ahead.x - p.x, -(ahead.z - p.z)) };
}

// Patch extent (metres)
const X0 = -3400, X1 = -2250, Z0 = -4100, Z1 = -2700;
const STEP = 5;

function noiseTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const R = rand(3);
  g.fillStyle = '#d0d0d0';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 6000; i++) {
    const l = 150 + R() * 105;
    g.fillStyle = `rgba(${l},${l},${l},0.5)`;
    g.fillRect(R() * 256, R() * 256, 1 + R() * 3, 1 + R() * 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(160, 200);
  t.anisotropy = 8;
  return t;
}

export function buildNature(focus: THREE.Vector3) {
  const group = new THREE.Group();
  const R = rand(11);

  // trail centre line, sampled finely, with a smoothed height along it
  const samples = trailCurve.getSpacedPoints(400);
  const trailY = samples.map((p) => groundAt(p.x, p.z));
  for (let k = 0; k < 3; k++) for (let i = 1; i < trailY.length - 1; i++) trailY[i] = (trailY[i - 1] + trailY[i] * 2 + trailY[i + 1]) / 4;
  const nearestOnTrail = (x: number, z: number) => {
    let best = 1e9, bi = 0;
    for (let i = 0; i < samples.length; i += 2) {
      const d = (samples[i].x - x) ** 2 + (samples[i].z - z) ** 2;
      if (d < best) { best = d; bi = i; }
    }
    return { d: Math.sqrt(best), y: trailY[bi] };
  };

  // ---- ground ----
  const nx = Math.round((X1 - X0) / STEP), nz = Math.round((Z1 - Z0) / STEP);
  const geo = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, nx, nz);
  geo.rotateX(-Math.PI / 2);
  geo.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const trailDist = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    let y = groundAt(x, z);
    const tr = nearestOnTrail(x, z);
    trailDist[i] = tr.d;
    if (tr.d < 9) {
      // cut the path into the slope
      const k = 1 - Math.min(1, Math.max(0, (tr.d - 2.5) / 6.5));
      y = y + (tr.y - y) * k * k * (3 - 2 * k) - 0.15 * (tr.d < 2.5 ? 1 : 0);
    }
    pos.setY(i, y);
  }
  geo.computeVertexNormals();
  const nrm = geo.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const ny = nrm.getY(i);
    const n = Math.sin(x * 0.05) * Math.cos(z * 0.043) * 0.5 + 0.5;
    // forest floor: needles and moss, grassier in clearings, bare rock where steep
    let r = 0.2 + 0.07 * n, g = 0.32 + 0.1 * n, b = 0.13;
    if (y > 380) { r = 0.42; g = 0.4; b = 0.28; }                     // above the trees: scrub
    const steep = Math.min(1, Math.max(0, (0.82 - ny) / 0.2));
    r += (0.5 - r) * steep; g += (0.48 - g) * steep; b += (0.44 - b) * steep;
    const td = trailDist[i];
    if (td < 6) {
      const k = 1 - Math.min(1, Math.max(0, (td - 3.5) / 2.5));
      r += (0.86 - r) * k; g += (0.66 - g) * k; b += (0.44 - b) * k;  // earthy dirt, pale enough to read from afar
    }
    colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const ground = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ vertexColors: true, map: noiseTexture(), roughness: 1 }),
  );
  ground.receiveShadow = true;
  group.add(ground);

  // ---- trees: a few generated kinds, instanced over the slope ----
  const kinds = [
    { preset: 'Pine Medium', weight: 0.5, height: 17 },
    { preset: 'Pine Large', weight: 0.25, height: 22 },
    { preset: 'Aspen Medium', weight: 0.25, height: 14 },
  ];
  // each kind twice: full detail for trees near the viewpoint, and a much
  // lighter version (fewer rings, fewer but larger leaf cards) further away
  type Opt = { branch: { sections: Record<string, number>; segments: Record<string, number> }; leaves: { count: number; size: number; billboard: string } };
  const make = (preset: string, seed: number, far: boolean) => {
    const t = new Tree();
    t.loadPreset(preset);
    t.options.seed = seed;
    if (far) {
      const o = t.options as unknown as Opt;
      for (const k of Object.keys(o.branch.sections)) o.branch.sections[k] = Math.max(3, Math.round(o.branch.sections[k] / 3));
      for (const k of Object.keys(o.branch.segments)) o.branch.segments[k] = 3;
      o.leaves.count = Math.max(2, Math.round(o.leaves.count * 0.22));
      o.leaves.size *= 2.0;
      o.leaves.billboard = 'single';
    }
    t.generate();
    return t;
  };
  const made = kinds.map((k, i) => {
    const near = make(k.preset, 1000 + i * 77, false);
    const far = make(k.preset, 1000 + i * 77, true);
    const box = new THREE.Box3().setFromObject(near);
    const scale = k.height / Math.max(1e-3, box.max.y - box.min.y);
    return { near, far, scale, ...k };
  });

  // scatter: dense close to the trail view, thinner further away
  const NEAR = 0; // the trail is seen from a distance now: light trees everywhere
  const placements: Array<{ near: THREE.Matrix4[]; far: THREE.Matrix4[] }> = made.map(() => ({ near: [], far: [] }));
  const tries = 9000;
  for (let i = 0; i < tries; i++) {
    const x = X0 + 15 + R() * (X1 - X0 - 30);
    const z = Z0 + 15 + R() * (Z1 - Z0 - 30);
    const distFocus = Math.hypot(x - focus.x, z - focus.z);
    const keep = distFocus < 450 ? 0.22 : 0.07;
    if (R() > keep) continue;
    const y = groundAt(x, z);
    if (y > 375 + 30 * Math.sin(x * 0.01)) continue;               // tree line
    const tr = nearestOnTrail(x, z);
    if (tr.d < 7) continue;                                       // keep the path clear
    const e = 4;
    const sl = Math.hypot(groundAt(x + e, z) - groundAt(x - e, z), groundAt(x, z + e) - groundAt(x, z - e)) / (2 * e);
    if (sl > 0.9) continue;                                        // too steep
    let pick = R(), ki = 0;
    for (; ki < kinds.length - 1; ki++) { if (pick < kinds[ki].weight) break; pick -= kinds[ki].weight; }
    const s = made[ki].scale * (0.75 + R() * 0.5);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y - 0.3, z),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), R() * Math.PI * 2),
      new THREE.Vector3(s, s, s),
    );
    placements[ki][distFocus < NEAR ? 'near' : 'far'].push(m);
  }
  const trees: Tree[] = [];
  const treeMeshes: THREE.Object3D[] = [];
  made.forEach((k, i) => {
    for (const lod of ['near', 'far'] as const) {
      const list = placements[i][lod];
      if (!list.length) continue;
      const tree = k[lod];
      for (const mesh of [tree.branchesMesh, tree.leavesMesh]) {
        const inst = new THREE.InstancedMesh(mesh.geometry, mesh.material as THREE.Material, list.length);
        list.forEach((m, j) => inst.setMatrixAt(j, m));
        inst.castShadow = lod === 'near';
        inst.receiveShadow = true;
        group.add(inst);
        treeMeshes.push(inst);
      }
      trees.push(tree);
    }
  });

  // ---- boulders along the slope and beside the path ----
  const rockGeo = new THREE.IcosahedronGeometry(1, 2);
  const rp = rockGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < rp.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(rp, i);
    v.multiplyScalar(1 + 0.22 * Math.sin(v.x * 3.1 + v.y * 2.3) * Math.cos(v.z * 2.7));
    v.y *= 0.65;
    rp.setXYZ(i, v.x, v.y, v.z);
  }
  rockGeo.computeVertexNormals();
  const rocks: THREE.Matrix4[] = [];
  for (let i = 0; i < 260; i++) {
    const near = i < 120;
    let x: number, z: number;
    if (near) {
      const t = R();
      const p = trailCurve.getPointAt(t);
      const side = R() < 0.5 ? -1 : 1;
      x = p.x + side * (4 + R() * 6);
      z = p.z + (R() - 0.5) * 8;
    } else {
      x = X0 + R() * (X1 - X0);
      z = Z0 + R() * (Z1 - Z0);
    }
    if (nearestOnTrail(x, z).d < 3.5) continue;
    const s = near ? 0.5 + R() * 1.6 : 1 + R() * 3;
    rocks.push(new THREE.Matrix4().compose(
      new THREE.Vector3(x, groundAt(x, z) - s * 0.25, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(R(), R() * 6, R())),
      new THREE.Vector3(s * (1 + R() * 0.6), s, s * (1 + R() * 0.4)),
    ));
  }
  const rockMesh = new THREE.InstancedMesh(rockGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color('#77736b'), roughness: 0.95, flatShading: true }), rocks.length);
  rocks.forEach((m, j) => rockMesh.setMatrixAt(j, m));
  rockMesh.castShadow = true;
  rockMesh.receiveShadow = true;
  group.add(rockMesh);

  return { group, trees, treeMeshes };
}
