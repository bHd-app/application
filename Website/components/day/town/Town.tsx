'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { MotionValue } from 'framer-motion';

import { HORIZON_UV, TOWN_SPOTS, sky, townLights } from '@/lib/day';
import { aces, exposureFor, skyRadiance, sunLight } from '@/lib/skylight';
import { createMaterials, lampPost, makeBuilding, mulberry, stoneTexture } from './diorama';
import { createTownMaterials, makeCookingStudio, makeHouse, makePottery, makeRestaurant, signMaterial } from './places';

// The harbour town as real 3D geometry (three.js), drawn on a transparent
// canvas over the sky/sea canvas. Its camera copies the sky shader's camera
// exactly (same heading, zoom and horizon), and it is lit by the same sun,
// sky and exposure, so it sits in the scene. The buildings come from Glass
// Diorama's village builder (see diorama.ts for source and licence).
//
// World units here are metres; the camera stands 2 m above the sea, looking
// along -z. The town sits 300–480 m away, right of centre.

const S = 46; // original village units → metres (a cottage is ~10 m wide)
const AZ_A = 0.12;
const AZ_B = 0.47;

const pos = (az: number, d: number, y = 0) => new THREE.Vector3(Math.sin(az) * d, y, -Math.cos(az) * d);
// heading that turns a building's front (+z) toward the viewer
const faceViewer = (az: number) => -az;

// an annular sector of land between two distances, between two azimuths
function landSector(d0: number, d1: number, a0: number, a1: number, top: number, depth: number) {
  const shape = new THREE.Shape();
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const p = [Math.sin(a) * d0, Math.cos(a) * d0];
    if (i === 0) shape.moveTo(p[0], p[1]);
    else shape.lineTo(p[0], p[1]);
  }
  for (let i = n; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / n;
    shape.lineTo(Math.sin(a) * d1, Math.cos(a) * d1);
  }
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  // the shape is drawn in (x, distance); stand it up so distance runs along -z
  // and the extrusion runs upward, ending at "top"
  g.rotateX(-Math.PI / 2);
  g.translate(0, top - depth, 0);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 6, uv.getY(i) / 6);
  return g;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,220,170,1)');
  grd.addColorStop(0.25, 'rgba(255,180,100,0.45)');
  grd.addColorStop(1, 'rgba(255,160,80,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

// Bake every building into one mesh per material: a few dozen draw calls for
// the whole town instead of hundreds.
function mergeByMaterial(root: THREE.Group) {
  root.updateMatrixWorld(true);
  const lists = new Map<THREE.Material, THREE.BufferGeometry[]>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
    geo.applyMatrix4(mesh.matrixWorld);
    const groups = geo.groups.length && mats.length > 1 ? geo.groups : [{ start: 0, count: geo.attributes.position.count, materialIndex: 0 }];
    for (const g of groups) {
      const part = new THREE.BufferGeometry();
      for (const k of ['position', 'normal', 'uv']) {
        const a = geo.attributes[k] as THREE.BufferAttribute;
        part.setAttribute(k, new THREE.BufferAttribute(a.array.slice(g.start * a.itemSize, (g.start + g.count) * a.itemSize), a.itemSize));
      }
      const m = mats[g.materialIndex ?? 0];
      const list = lists.get(m) ?? [];
      list.push(part);
      lists.set(m, list);
    }
  });
  const out = new THREE.Group();
  for (const [m, list] of lists) {
    const mesh = new THREE.Mesh(mergeGeometries(list), m);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    out.add(mesh);
  }
  return out;
}

type Glow = { pos: THREE.Vector3; size: number; kind: 'lamp' | 'bulb' | 'kiln' };
// warm lights that actually light the places at night (a few only: they cost)
type Lamp = { pos: THREE.Vector3; color: number; power: number };

function buildTown() {
  const M = createMaterials();
  const T = createTownMaterials();
  const R = mulberry(7);
  const town = new THREE.Group();
  const glows: Glow[] = [];
  const lamps: Lamp[] = [];

  // land: a stone quay along the water, and a terrace behind it
  const ground = new THREE.MeshStandardMaterial({ map: stoneTexture(), color: new THREE.Color('#8f8a80'), roughness: 0.95 });
  const quay = new THREE.Mesh(landSector(300, 520, AZ_A - 0.02, AZ_B + 0.03, 1.6, 4), [ground, ground]);
  const terrace = new THREE.Mesh(landSector(362, 540, AZ_A + 0.02, AZ_B + 0.02, 7, 6), [ground, ground]);
  for (const m of [quay, terrace]) {
    m.receiveShadow = true;
    m.castShadow = true;
    town.add(m);
  }

  const place = (obj: THREE.Object3D, az: number, d: number, y: number, scale = S, yaw = faceViewer(az)) => {
    obj.position.copy(pos(az, d, y));
    obj.rotation.y = yaw;
    obj.scale.setScalar(scale);
    town.add(obj);
    obj.updateMatrixWorld(true);
    return obj;
  };
  // a point given in a building's own units, in world space
  const at = (obj: THREE.Object3D, x: number, y: number, z: number) => obj.localToWorld(new THREE.Vector3(x, y, z));

  // the three places of the experiences
  const R1 = TOWN_SPOTS.restaurant, R2 = TOWN_SPOTS.cook, R3 = TOWN_SPOTS.pottery;
  const rest = place(makeRestaurant(M, T, R), R1.az, R1.d, R1.y);
  for (const [x, z] of [[-0.15, 0.27], [0.15, 0.27], [0, 0.3], [-0.05, 0.22]]) glows.push({ pos: at(rest, x, 0.16, z), size: 5, kind: 'bulb' });
  lamps.push({ pos: at(rest, 0, 0.15, 0.3), color: 0xffb066, power: 1 });
  const cook = place(makeCookingStudio(M, T), R2.az, R2.d, R2.y);
  lamps.push({ pos: at(cook, 0, 0.12, 0.25), color: 0xffb36b, power: 0.8 });
  const pot = place(makePottery(M, T, R), R3.az, R3.d, R3.y);
  glows.push({ pos: at(pot, 0.34 / 2 + 0.08, 0.02, 0.09), size: 7, kind: 'kiln' });
  for (const x of [-0.34 * 0.36, 0.34 * 0.28]) glows.push({ pos: at(pot, x, 0.11, 0.13), size: 3.5, kind: 'bulb' });
  lamps.push({ pos: at(pot, -0.03, 0.1, 0.22), color: 0xffa95c, power: 1 });
  lamps.push({ pos: at(pot, 0.34 / 2 + 0.08, 0.03, 0.14), color: 0xff6a24, power: 0.9 });

  // fill a row with varied houses, leaving room around the special buildings
  const SHOP_SIGNS = ['BAKERY', 'FISH MARKET', 'CAFÉ', 'WINE', 'BOOKS', 'GELATO'];
  let sign = 0;
  const fillRow = (d: number, y: number, a0: number, a1: number, keepOut: Array<[number, number]>, shops: boolean) => {
    let az = a0;
    while (az < a1) {
      const { group, width } = makeHouse(M, T, R, shops && R() < 0.5
        ? { shop: signMaterial(T, SHOP_SIGNS[sign++ % SHOP_SIGNS.length], ['#1f2a33', '#5b2a22', '#23402f'][sign % 3]), red: R() < 0.5 }
        : {});
      const wAz = (width * S + 1.5) / d;
      const mid = az + wAz / 2;
      const clash = keepOut.find(([c, half]) => Math.abs(mid - c) < half + wAz / 2);
      if (clash) {
        az = clash[0] + clash[1] + 0.004;
        continue;
      }
      place(group, mid, d + (R() - 0.5) * 3, y);
      az += wAz;
    }
  };
  const halfAz = (w: number, d: number) => (w * S) / 2 / d + 0.006;
  fillRow(338, 1.6, AZ_A + 0.005, AZ_B, [[R1.az, halfAz(0.48, R1.d)], [R2.az, halfAz(0.4, R2.d)]], true);
  fillRow(404, 7, AZ_A + 0.03, AZ_B - 0.01, [[R3.az, halfAz(0.62, R3.d)]], false);
  fillRow(452, 7, AZ_A + 0.06, AZ_B - 0.03, [], false);

  // a few market stalls on the quay, away from the terrace
  for (const az of [AZ_A + 0.03, R2.az - 0.07, R2.az + 0.06]) place(makeBuilding('stall', M, R), az, 318, 1.6, S * 0.85);
  // street lamps along the quay edge
  for (let i = 0; i < 12; i++) {
    const az = AZ_A + 0.01 + i * 0.031;
    place(lampPost(M), az, 306, 1.6, S * 0.9);
    glows.push({ pos: pos(az, 306, 1.6 + 0.095 * S * 0.9), size: 14, kind: 'lamp' });
  }
  // wooden jetties running out into the water
  for (const az of [AZ_A + 0.03, AZ_A + 0.31]) {
    place(makeBuilding('dock', M, R), az, 301, 1.3, S * 1.6, faceViewer(az) + Math.PI);
  }
  return { town: mergeByMaterial(town), M, T, glows, lamps };
}

export default function Town({
  hour,
  yaw,
  focal,
  camX,
  camY,
  camZ,
}: {
  hour: MotionValue<number>;
  yaw: MotionValue<number>;
  focal: MotionValue<number>;
  /** Camera position in metres (see Camera in lib/day.ts). */
  camX: MotionValue<number>;
  camY: MotionValue<number>;
  camZ: MotionValue<number>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    // same tone curve as the sky shader
    renderer.toneMapping = THREE.CustomToneMapping;
    THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
      'vec3 CustomToneMapping( vec3 color ) { return color; }',
      'vec3 CustomToneMapping( vec3 x ) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }',
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 20000);
    camera.position.set(0, 2, 0);

    const { town, M, T, glows, lamps } = buildTown();
    renderer.localClippingEnabled = true;
    const pointLights = lamps.map((l) => {
      const p = new THREE.PointLight(l.color, 0, 60, 2);
      p.position.copy(l.pos);
      scene.add(p);
      return { p, power: l.power };
    });
    scene.add(town);

    // reflection in the sea: the town mirrored under the water line, dimmer
    const reflection = town.clone(true);
    reflection.scale.y = -1;
    const reflMats = new Map<THREE.Material, THREE.Material>();
    reflection.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const swap = (m: THREE.Material) => {
        if (!reflMats.has(m)) {
          const c = m.clone() as THREE.MeshStandardMaterial;
          c.side = THREE.DoubleSide;
          c.transparent = true;
          c.opacity = 0.28;
          c.depthWrite = false;
          // only what is mirrored below the water line (posts under the
          // jetties would otherwise poke up out of the sea)
          c.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)];
          reflMats.set(m, c);
        }
        return reflMats.get(m)!;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
      mesh.renderOrder = -1;
    });
    scene.add(reflection);

    // lights: sun (folded toward us like the shader does), moon, sky
    const sunL = new THREE.DirectionalLight(0xffffff, 1);
    sunL.castShadow = true;
    sunL.shadow.mapSize.set(1536, 1536);
    sunL.shadow.bias = -0.0004;
    const center = pos((AZ_A + AZ_B) / 2, 380, 0);
    sunL.target.position.copy(center);
    const sc = sunL.shadow.camera;
    sc.left = -260; sc.right = 260; sc.top = 200; sc.bottom = -200; sc.near = 10; sc.far = 2000;
    scene.add(sunL, sunL.target);
    const moonL = new THREE.DirectionalLight(0x8ca6e6, 0);
    moonL.target.position.copy(center);
    scene.add(moonL, moonL.target);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(hemi);
    scene.fog = new THREE.FogExp2(0xffffff, 0.00009);

    // soft glow sprites around the street lamps
    const glowTex = glowTexture();
    const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffb060, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    const kilnMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xff7a30, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    const sprites = glows.map((g) => {
      const s = new THREE.Sprite(g.kind === 'kiln' ? kilnMat : glowMat);
      s.position.copy(g.pos);
      s.scale.setScalar(g.size);
      scene.add(s);
      return s;
    });

    const resize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    };
    resize();
    window.addEventListener('resize', resize);

    const fold = (v: number[]) => new THREE.Vector3(v[0], v[1], Math.abs(v[2]) * 0.55 + 0.1).normalize();
    let lastSun = '';
    let frame = 0;
    const draw = () => {
      const h = hour.get();
      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      const s = sky(h, aspect);
      const exposure = exposureFor(s.sunElev);
      const lights = townLights(h);

      // camera: identical to the sky shader's
      const f = 1 + (focal.get() - 1) * s.landScale * s.landScale;
      camera.aspect = aspect;
      camera.fov = (2 * Math.atan(0.5 / f) * 180) / Math.PI;
      camera.position.set(camX.get(), camY.get(), camZ.get());
      camera.rotation.set(0, -yaw.get() * s.landScale, 0);
      camera.updateProjectionMatrix();
      camera.projectionMatrix.elements[9] = -2 * HORIZON_UV;
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

      // light, recomputed only when the sun moves
      const key = s.sun.map((v) => v.toFixed(3)).join();
      if (key !== lastSun) {
        lastSun = key;
        const sl = sunLight(s.sun[1]);
        const sunUp = Math.min(1, Math.max(0, s.sun[1] * 3 + 0.1));
        sunL.color.setRGB(sl[0], sl[1], sl[2]);
        sunL.intensity = Math.PI * 2.0 * exposure * sunUp;
        sunL.position.copy(center).addScaledVector(fold(s.sun), 900);
        const zen = skyRadiance([0, 1, 0], s.sun);
        const tAz = (AZ_A + AZ_B) / 2;
        const hz = skyRadiance([Math.sin(tAz) * 0.9988, 0.05, -Math.cos(tAz) * 0.9988], s.sun);
        const nightAmb = [0.012, 0.018, 0.035].map((v) => v * s.night);
        hemi.color.setRGB(zen[0] * exposure * 0.55 + nightAmb[0], zen[1] * exposure * 0.55 + nightAmb[1], zen[2] * exposure * 0.55 + nightAmb[2]);
        hemi.groundColor.setRGB(hz[0] * exposure * 0.22, hz[1] * exposure * 0.22, hz[2] * exposure * 0.22);
        hemi.intensity = Math.PI;
        const fogC = [0, 1, 2].map((c) => aces(hz[c] * exposure + 0.02 * s.night));
        (scene.fog as THREE.FogExp2).color.setRGB(fogC[0], fogC[1], fogC[2]);
      }
      moonL.position.copy(center).addScaledVector(fold(s.moon), 900);
      moonL.intensity = Math.PI * 0.2 * s.night * (s.moon[1] > 0 ? 1 : 0);

      // night: windows, shop goods and lamps light up
      M.win.emissiveIntensity = lights * 5;
      M.goods.emissiveIntensity = lights * 3;
      M.lamp.emissiveIntensity = lights * 3.5;
      T.bulb.emissiveIntensity = lights * 8;
      // shop and workshop interiors read warm even by day
      T.interior.emissiveIntensity = 0.35 + lights * 1.5;
      T.kiln.emissiveIntensity = 1.2 + lights * 3;
      for (const m of T.signs) m.emissiveIntensity = lights * 0.9;
      for (const [src, dst] of reflMats) {
        const a = src as THREE.MeshStandardMaterial;
        const b = dst as THREE.MeshStandardMaterial;
        b.emissiveIntensity = a.emissiveIntensity;
      }
      for (const { p, power } of pointLights) p.intensity = lights * power * 1100;
      glowMat.opacity = lights;
      kilnMat.opacity = 0.35 + lights * 0.65;
      for (const sp of sprites) sp.visible = sp.material === kilnMat || lights > 0.01;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      renderer.dispose();
    };
  }, [hour, yaw, focal, camX, camY, camZ]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 block h-full w-full" />;
}
