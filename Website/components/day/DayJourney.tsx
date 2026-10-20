'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'framer-motion';

import { EXPERIENCES, STOPS, formatHour, type Experience, type Stop } from '@/lib/day';
import DaySky from './DaySky';
import ExperienceIcon from './ExperienceIcon';
import Vignette from './Vignettes';

// The page is one screen. Each scroll (wheel, swipe, arrow key) steps to the
// next stop; in between, the clock runs forward like a time-lapse so the sun
// and moon travel across the sky.

const EASE = [0.65, 0, 0.35, 1] as const;
// Seconds of time-lapse per hour of the day, within limits.
const lapseSeconds = (hours: number) => Math.min(3.4, Math.max(1.6, hours * 0.36));
// After a step, a new wheel gesture must start (trackpads keep sending events
// while they coast); this is how long the wheel has to be quiet first.
const WHEEL_QUIET_MS = 220;

export default function DayJourney() {
  const hour = useMotionValue(STOPS[0].hour);
  const [index, setIndex] = useState(0);
  const [moving, setMoving] = useState(false);
  const busy = useRef(false);
  const indexRef = useRef(0);

  const goTo = useCallback(
    (next: number) => {
      if (busy.current) return;
      const target = Math.max(0, Math.min(STOPS.length - 1, next));
      if (target === indexRef.current) return;
      busy.current = true;
      setMoving(true);
      const gap = Math.abs(STOPS[target].hour - hour.get());
      animate(hour, STOPS[target].hour, {
        duration: lapseSeconds(gap),
        ease: EASE,
        onComplete: () => {
          indexRef.current = target;
          setIndex(target);
          setMoving(false);
          busy.current = false;
        },
      });
    },
    [hour],
  );

  // Wheel, touch and keyboard all step one stop at a time.
  useEffect(() => {
    let lastWheel = 0;
    let needQuiet = false;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      const quiet = now - lastWheel > WHEEL_QUIET_MS;
      lastWheel = now;
      if (busy.current) {
        needQuiet = true;
        return;
      }
      if (needQuiet && !quiet) return;
      needQuiet = false;
      acc = quiet ? e.deltaY : acc + e.deltaY;
      if (Math.abs(acc) > 30) {
        goTo(indexRef.current + Math.sign(acc));
        acc = 0;
        needQuiet = true;
      }
    };
    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY === null) return;
      const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY);
      touchY = null;
      if (Math.abs(dy) > 40) goTo(indexRef.current + Math.sign(dy));
    };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'ArrowRight'].includes(e.key)) goTo(indexRef.current + 1);
      if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) goTo(indexRef.current - 1);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
  }, [goTo]);

  const stop = STOPS[index];
  const showing = moving ? null : stop;

  return (
    <motion.main
      className="cinematic-stage fixed inset-0 h-[100dvh] w-screen touch-none overflow-hidden bg-[#06141c]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <DaySky hour={hour} />

      {/* Soft vignette so the type always has something to sit on */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(120%_80%_at_50%_40%,transparent_55%,rgba(2,6,12,0.45)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[50vh] bg-gradient-to-t from-[#02060c]/75 to-transparent" />

      <Header hour={hour} />
      <Timeline hour={hour} index={index} onJump={goTo} />

      <AnimatePresence mode="wait">
        {showing?.kind === 'intro' && <Intro key="intro" />}
        {showing?.kind === 'experience' && (
          <ExperienceCard key={showing.exp.id} exp={showing.exp} index={showing.index} />
        )}
        {showing?.kind === 'gift' && <GiftCard key="gift" onRestart={() => goTo(0)} />}
      </AnimatePresence>

      <StepHint stop={stop} index={index} moving={moving} onNext={() => goTo(index + 1)} />
    </motion.main>
  );
}

function Header({ hour }: { hour: MotionValue<number> }) {
  const [h, setH] = useState(hour.get());
  useMotionValueEvent(hour, 'change', setH);

  const part =
    h < 6.2 ? 'Before dawn'
    : h < 11 ? 'Morning'
    : h < 15 ? 'Midday'
    : h < 19.6 ? 'Afternoon'
    : h < 20.6 ? 'Dusk'
    : 'Night';

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 pt-6 sm:px-10 sm:pt-8">
      <span className="font-display text-xl tracking-[0.2em] text-bone/90">EXPERGIFT</span>
      <div className="text-right">
        <div className="font-display text-4xl font-light tabular-nums text-bone sm:text-5xl">
          {formatHour(h)}
        </div>
        <div className="mt-1 text-[0.65rem] uppercase tracking-[0.35em] text-bone/60">{part}</div>
      </div>
    </div>
  );
}

// The day line on the right: one stop per experience. The fill follows the
// clock, so it moves during the time-lapse too. Stops are clickable.
function Timeline({
  hour,
  index,
  onJump,
}: {
  hour: MotionValue<number>;
  index: number;
  onJump: (i: number) => void;
}) {
  const first = EXPERIENCES[0].hour;
  const lastH = EXPERIENCES[EXPERIENCES.length - 1].hour;
  const fill = useTransform(hour, [first, lastH], [0, 1], { clamp: true });
  return (
    <div className="absolute bottom-[30vh] right-6 top-[24vh] z-30 hidden w-28 sm:right-10 md:block">
      <div className="absolute bottom-0 right-[3px] top-0 w-px bg-bone/20">
        <motion.div className="absolute inset-0 origin-top bg-bone/80" style={{ scaleY: fill }} />
      </div>
      {EXPERIENCES.map((exp, i) => {
        const stopIndex = STOPS.findIndex((s) => s.kind === 'experience' && s.exp.id === exp.id);
        const active = stopIndex === index;
        return (
          <button
            key={exp.id}
            type="button"
            onClick={() => onJump(stopIndex)}
            className="group absolute right-0 flex -translate-y-1/2 items-center gap-3"
            style={{ top: `${(i / (EXPERIENCES.length - 1)) * 100}%` }}
          >
            <span
              className={`text-right text-[0.6rem] uppercase tracking-[0.25em] transition ${active ? 'text-bone' : 'text-bone/45 group-hover:text-bone/80'}`}
            >
              {formatHour(exp.hour)}
              <span className="block text-[0.55rem] tracking-[0.2em] opacity-70">{exp.time}</span>
            </span>
            <span
              className={`block h-[7px] w-[7px] rounded-full transition-transform duration-500 ${active ? 'scale-[1.9] bg-ember' : 'bg-bone/70'}`}
            />
          </button>
        );
      })}
    </div>
  );
}

const enter = {
  initial: { opacity: 0, y: 40, filter: 'blur(14px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -30, filter: 'blur(10px)' },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

function Intro() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-[22vh] z-20 flex flex-col items-center px-6 text-center"
      {...enter}
    >
      <span className="text-[0.65rem] uppercase tracking-[0.45em] text-bone/70">A day you can gift</span>
      <h1 className="mt-5 font-display text-5xl font-light leading-[1.05] text-bone sm:text-7xl">
        One day.
        <br />
        Four experiences.
      </h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-bone/70 sm:text-base">
        From the first light on the ridge to a bowl made under the stars.
      </p>
    </motion.div>
  );
}

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  return (
    <motion.article
      className="pointer-events-none absolute inset-x-0 bottom-[11vh] z-20 flex justify-center px-4 sm:bottom-[8vh] sm:px-6"
      {...enter}
    >
      <div className="grid w-full max-w-[1000px] overflow-hidden rounded-[30px] border border-white/15 bg-[#06101a]/40 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl md:grid-cols-[1.05fr_1fr]">
        {/* the scene, acted out */}
        <div className="relative order-first h-[24vh] min-h-[150px] border-b border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent md:order-last md:h-auto md:min-h-[300px] md:border-b-0 md:border-l">
          <div className="absolute inset-3 sm:inset-6">
            <Vignette id={exp.id} />
          </div>
        </div>

        <div className="p-6 sm:p-9">
          <div className="flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.32em] text-bone/70">
            <ExperienceIcon icon={exp.id} className="h-5 w-5 text-ember" />
            <span>
              {String(index + 1).padStart(2, '0')} · {exp.time} · {formatHour(exp.hour)}
            </span>
          </div>
          <h2 className="mt-4 font-display text-[2.1rem] font-light leading-[1.05] text-bone sm:text-5xl">
            {exp.title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-bone/75 sm:text-[0.95rem]">{exp.blurb}</p>
          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            {exp.facts.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.12, duration: 0.6 }}
              >
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-display text-2xl font-light text-bone sm:text-3xl">{f.value}</dd>
                <dd className="mt-1 text-[0.6rem] uppercase tracking-[0.25em] text-bone/55">{f.label}</dd>
              </motion.div>
            ))}
          </dl>
          <div className="mt-5 hidden text-[0.65rem] uppercase tracking-[0.3em] text-bone/45 sm:block">
            {exp.place}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function StepHint({
  stop,
  index,
  moving,
  onNext,
}: {
  stop: Stop;
  index: number;
  moving: boolean;
  onNext: () => void;
}) {
  const last = index === STOPS.length - 1;
  return (
    <AnimatePresence>
      {!moving && !last && (
        <motion.button
          type="button"
          onClick={onNext}
          className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 text-[0.6rem] uppercase tracking-[0.35em] text-bone/60 transition hover:text-bone sm:bottom-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <span>{stop.kind === 'intro' ? 'Scroll to begin' : 'Next'}</span>
          <motion.span
            className="block h-3 w-px bg-bone/60"
            animate={{ scaleY: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// The day, wrapped up as one gift card.
function GiftCard({ onRestart }: { onRestart: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center px-5"
      style={{ perspective: 1200 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="relative w-full max-w-[520px] overflow-hidden rounded-[30px] border border-white/20 bg-gradient-to-br from-[#1b2a44]/80 via-[#0d1626]/80 to-[#2a1d33]/80 p-8 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-10"
        initial={{ y: 60, rotateX: 18, scale: 0.92 }}
        animate={{ y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* foil sheen sweeping across once */}
        <motion.div
          className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          initial={{ x: '-120%' }}
          animate={{ x: '260%' }}
          transition={{ delay: 0.6, duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
        />
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-bone/70">
          <span>Expergift</span>
          <span>Gift card</span>
        </div>
        <h2 className="mt-8 font-display text-5xl font-light leading-none text-bone">A day, wrapped.</h2>
        <ul className="mt-8 space-y-4">
          {EXPERIENCES.map((exp, i) => (
            <motion.li
              key={exp.id}
              className="flex items-center gap-4 text-bone/85"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
            >
              <ExperienceIcon icon={exp.id} className="h-7 w-7 shrink-0 text-ember" />
              <span className="flex-1 text-sm sm:text-base">{exp.title}</span>
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-bone/50">
                {formatHour(exp.hour)}
              </span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onRestart}
            className="text-[0.7rem] uppercase tracking-[0.3em] text-bone/50 transition hover:text-bone"
          >
            ↺ Start again
          </button>
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
