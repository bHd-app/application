// Scroll-driven wardrobe sequence.
//
// Four hero photos of the SAME man, centred & same pose, each in a different
// environment wearing that scene's outfit. Between scenes the next scene's
// garment (a transparent product cut-out) drops from the top, lands on his
// torso, and as it settles the next environment opens out of his torso —
// so it reads as "the clothes just landed on him and now he's wearing them".
//
// IMPORTANT: character/N is paired with shirts/N (same number = same outfit).
//   character/1 + shirts/1  → pottery workshop (apron)
//   character/2 + shirts/2  → cooking school   (navy apron)
//   character/3 + shirts/3  → restaurant       (suit)
//   character/4 + shirts/4  → nature trail      (hiking jacket)

export type WardrobeScene = {
  id: string;
  /** Short chapter label shown while the scene is held. */
  label: string;
  /** Full hero photo: the man already in the environment & outfit. */
  photo: string;
  /** Transparent garment cut-out that drops in to "become" this outfit. */
  garment: string;
  /**
   * Alignment of the dropping garment over the figure's torso, tuned per
   * photo since the framing differs slightly between shots.
   *   restY  — vertical centre of the landed garment, as % of viewport height
   *   scale  — garment frame height as a fraction of viewport height
   *   restX  — horizontal nudge, as % of viewport width (0 = centred)
   */
  garmentTune: { restY: number; scale: number; restX: number };
};

// Scroll order of the journey: trail → table → kitchen → workshop.
export const SCENES: WardrobeScene[] = [
  {
    id: 'nature',
    label: 'On the trail',
    photo: '/wardrobe/web/character-4.webp',
    garment: '/wardrobe/web/shirt-4.webp',
    garmentTune: { restY: 34, scale: 0.3, restX: 0 },
  },
  {
    id: 'restaurant',
    label: 'At the table',
    photo: '/wardrobe/web/character-3.webp',
    garment: '/wardrobe/web/shirt-3.webp',
    garmentTune: { restY: 36, scale: 0.33, restX: 0 },
  },
  {
    id: 'kitchen',
    label: 'In the kitchen',
    photo: '/wardrobe/web/character-2.webp',
    garment: '/wardrobe/web/shirt-2.webp',
    garmentTune: { restY: 46, scale: 0.4, restX: 0 },
  },
  {
    id: 'pottery',
    label: 'At the wheel',
    photo: '/wardrobe/web/character-1.webp',
    garment: '/wardrobe/web/shirt-1.webp',
    garmentTune: { restY: 45, scale: 0.4, restX: 0 },
  },
];

// ── Timeline ────────────────────────────────────────────────────────────
// scrollYProgress 0..1 is sliced into per-scene "holds" separated by long
// handoff windows. Holds and handoffs are laid out evenly so every scene gets
// the same breathing room:  hold | handoff | hold | handoff | ... | hold
// Each handoff is choreographed in steps (garment falls, lands, the next scene
// opens from the torso, the garment dissolves) so it needs real scroll length.

export const TRANSITION_SPAN = 0.15; // length of each handoff, in progress units
export const HOLD_SPAN =
  (1 - (SCENES.length - 1) * TRANSITION_SPAN) / SCENES.length;

// Handoff windows [a, b] between scene i and i+1 (length = SCENES.length - 1).
export function transitionWindows(): Array<readonly [number, number]> {
  const out: Array<readonly [number, number]> = [];
  for (let i = 0; i < SCENES.length - 1; i++) {
    const a = (i + 1) * HOLD_SPAN + i * TRANSITION_SPAN;
    out.push([a, a + TRANSITION_SPAN]);
  }
  return out;
}

/** Point `t` (0..1) of the way through window `w`. */
export const at = (w: readonly [number, number], t: number) =>
  w[0] + t * (w[1] - w[0]);

// Total scroll runway. ~240vh per scene: each handoff takes well over a full
// screen of scrolling, so nothing happens in a single wheel flick.
export const TOTAL_SCROLL_VH = SCENES.length * 240;
