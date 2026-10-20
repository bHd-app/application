'use client';

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

import {
  EXPERIENCES,
  GIFT_FROM,
  TOTAL_SCROLL_VH,
  formatHour,
  hourAt,
  progressAt,
  type Experience,
} from '@/lib/day';
import DaySky from './DaySky';
import ExperienceIcon from './ExperienceIcon';

// How long (in hours of the day) cards take to fade in and out.
const FADE_H = 0.55;

export default function DayJourney() {
  const ref = useRef<HTMLDivElement>(null);

  // Inertial page scrolling: wheel input glides to a stop instead of jumping
  // in steps, so the day passes continuously.
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.06, wheelMultiplier: 0.75, smoothWheel: true });
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
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.5,
    restDelta: 0.0002,
  });

  return (
    <main
      ref={ref}
      className="cinematic-stage relative bg-ink"
      style={{ height: `${TOTAL_SCROLL_VH}vh` }}
    >
      <motion.div
        className="sticky top-0 h-screen w-screen overflow-hidden bg-[#06141c]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <DaySky progress={progress} />

        {/* Soft vignette so the type always has something to sit on */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(120%_80%_at_50%_40%,transparent_55%,rgba(2,6,12,0.45)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[45vh] bg-gradient-to-t from-[#02060c]/70 to-transparent" />

        <Header progress={progress} />
        <Timeline progress={progress} />
        <Intro progress={progress} />

        {EXPERIENCES.map((exp, i) => (
          <ExperienceCard key={exp.id} exp={exp} index={i} progress={progress} />
        ))}

        <GiftCard progress={progress} />
      </motion.div>
    </main>
  );
}

/** Opacity / lift for something visible between two hours of the day. */
function useWindow(progress: MotionValue<number>, from: number, to: number) {
  const input = [
    progressAt(from - FADE_H),
    progressAt(from),
    progressAt(to - FADE_H),
    progressAt(to),
  ];
  return {
    opacity: useTransform(progress, input, [0, 1, 1, 0]),
    y: useTransform(progress, input, [40, 0, 0, -30]),
    blur: useTransform(progress, input, [
      'blur(12px)',
      'blur(0px)',
      'blur(0px)',
      'blur(8px)',
    ]),
  };
}

function Header({ progress }: { progress: MotionValue<number> }) {
  const [hour, setHour] = useState(hourAt(0));
  useMotionValueEvent(progress, 'change', (p) => setHour(hourAt(p)));

  const part =
    hour < 6.2 ? 'Before dawn'
    : hour < 11 ? 'Morning'
    : hour < 15 ? 'Midday'
    : hour < 19.6 ? 'Afternoon'
    : hour < 20.6 ? 'Dusk'
    : 'Night';

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 pt-6 sm:px-10 sm:pt-8">
      <span className="font-display text-xl tracking-[0.2em] text-bone/90">
        EXPERGIFT
      </span>
      <div className="text-right">
        <div className="font-display text-4xl font-light tabular-nums text-bone sm:text-5xl">
          {formatHour(hour)}
        </div>
        <div className="mt-1 text-[0.65rem] uppercase tracking-[0.35em] text-bone/60">
          {part}
        </div>
      </div>
    </div>
  );
}

// A thin day line on the right with a stop for each experience.
function Timeline({ progress }: { progress: MotionValue<number> }) {
  const fill = useTransform(progress, [0, 1], [0, 1]);
  return (
    <div className="pointer-events-none absolute bottom-[18vh] right-6 top-[22vh] z-30 hidden w-24 sm:right-10 md:block">
      <div className="absolute bottom-0 right-0 top-0 w-px bg-bone/20">
        <motion.div
          className="absolute inset-x-0 top-0 h-full origin-top bg-bone/80"
          style={{ scaleY: fill }}
        />
      </div>
      {EXPERIENCES.map((exp) => (
        <TimelineStop key={exp.id} exp={exp} progress={progress} />
      ))}
    </div>
  );
}

function TimelineStop({
  exp,
  progress,
}: {
  exp: Experience;
  progress: MotionValue<number>;
}) {
  const mid = progressAt((exp.from + exp.to) / 2);
  const a = progressAt(exp.from - FADE_H);
  const b = progressAt(exp.to);
  const active = useTransform(progress, [a, progressAt(exp.from), progressAt(exp.to - FADE_H), b], [0.35, 1, 1, 0.35]);
  const scale = useTransform(progress, [a, progressAt(exp.from), progressAt(exp.to - FADE_H), b], [1, 1.8, 1.8, 1]);
  return (
    <motion.div
      className="absolute right-0 flex translate-x-[3.5px] items-center gap-3"
      style={{ top: `${mid * 100}%`, opacity: active }}
    >
      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-bone">
        {formatHour(exp.from + FADE_H)}
      </span>
      <motion.span
        className="block h-2 w-2 rounded-full bg-bone"
        style={{ scale }}
      />
    </motion.div>
  );
}

function Intro({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.02, 0.038], [1, 1, 0]);
  const y = useTransform(progress, [0, 0.038], [0, -40]);
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-[24vh] z-20 flex flex-col items-center px-6 text-center"
      style={{ opacity, y }}
    >
      <span className="text-[0.65rem] uppercase tracking-[0.45em] text-bone/70">
        A day you can gift
      </span>
      <h1 className="mt-5 font-display text-5xl font-light leading-[1.05] text-bone sm:text-7xl">
        One day.
        <br />
        Four experiences.
      </h1>
      <span className="mt-10 text-[0.65rem] uppercase tracking-[0.4em] text-bone/60">
        Scroll to begin
      </span>
      <span className="mt-3 h-10 w-px animate-pulse bg-bone/40" />
    </motion.div>
  );
}

function ExperienceCard({
  exp,
  index,
  progress,
}: {
  exp: Experience;
  index: number;
  progress: MotionValue<number>;
}) {
  const { opacity, y, blur } = useWindow(progress, exp.from, exp.to);
  const visibility = useTransform(opacity, (o) => (o > 0.001 ? 'visible' : 'hidden'));
  // A slow drift while it's on screen, so it never sits perfectly still.
  const drift = useTransform(
    progress,
    [progressAt(exp.from - FADE_H), progressAt(exp.to)],
    [-10, 10],
  );

  return (
    <motion.article
      className="pointer-events-none absolute inset-x-0 bottom-[9vh] z-20 flex justify-center px-5"
      style={{ opacity, y, filter: blur, visibility }}
    >
      <motion.div
        className="w-full max-w-[640px] rounded-[28px] border border-white/15 bg-[#06101a]/35 p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-9"
        style={{ x: drift }}
      >
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-bone/70">
          <span>
            Experience {String(index + 1).padStart(2, '0')} · {exp.time}
          </span>
          <span className="hidden sm:inline">{exp.place}</span>
        </div>
        <div className="mt-6 flex items-start gap-6">
          <ExperienceIcon
            icon={exp.icon}
            className="mt-1 h-14 w-14 shrink-0 text-ember sm:h-16 sm:w-16"
          />
          <div>
            <h2 className="font-display text-4xl font-light leading-tight text-bone sm:text-5xl">
              {exp.title}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-bone/75 sm:text-base">
              {exp.blurb}
            </p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          {exp.meta.map((m) => (
            <span
              key={m}
              className="rounded-full border border-white/15 px-3 py-1 text-[0.7rem] tracking-wide text-bone/80"
            >
              {m}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.article>
  );
}

// The day, wrapped up as one gift card.
function GiftCard({ progress }: { progress: MotionValue<number> }) {
  const input = [progressAt(GIFT_FROM), progressAt(GIFT_FROM + 0.45)];
  const opacity = useTransform(progress, input, [0, 1]);
  const y = useTransform(progress, input, [60, 0]);
  const rotateX = useTransform(progress, input, [18, 0]);
  const scale = useTransform(progress, input, [0.92, 1]);
  const visibility = useTransform(opacity, (o) => (o > 0.001 ? 'visible' : 'hidden'));

  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center px-5"
      style={{ opacity, visibility, perspective: 1200 }}
    >
      <motion.div
        className="relative w-full max-w-[520px] overflow-hidden rounded-[30px] border border-white/20 bg-gradient-to-br from-[#1b2a44]/80 via-[#0d1626]/80 to-[#2a1d33]/80 p-8 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-10"
        style={{ y, rotateX, scale }}
      >
        {/* foil sheen */}
        <div className="pointer-events-none absolute -inset-x-20 -top-1/2 h-full rotate-12 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-bone/70">
          <span>Expergift</span>
          <span>Gift card</span>
        </div>
        <h2 className="mt-8 font-display text-5xl font-light leading-none text-bone">
          A day, wrapped.
        </h2>
        <ul className="mt-8 space-y-4">
          {EXPERIENCES.map((exp) => (
            <li key={exp.id} className="flex items-center gap-4 text-bone/85">
              <ExperienceIcon icon={exp.icon} className="h-7 w-7 shrink-0 text-ember" />
              <span className="flex-1 text-sm sm:text-base">{exp.title}</span>
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-bone/50">
                {exp.time}
              </span>
            </li>
          ))}
        </ul>
        <div className="pointer-events-auto mt-10 flex items-center justify-between gap-4">
          <span className="text-[0.7rem] uppercase tracking-[0.3em] text-bone/50">
            4 experiences · 1 card
          </span>
          <button
            type="button"
            className="shrink-0 whitespace-nowrap rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink transition hover:bg-white"
          >
            Gift this day
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
