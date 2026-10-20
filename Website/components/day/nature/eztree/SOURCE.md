# EZ-Tree (vendored)

Procedural tree generator by Daniel Greenheck — https://github.com/dgreenheck/ez-tree
(npm `@dgreenheck/ez-tree` 1.1.0), MIT License, see `LICENSE` in this folder.

Copied from `src/lib`: `tree.js`, `branch.js`, `enums.js`, `options.js`, `rng.js`,
`trellis.js` and six presets (unchanged apart from the note below).

Changed:
- `textures.js` is rewritten: the original bundles every bark and leaf texture into
  the JavaScript (~4 MB); this one loads only pine bark and pine/aspen leaves,
  resized to WebP, from `/public/nature`.
- `presets/index.js` lists only the presets kept here.
- `tree.js`: the leaf wind shader now applies `instanceMatrix`, so leaves work with
  `THREE.InstancedMesh` (one line added in `createLeavesGeometry`).
