// One day by the sea. The page steps between a few stops (dawn, four
// experiences, the gift card); between stops the clock runs forward like a
// time-lapse. Everything time-based (sun, moon, clock) reads from here.

export const SUNRISE = 6.2;
export const SUNSET = 19.6;
export const MOONRISE = 20.3;
export const MOONSET = 26.3; // moon crosses the sky in 6 h

const D2R = Math.PI / 180;

// Camera: horizontal focal length used by the sky shader (see DaySky.tsx).
// Kept here so the sun's path can be fitted to the visible frame.
export const FOCAL = 1.0;
export const HORIZON_UV = 0.035; // horizon sits this far above screen centre
export const PEAK_ELEV = 21; // degrees: top of the arc, just under the frame top

export function formatHour(hour: number) {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour % 1) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Direction (x right, y up, z toward the viewer) from elevation/azimuth in degrees. */
function dir(elevDeg: number, azimDeg: number): [number, number, number] {
  const e = elevDeg * D2R;
  const a = azimDeg * D2R;
  return [Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)];
}

/**
 * Sun and moon for a given hour. Both travel a half circle across the frame:
 * up from behind the left edge, over the top centre, down past the right edge.
 * `aspect` is the viewport width / height, so the arc fits any screen.
 */
export function sky(hour: number, aspect: number) {
  const halfFovX = Math.atan((aspect * 0.5) / FOCAL) / D2R;
  const reach = halfFovX + 1.5; // rise and set just outside the frame edges

  const f = (hour - SUNRISE) / (SUNSET - SUNRISE);
  // below the horizon the same curve keeps sinking: twilight, then night
  const sunElev = PEAK_ELEV * Math.sin(Math.PI * f);
  const sunAzim = -reach * Math.cos(Math.PI * Math.min(1, Math.max(0, f)));

  const mf = (hour - MOONRISE) / (MOONSET - MOONRISE);
  const moonElev = PEAK_ELEV * 0.92 * Math.sin(Math.PI * mf);
  const moonAzim = -reach * Math.cos(Math.PI * Math.min(1, Math.max(0, mf)));

  // 0 while the sun is up, 1 once it's properly dark.
  const night = Math.min(1, Math.max(0, (-sunElev - 1) / 9));

  return {
    sun: dir(sunElev, sunAzim),
    moon: dir(moonElev, moonAzim),
    sunElev,
    moonElev,
    night,
  };
}

export type Experience = {
  id: 'hike' | 'lunch' | 'cook' | 'pottery';
  /** Hour of day (24h) the page stops at for this experience. */
  hour: number;
  time: string;
  title: string;
  place: string;
  blurb: string;
  facts: Array<{ value: string; label: string }>;
};

export const EXPERIENCES: Experience[] = [
  {
    id: 'hike',
    hour: 8.5,
    time: 'Morning',
    title: 'Sunrise Ridge Hike',
    place: 'Coastal ridge trail',
    blurb:
      'Start in the blue dark, climb the ridge with a guide, and reach the top as the sun clears the sea.',
    facts: [
      { value: '6.2 km', label: 'Trail' },
      { value: '640 m', label: 'Climb' },
      { value: '3 h', label: 'Guided' },
    ],
  },
  {
    id: 'lunch',
    hour: 13.0,
    time: 'Midday',
    title: 'Long Lunch by the Water',
    place: 'Harbour restaurant',
    blurb:
      'Three slow courses from the morning catch, at a table right on the edge of the harbour.',
    facts: [
      { value: '3', label: 'Courses' },
      { value: '2 h', label: 'Table' },
      { value: 'For two', label: 'Seats' },
    ],
  },
  {
    id: 'cook',
    hour: 17.5,
    time: 'Afternoon',
    title: 'Cooking Workshop',
    place: 'Chef’s kitchen',
    blurb:
      'Cook three dishes side by side with a chef, from fresh pasta to dessert, then sit down and eat them.',
    facts: [
      { value: '3', label: 'Dishes' },
      { value: '3 h', label: 'Hands-on' },
      { value: '8', label: 'Guests max' },
    ],
  },
  {
    id: 'pottery',
    hour: 21.5,
    time: 'Night',
    title: 'Pottery Under the Stars',
    place: 'Open-air studio',
    blurb:
      'Throw your own bowl on the wheel by lantern light. We glaze and fire it, and it’s yours to keep.',
    facts: [
      { value: '1', label: 'Bowl to keep' },
      { value: '2 h', label: 'On the wheel' },
      { value: 'All', label: 'Levels' },
    ],
  },
];

export type Stop =
  | { kind: 'intro'; hour: number }
  | { kind: 'experience'; hour: number; exp: Experience; index: number }
  | { kind: 'gift'; hour: number };

export const STOPS: Stop[] = [
  { kind: 'intro', hour: 5.6 },
  ...EXPERIENCES.map(
    (exp, index) => ({ kind: 'experience', hour: exp.hour, exp, index }) as const,
  ),
  { kind: 'gift', hour: 23.4 },
];
