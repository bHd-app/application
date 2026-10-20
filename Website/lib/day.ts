// One day, scrubbed by scroll: dawn at the top of the page, midnight at the
// bottom. Everything time-based (sun, moon, experiences, clock) reads from here.

export const DAY_START = 5.5; // 05:30, a little before sunrise
export const DAY_END = 24.0; // midnight

export const SUNRISE = 6.2;
export const SUNSET = 19.6;
export const MOONRISE = 20.6;

// Scroll runway for the whole day.
export const TOTAL_SCROLL_VH = 1100;

const D2R = Math.PI / 180;

export const hourAt = (progress: number) =>
  DAY_START + progress * (DAY_END - DAY_START);
export const progressAt = (hour: number) =>
  (hour - DAY_START) / (DAY_END - DAY_START);

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

// The camera looks out to sea. The sun rises out of the water on the left,
// arcs overhead and sets into the water on the right; the moon then rises on
// the left. Azimuths are compressed so both stay in frame near the horizon.
export function sky(hour: number) {
  const dayFrac = (hour - SUNRISE) / (SUNSET - SUNRISE);
  const sunElev = 62 * Math.sin(Math.PI * dayFrac);
  const sunAzim = -42 + 84 * dayFrac;

  const moonFrac = (hour - MOONRISE) / 10;
  const moonElev = 28 * Math.sin(Math.PI * moonFrac);
  const moonAzim = -35 + 70 * moonFrac;

  // 0 while the sun is up, 1 once it's properly dark.
  const night = Math.min(1, Math.max(0, (-sunElev - 1) / 9));
  // Camera follows the sun by day and the moon by night, so both rise and
  // set inside the frame.
  const follow = Math.min(1, Math.max(0, (hour - SUNSET - 0.1) / 0.9));
  const yaw = (1 - follow) * sunAzim * 0.42 + follow * moonAzim * 0.42;

  return {
    sun: dir(sunElev, sunAzim),
    moon: dir(moonElev, moonAzim),
    sunElev,
    moonElev,
    night,
    yaw: yaw * D2R,
  };
}

export type Experience = {
  id: string;
  /** Hours (24h) the experience is on screen. */
  from: number;
  to: number;
  time: string;
  title: string;
  place: string;
  blurb: string;
  meta: string[];
  icon: 'hike' | 'lunch' | 'cook' | 'pottery';
};

export const EXPERIENCES: Experience[] = [
  {
    id: 'hike',
    from: 6.6,
    to: 10.2,
    time: 'Morning',
    title: 'Sunrise Ridge Hike',
    place: 'Coastal trail',
    blurb: 'Set off at first light and watch the sun lift out of the sea from the ridge.',
    meta: ['3 hours', 'Outdoors', 'Guided'],
    icon: 'hike',
  },
  {
    id: 'lunch',
    from: 12.0,
    to: 15.0,
    time: 'Midday',
    title: 'Long Lunch by the Water',
    place: 'Harbour restaurant',
    blurb: 'A slow, seasonal tasting menu with a table facing the open sea.',
    meta: ['2 hours', 'Food', 'For two'],
    icon: 'lunch',
  },
  {
    id: 'cook',
    from: 16.0,
    to: 19.0,
    time: 'Afternoon',
    title: 'Cooking Workshop',
    place: 'Chef’s kitchen',
    blurb: 'Cook three dishes side by side with a chef, then sit down and eat them.',
    meta: ['3 hours', 'Hands-on', 'Small group'],
    icon: 'cook',
  },
  {
    id: 'pottery',
    from: 20.6,
    to: 23.1,
    time: 'Night',
    title: 'Pottery Under the Stars',
    place: 'Open-air studio',
    blurb: 'Throw your own bowl on the wheel by lantern light and take it home.',
    meta: ['2 hours', 'Craft', 'Keep what you make'],
    icon: 'pottery',
  },
];

/** The closing gift card appears after the last experience. */
export const GIFT_FROM = 23.3;
