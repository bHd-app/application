'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import type { Experience } from '@/lib/day';

// Small animated line drawings that act out each experience. They play once
// when the card appears, then keep a gentle loop going (steam, the wheel…).
// Everything is SVG, so they stay crisp at any size and weigh almost nothing.

const BONE = 'rgba(244,237,227,0.9)';
const DIM = 'rgba(244,237,227,0.35)';
const EMBER = '#e8b98a';
const draw = (delay = 0, duration = 1.4) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: {
    pathLength: { delay, duration, ease: [0.65, 0, 0.35, 1] as const },
    opacity: { delay, duration: 0.2 },
  },
});
const appear = (delay = 0) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
});
const label = {
  fill: BONE,
  fontSize: 8.5,
  letterSpacing: 2,
  fontFamily: 'var(--font-sans)',
} as const;

export default function Vignette({ id }: { id: Experience['id'] }) {
  return (
    <svg viewBox="0 0 360 220" className="h-full w-full" aria-hidden>
      {id === 'hike' && <Hike />}
      {id === 'lunch' && <Lunch />}
      {id === 'cook' && <Cook />}
      {id === 'pottery' && <Pottery />}
    </svg>
  );
}

// Trailhead → switchbacks → summit, with the sun coming up behind the ridge.
const TRAIL =
  'M24 198 C70 192 96 184 112 168 C126 154 150 150 168 136 C186 122 176 108 196 98 C214 88 222 78 236 64';

function Hike() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="ridgeFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8b98a" stopOpacity="0.18" />
          <stop offset="1" stopColor="#e8b98a" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0" stopColor="#ffd9a8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd9a8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* the sun rises behind the ridge */}
      <motion.g
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <circle cx="300" cy="78" r="46" fill="url(#sunGlow)" />
        <circle cx="300" cy="78" r="15" stroke={EMBER} strokeWidth="1.2" />
        <motion.g
          style={{ originX: '300px', originY: '78px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={300 + Math.cos(a) * 21}
                y1={78 + Math.sin(a) * 21}
                x2={300 + Math.cos(a) * 27}
                y2={78 + Math.sin(a) * 27}
                stroke={EMBER}
                strokeWidth="1"
                opacity="0.7"
              />
            );
          })}
        </motion.g>
      </motion.g>

      {/* far ridge, then near ridge */}
      <motion.path
        d="M0 150 L50 128 L90 140 L140 104 L180 118 L214 96 L260 112 L320 98 L360 116"
        stroke={DIM}
        strokeWidth="1"
        {...draw(0.1, 1.6)}
      />
      <motion.path
        d="M0 206 L60 178 L96 186 L150 132 L182 146 L236 64 L270 98 L300 88 L360 140 L360 220 L0 220 Z"
        fill="url(#ridgeFill)"
        {...appear(1.2)}
      />
      <motion.path
        d="M0 206 L60 178 L96 186 L150 132 L182 146 L236 64 L270 98 L300 88 L360 140"
        stroke={BONE}
        strokeWidth="1.3"
        {...draw(0.3, 1.8)}
      />

      {/* the trail and the hiker walking it */}
      <motion.path
        d={TRAIL}
        stroke={EMBER}
        strokeWidth="1.4"
        strokeDasharray="1 5"
        {...draw(1.2, 2.4)}
      />
      <motion.circle
        r="3.4"
        fill={EMBER}
        style={{ offsetPath: `path('${TRAIL}')` } as React.CSSProperties}
        initial={{ offsetDistance: '0%', opacity: 0 }}
        animate={{ offsetDistance: '100%', opacity: 1 }}
        transition={{
          offsetDistance: { delay: 1.4, duration: 3.6, ease: [0.45, 0, 0.25, 1] },
          opacity: { delay: 1.4, duration: 0.3 },
        }}
      />

      {/* summit flag */}
      <motion.g
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        style={{ originX: '236px', originY: '64px' }}
        transition={{ delay: 4.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <line x1="236" y1="64" x2="236" y2="40" stroke={BONE} strokeWidth="1.2" />
        <path d="M236 40 L252 45 L236 50 Z" fill={EMBER} />
      </motion.g>

      <motion.text x="20" y="214" {...label} {...appear(1.3)}>
        TRAILHEAD · 06:10
      </motion.text>
      <motion.text x="150" y="30" {...label} {...appear(5.1)}>
        SUMMIT · 640 M · 08:30
      </motion.text>
    </g>
  );
}

const COURSES = ['Oysters & lemon', 'Grilled sea bream', 'Olive oil cake'];

function Lunch() {
  const [course, setCourse] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCourse((c) => (c + 1) % COURSES.length), 2600);
    return () => clearInterval(t);
  }, []);
  const dishes = [
    { x: 92, y: 62 },
    { x: 268, y: 62 },
    { x: 268, y: 160 },
  ];

  return (
    <g fill="none" strokeLinecap="round">
      {/* table edge and the sea beyond */}
      <motion.path d="M10 24 H350" stroke={DIM} strokeWidth="1" {...draw(0, 1.2)} />
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${30 + i * 40} ${12 - i * 3} q 10 -4 20 0 t 20 0`}
          stroke={DIM}
          strokeWidth="0.9"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.4, 1], x: [0, 6, 0] }}
          transition={{ delay: 0.4 + i * 0.3, duration: 5, repeat: Infinity }}
        />
      ))}

      {/* plate */}
      <motion.circle cx="180" cy="116" r="58" stroke={BONE} strokeWidth="1.3" {...draw(0.2, 1.4)} />
      <motion.circle cx="180" cy="116" r="42" stroke={DIM} strokeWidth="1" {...draw(0.5, 1.2)} />

      {/* fork and knife */}
      <motion.path d="M100 84 V150 M94 84 V100 Q100 108 106 100 V84" stroke={BONE} strokeWidth="1.2" {...draw(0.8, 1)} />
      <motion.path d="M260 84 Q270 100 262 118 V150" stroke={BONE} strokeWidth="1.2" {...draw(0.9, 1)} />

      {/* side dishes arrive one after another */}
      {dishes.map((d, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ originX: `${d.x}px`, originY: `${d.y}px` }}
          transition={{ delay: 1.3 + i * 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <circle cx={d.x} cy={d.y} r="13" stroke={EMBER} strokeWidth="1.1" />
          <circle cx={d.x} cy={d.y} r="5" fill={EMBER} opacity="0.35" />
        </motion.g>
      ))}

      {/* wine glass with a gentle swirl */}
      <motion.g {...appear(1.6)}>
        <path d="M60 150 Q60 172 72 172 Q84 172 84 150 Z M72 172 V194 M64 194 H80" stroke={BONE} strokeWidth="1.1" />
        <motion.path
          d="M62 160 Q72 164 82 160 Q82 170 72 170 Q62 170 62 160 Z"
          fill="#b0475a"
          opacity="0.55"
          initial={{ d: 'M62 160 Q72 164 82 160 Q82 170 72 170 Q62 170 62 160 Z' }}
          animate={{ d: [
            'M62 160 Q72 164 82 160 Q82 170 72 170 Q62 170 62 160 Z',
            'M62 161 Q72 157 82 161 Q82 170 72 170 Q62 170 62 161 Z',
            'M62 160 Q72 164 82 160 Q82 170 72 170 Q62 170 62 160 Z',
          ] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.g>

      {/* the course being served */}
      <AnimatePresence mode="wait">
        <motion.g
          key={course}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.5 }}
        >
          <text x="180" y="113" textAnchor="middle" {...label} fill={EMBER}>
            COURSE {course + 1} / 3
          </text>
          <text
            x="180"
            y="129"
            textAnchor="middle"
            fill={BONE}
            fontSize="12"
            fontFamily="var(--font-display)"
          >
            {COURSES[course]}
          </text>
        </motion.g>
      </AnimatePresence>
    </g>
  );
}

const STEPS = ['Fresh pasta', 'Sea bass & herbs', 'Lemon tart'];

function Cook() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* pan on the flame */}
      <motion.path d="M150 150 H290 Q286 182 250 182 H190 Q154 182 150 150 Z" stroke={BONE} strokeWidth="1.3" {...draw(0.2, 1.2)} />
      <motion.path d="M290 156 H340" stroke={BONE} strokeWidth="2.4" {...draw(0.8, 0.6)} />
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.path
          key={i}
          d={`M${184 + i * 18} 200 q -4 -6 0 -10 q 4 6 0 10`}
          stroke={EMBER}
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.5], scaleY: [0.8, 1.15, 0.9] }}
          style={{ originY: '200px' }}
          transition={{ delay: 1 + i * 0.1, duration: 0.9 + i * 0.13, repeat: Infinity, repeatType: 'mirror' }}
        />
      ))}

      {/* steam */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${196 + i * 24} 140 c -8 -12 8 -18 0 -30 c -8 -12 8 -18 0 -30`}
          stroke={DIM}
          strokeWidth="1.2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0, 0.9, 0], y: [8, -10, -22] }}
          transition={{ delay: 1.2 + i * 0.6, duration: 3.2, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}

      {/* recipe, ticked off one dish at a time */}
      {STEPS.map((s, i) => (
        <g key={s}>
          <motion.rect
            x="22"
            y={52 + i * 34}
            width="13"
            height="13"
            rx="3"
            stroke={DIM}
            strokeWidth="1"
            {...appear(0.4 + i * 0.2)}
          />
          <motion.path
            d={`M25 ${59 + i * 34} l3 3 l6 -7`}
            stroke={EMBER}
            strokeWidth="1.6"
            {...draw(1.6 + i * 1.1, 0.4)}
          />
          <motion.text x="46" y={63 + i * 34} fill={BONE} fontSize="12" fontFamily="var(--font-display)" {...appear(0.5 + i * 0.2)}>
            {s}
          </motion.text>
        </g>
      ))}
      <motion.text x="22" y="34" {...label} fill={EMBER} {...appear(0.2)}>
        TODAY&apos;S MENU
      </motion.text>

      {/* timer */}
      <circle cx="306" cy="70" r="24" stroke={DIM} strokeWidth="1" />
      <motion.circle
        cx="306"
        cy="70"
        r="24"
        stroke={EMBER}
        strokeWidth="1.6"
        transform="rotate(-90 306 70)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 6, repeat: Infinity, repeatDelay: 0.6, ease: 'linear' }}
      />
      <text x="306" y="74" textAnchor="middle" {...label} letterSpacing={1}>
        SIMMER
      </text>
    </g>
  );
}

const LUMP = 'M146 166 C146 150 162 138 180 138 C198 138 214 150 214 166 C200 169 160 169 146 166 Z';
const BOWL = 'M156 166 C140 150 128 124 126 110 C162 118 198 118 234 110 C232 124 220 150 204 166 Z';

function Pottery() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* stars */}
      {[
        [40, 30], [92, 18], [150, 40], [220, 22], [330, 30], [270, 52], [20, 80],
      ].map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 1.4 : 1}
          fill={BONE}
          animate={{ opacity: [0.2, 1, 0.3] }}
          transition={{ duration: 2 + (i % 4) * 0.7, repeat: Infinity, repeatType: 'mirror', delay: i * 0.2 }}
        />
      ))}

      {/* lantern on a string */}
      <motion.g {...appear(0.3)}>
        <path d="M300 0 V48" stroke={DIM} strokeWidth="1" />
        <motion.circle
          cx="300"
          cy="66"
          r="34"
          fill="#ffb86b"
          animate={{ opacity: [0.1, 0.2, 0.12] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatType: 'mirror' }}
        />
        <rect x="291" y="50" width="18" height="26" rx="4" stroke={EMBER} strokeWidth="1.2" />
        <motion.circle
          cx="300"
          cy="63"
          r="3.5"
          fill="#ffcf8f"
          animate={{ opacity: [0.7, 1, 0.8] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'mirror' }}
        />
      </motion.g>

      {/* the wheel, spinning */}
      <motion.ellipse cx="180" cy="170" rx="92" ry="16" stroke={BONE} strokeWidth="1.3" {...draw(0.1, 1.2)} />
      <motion.ellipse
        cx="180"
        cy="170"
        rx="74"
        ry="12"
        stroke={EMBER}
        strokeWidth="1"
        strokeDasharray="6 10"
        initial={{ strokeDashoffset: 0, opacity: 0 }}
        animate={{ strokeDashoffset: -160, opacity: 0.8 }}
        transition={{
          strokeDashoffset: { duration: 2, repeat: Infinity, ease: 'linear' },
          opacity: { delay: 0.6, duration: 0.6 },
        }}
      />
      <motion.path d="M120 186 L130 214 M240 186 L230 214" stroke={DIM} strokeWidth="1" {...draw(0.4, 0.8)} />

      {/* clay: a lump that opens up into a bowl */}
      <motion.path
        d={LUMP}
        fill="rgba(232,185,138,0.16)"
        stroke={EMBER}
        strokeWidth="1.3"
        initial={{ opacity: 0, d: LUMP }}
        animate={{ opacity: 1, d: [LUMP, LUMP, BOWL] }}
        transition={{ opacity: { delay: 0.6, duration: 0.6 }, d: { delay: 0.6, duration: 3.4, times: [0, 0.3, 1], ease: 'easeInOut' } }}
      />
      {/* throwing lines spinning round the clay */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${150 + i * 4} ${152 - i * 12} Q180 ${158 - i * 12} ${210 - i * 4} ${152 - i * 12}`}
          stroke={DIM}
          strokeWidth="0.8"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0], x: [-10, 10] }}
          transition={{ delay: 3.4 + i * 0.25, duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      <motion.text x="20" y="214" {...label} {...appear(3.8)}>
        WHEEL · GLAZE · FIRE · KEEP
      </motion.text>
    </g>
  );
}
