import type { Experience } from '@/lib/day';

// Thin line icons, drawn to match the display type.
export default function ExperienceIcon({
  icon,
  className,
}: {
  icon: Experience['icon'];
  className?: string;
}) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {icon === 'hike' && (
        <g {...common}>
          <path d="M4 40 L18 18 L26 30 L32 22 L44 40 Z" />
          <path d="M18 18 L21.5 23.5 L18.5 25 L15.5 22.6" />
          <circle cx="36" cy="10" r="4" />
        </g>
      )}
      {icon === 'lunch' && (
        <g {...common}>
          <circle cx="24" cy="25" r="12" />
          <circle cx="24" cy="25" r="7.5" />
          <path d="M6 12 V20 M3.5 12 V18 a2.5 2.5 0 0 0 5 0 V12 M6 20 V38" />
          <path d="M42 12 c-3 2 -3 9 0 11 V38" />
        </g>
      )}
      {icon === 'cook' && (
        <g {...common}>
          <path d="M8 24 H34 V32 a6 6 0 0 1 -6 6 H14 a6 6 0 0 1 -6 -6 Z" />
          <path d="M34 26 H43" />
          <path d="M15 18 c-2 -3 2 -5 0 -8 M21 18 c-2 -3 2 -5 0 -8 M27 18 c-2 -3 2 -5 0 -8" />
        </g>
      )}
      {icon === 'pottery' && (
        <g {...common}>
          <path d="M17 10 H31 M18 10 c0 6 -8 9 -8 18 c0 7 6 10 14 10 s14 -3 14 -10 c0 -9 -8 -12 -8 -18" />
          <path d="M6 42 H42" />
          <path d="M14 26 c6 2 14 2 20 0" />
        </g>
      )}
    </svg>
  );
}
