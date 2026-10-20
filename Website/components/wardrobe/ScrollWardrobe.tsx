'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

import {
  SCENES,
  TOTAL_SCROLL_VH,
  at,
  transitionWindows,
} from '@/lib/wardrobe';
import WardrobeSceneLayer from './WardrobeScene';
import OceanBackground from '@/components/ocean/OceanBackground';

type Window = readonly [number, number];

export default function ScrollWardrobe() {
  const ref = useRef<HTMLDivElement>(null);

  // Inertial page scrolling: wheel input glides to a stop instead of jumping
  // in steps, which is what makes the scrubbed timeline feel continuous.
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.06,
      wheelMultiplier: 0.75,
      smoothWheel: true,
    });
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Light extra smoothing on top of the inertial scroll (keyboard / scrollbar
  // jumps still glide).
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.5,
    restDelta: 0.0002,
  });

  const transitions = transitionWindows(); // length = SCENES.length - 1

  const barScaleX = useTransform(progress, [0, 1], [0, 1]);

  return (
    <main
      ref={ref}
      className="cinematic-stage relative bg-ink"
      style={{ height: `${TOTAL_SCROLL_VH}vh` }}
    >
      <motion.div
        className="sticky top-0 h-screen w-screen overflow-hidden bg-[#050507]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <OceanBackground progress={progress} />

        {SCENES.map((scene, i) => (
          <WardrobeSceneLayer
            key={scene.id}
            scene={scene}
            index={i}
            progress={progress}
            enter={i === 0 ? null : transitions[i - 1]}
            exit={i === SCENES.length - 1 ? null : transitions[i]}
          />
        ))}

        {/* Cinematic letterbox + edge fade */}
        <div className="pointer-events-none absolute inset-0 z-[45]">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#050507]/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#050507]/85 via-[#050507]/40 to-transparent" />
        </div>

        {/* Chapter labels */}
        {SCENES.map((scene, i) => (
          <SceneLabel
            key={scene.id}
            label={scene.label}
            index={i}
            count={SCENES.length}
            progress={progress}
            enter={i === 0 ? null : transitions[i - 1]}
            exit={i === SCENES.length - 1 ? null : transitions[i]}
          />
        ))}

        {/* Scroll progress bar with a tick at every handoff */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-50 h-[2px] bg-white/10">
          <motion.div
            className="h-full origin-left bg-ember"
            style={{ scaleX: barScaleX }}
          />
          {transitions.map((w, i) => (
            <span
              key={i}
              className="absolute top-1/2 h-[6px] w-[1px] -translate-y-1/2 bg-bone/30"
              style={{ left: `${((w[0] + w[1]) / 2) * 100}%` }}
            />
          ))}
        </div>

        <ScrollHint progress={progress} />
      </motion.div>
    </main>
  );
}

function SceneLabel({
  label,
  index,
  count,
  progress,
  enter,
  exit,
}: {
  label: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
  enter: Window | null;
  exit: Window | null;
}) {
  // Arrives once the scene has fully opened, leaves as soon as the next
  // garment starts to fall — so labels never overlap.
  const input = [
    enter ? at(enter, 0.8) : -1,
    enter ? enter[1] + 0.01 : 0,
    exit ? exit[0] : 1,
    exit ? at(exit, 0.16) : 2,
  ];
  const opacity = useTransform(progress, input, [0, 1, 1, 0]);
  const y = useTransform(progress, input, [24, 0, 0, -18]);
  const letterSpacing = useTransform(progress, input, [
    '0.5em',
    '0.25em',
    '0.25em',
    '0.4em',
  ]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 bottom-7 z-50 flex flex-col items-center gap-3"
      style={{ opacity, y }}
    >
      <span className="text-[0.65rem] uppercase tracking-[0.4em] text-ember/80">
        {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
      </span>
      <motion.span
        className="font-display text-2xl font-light text-bone/90 sm:text-3xl"
        style={{ letterSpacing }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}

function ScrollHint({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.04], [1, 0]);
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-6 z-50 flex flex-col items-center gap-2 text-bone/60"
      style={{ opacity }}
    >
      <span className="text-[0.65rem] uppercase tracking-[0.35em]">Scroll</span>
      <span className="h-8 w-[1px] animate-pulse bg-bone/40" />
    </motion.div>
  );
}
