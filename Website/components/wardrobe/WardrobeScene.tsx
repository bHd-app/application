'use client';

import {
  cubicBezier,
  easeIn,
  easeInOut,
  easeOut,
  motion,
  useTransform,
  type MotionValue,
} from 'framer-motion';

import { at, type WardrobeScene as Scene } from '@/lib/wardrobe';
import { cinematic, drop } from '@/lib/easing';

// Gravity-ish fall: accelerate down, settle at the bottom.
const dropEase = cubicBezier(drop[0], drop[1], drop[2], drop[3]);
const cinematicEase = cubicBezier(
  cinematic[0],
  cinematic[1],
  cinematic[2],
  cinematic[3],
);

type Window = readonly [number, number];

type Props = {
  scene: Scene;
  index: number;
  progress: MotionValue<number>;
  /** Handoff window into this scene (the drop). null for the first scene. */
  enter: Window | null;
  /** Handoff window out of this scene. null for the last scene. */
  exit: Window | null;
};

// Choreography inside a handoff window (local 0..1). The steps run one after
// another instead of all at once, so each beat is readable while scrolling:
//   fall → land & settle → light bloom → next scene opens from the torso →
//   garment dissolves into the new outfit.
const FALL_END = 0.34; // garment reaches the torso
const SETTLE_END = 0.46; // small landing bounce finished
const GLOW = [0.32, 0.44, 0.64] as const; // bloom in / peak / out
const REVEAL_START = 0.4; // next scene starts opening from the torso
const REVEAL_END = 0.84; // next scene fully open
const GARMENT_FADE = [0.6, 0.9] as const; // garment absorbed into the outfit
const FEATHER = 14; // soft edge of the opening circle, in vmax

// Photos float as cards over the ocean background, this tall (fraction of the
// viewport height). Garment tuning is authored for a full-height photo, so it
// is scaled by the same factor around the screen centre.
const FRAME = 0.74;

export default function WardrobeSceneLayer({
  scene,
  index,
  progress,
  enter,
  exit,
}: Props) {
  const { restY, restX, scale } = scene.garmentTune;
  const torsoX = 50 + restX * FRAME;
  const torsoY = 50 + (restY - 50) * FRAME;

  // ── Reveal: the scene opens as a soft-edged circle growing out of the torso
  const radius = useTransform(
    progress,
    enter ? [at(enter, REVEAL_START), at(enter, REVEAL_END)] : [0, 1],
    enter ? [-FEATHER, 150] : [150, 150], // vmax
    { ease: cinematicEase },
  );
  const mask = useTransform(
    radius,
    (r) =>
      `radial-gradient(circle at ${torsoX}% ${torsoY}%, #000 ${r}vmax, transparent ${r + FEATHER}vmax)`,
  );

  // Camera pulls back as the scene opens, so it lands with weight.
  const revealScale = useTransform(
    progress,
    enter ? [at(enter, REVEAL_START), enter[1]] : [0, 1],
    enter ? [1.16, 1] : [1, 1],
    { ease: easeOut },
  );

  // ── Slow push-in for as long as the scene is on screen ─────────────────
  const visibleFrom = enter ? enter[0] : 0;
  const visibleTo = exit ? exit[1] : 1;
  const kenScale = useTransform(progress, [visibleFrom, visibleTo], [1, 1.09]);
  const kenY = useTransform(progress, [visibleFrom, visibleTo], ['0%', '-2%']);
  // Card floats up gently, slower than the photo inside it → depth.
  const cardY = useTransform(progress, [visibleFrom, visibleTo], ['1.5vh', '-1.5vh']);

  // Scene dims as the next one takes over.
  const dim = useTransform(
    progress,
    exit ? [exit[0], at(exit, REVEAL_END)] : [0, 1],
    exit ? [0, 0.6] : [0, 0],
  );
  // ...and its card fades out once the next card has covered it.
  const sceneOpacity = useTransform(
    progress,
    exit ? [at(exit, 0.7), exit[1]] : [0, 1],
    exit ? [1, 0] : [1, 1],
  );

  // Hide fully-covered or not-yet-revealed scenes so they cost nothing.
  const visibility = useTransform(progress, (p) =>
    p >= visibleFrom - 0.01 && p <= visibleTo + 0.01 ? 'visible' : 'hidden',
  );

  // ── Incoming garment ──────────────────────────────────────────────────
  const fall = enter
    ? [
        enter[0],
        at(enter, FALL_END),
        at(enter, (FALL_END + SETTLE_END) / 2),
        at(enter, SETTLE_END),
      ]
    : [0, 0.25, 0.5, 1];
  const garmentY = useTransform(
    progress,
    fall,
    ['-120vh', '0vh', '-1.4vh', '0vh'],
    { ease: [dropEase, easeOut, easeInOut] },
  );
  // A gentle pendulum sway on the way down, like cloth catching air.
  const garmentRotate = useTransform(progress, fall, [11, -3, 1, 0], {
    ease: [easeInOut, easeOut, easeInOut],
  });
  const garmentScale = useTransform(progress, fall, [1.22, 1, 1.015, 1]);
  // Depth of field: out of focus while far from the lens.
  const garmentBlur = useTransform(
    progress,
    enter ? [enter[0], at(enter, FALL_END * 0.85)] : [0, 1],
    [10, 0],
  );
  const garmentFilter = useTransform(
    garmentBlur,
    (b) => `blur(${b}px) drop-shadow(0 30px 40px rgba(0,0,0,0.5))`,
  );
  const garmentOpacity = useTransform(
    progress,
    enter
      ? [
          enter[0],
          at(enter, 0.08),
          at(enter, GARMENT_FADE[0]),
          at(enter, GARMENT_FADE[1]),
        ]
      : [0, 1],
    enter ? [0, 1, 1, 0] : [0, 0],
    { ease: easeIn },
  );

  // Soft bloom of light where the garment lands.
  const glowOpacity = useTransform(
    progress,
    enter ? GLOW.map((t) => at(enter, t)) : [0, 1],
    enter ? [0, 0.55, 0] : [0, 0],
  );
  const glowScale = useTransform(
    progress,
    enter ? [at(enter, GLOW[0]), at(enter, GLOW[2])] : [0, 1],
    [0.4, 1.6],
  );

  return (
    <>
      {/* Scene layer — later scenes sit above earlier ones and open over them */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          zIndex: 10 + index,
          maskImage: enter ? mask : undefined,
          WebkitMaskImage: enter ? mask : undefined,
          opacity: sceneOpacity,
          visibility,
        }}
      >
        <motion.div
          className="relative overflow-hidden rounded-[28px] ring-1 ring-white/15"
          style={{
            height: `${FRAME * 100}vh`,
            y: cardY,
            scale: revealScale,
            boxShadow:
              '0 40px 90px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)',
            willChange: 'transform',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={scene.photo}
            alt={scene.label}
            className="block h-full w-auto max-w-none"
            style={{ scale: kenScale, y: kenY, willChange: 'transform' }}
            draggable={false}
            fetchPriority={index === 0 ? 'high' : 'auto'}
          />
          {/* Warm sunset light from the sea side of the card */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3a1d10]/35 via-transparent to-transparent mix-blend-soft-light" />
          {/* Dims the card while the next one takes over */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[#050507]"
            style={{ opacity: dim }}
          />
        </motion.div>
      </motion.div>

      {enter && (
        <>
          {/* Bloom where the garment lands */}
          <motion.div
            className="pointer-events-none absolute h-[70vh] w-[70vh] rounded-full"
            style={{
              left: `${torsoX}%`,
              top: `${torsoY}%`,
              x: '-50%',
              y: '-50%',
              zIndex: 35,
              opacity: glowOpacity,
              scale: glowScale,
              mixBlendMode: 'screen',
              background:
                'radial-gradient(circle, rgba(255,236,210,0.9) 0%, rgba(255,214,170,0.35) 35%, transparent 70%)',
            }}
          />

          {/* Falling garment. The anchor sits on the torso; the image itself
              starts above the frame and falls back down to y:0 (= centred). */}
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${torsoX}%`,
              top: `${torsoY}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 40,
            }}
          >
            <motion.img
              src={scene.garment}
              alt=""
              aria-hidden
              className="block w-auto select-none"
              style={{
                height: `${scale * FRAME * 100}vh`,
                opacity: garmentOpacity,
                y: garmentY,
                rotate: garmentRotate,
                scale: garmentScale,
                filter: garmentFilter,
                transformOrigin: '50% 10%',
                willChange: 'transform, filter, opacity',
              }}
              draggable={false}
            />
          </div>
        </>
      )}
    </>
  );
}
