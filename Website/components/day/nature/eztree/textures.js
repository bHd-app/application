// Replaces EZ-Tree's textures.js, which bundles every bark and leaf texture
// into the JavaScript (~4 MB). This site loads only what it uses — pine bark
// and pine/aspen leaves, resized to WebP — from /public/nature on demand.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = {};
const load = (url) => {
  if (!cache[url]) {
    const t = loader.load(url);
    t.premultiplyAlpha = true;
    // the scene works in plain (non-gamma) colour values, like the sky shader
    t.colorSpace = THREE.NoColorSpace;
    cache[url] = t;
  }
  return cache[url];
};

const BARK = { color: '/nature/pine_bark.webp', normal: '/nature/pine_bark_normal.webp' };
const LEAVES = { pine: '/nature/pine_leaves.webp', aspen: '/nature/aspen_leaves.webp' };

/** Bark texture (every bark type uses the pine bark here). Returns null for maps we don't ship. */
export function getBarkTexture(barkType, fileType, scale = { x: 1, y: 1 }) {
  const url = BARK[fileType];
  if (!url) return null;
  const texture = load(url).clone();
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.x = scale.x;
  texture.repeat.y = 1 / scale.y;
  return texture;
}

/** Leaf texture (pine for evergreens, aspen for everything else). */
export function getLeafTexture(leafType) {
  return load(LEAVES[leafType] ?? LEAVES.aspen);
}
