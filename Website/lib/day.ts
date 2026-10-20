import { terrain } from './terrain';

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
export const PEAK_ELEV = 17; // degrees: top of the arc, kept inside the frame

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
    // the coastline is laid out for a ~16:10 screen; narrower screens squeeze
    // it part of the way (fully would make the mountains look spiky)
    landScale: Math.sqrt(Math.min(1, halfFovX / 38.7)),
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
    hour: 18.5,
    time: 'Evening',
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

/**
 * Town lights, 0..1. A few shops on the left of the town switch their lights
 * on in the early evening; the rest of the town follows through dusk.
 */
export function townLights(hour: number) {
  const pts: Array<[number, number]> = [
    [17.6, 0], [18.5, 0.42], [19.6, 0.6], [20.6, 0.9], [21.5, 1], [26, 1],
  ];
  if (hour <= pts[0][0]) return 0;
  for (let i = 1; i < pts.length; i++) {
    const [h1, v1] = pts[i];
    const [h0, v0] = pts[i - 1];
    if (hour <= h1) return v0 + ((hour - h0) / (h1 - h0)) * (v1 - v0);
  }
  return 1;
}

/**
 * Where the camera is at each stop: heading (radians, + right), zoom, and
 * position in metres (the viewer starts on the water, 2 m up, at the origin;
 * only the 3D town is drawn with this offset — the sky, sea and mountains are
 * kilometres away and barely shift).
 */
export type Camera = { yaw: number; focal: number; pos: [number, number, number]; pitch: number };

export type Stop = { hour: number; cam: Camera } & (
  | { kind: 'intro' }
  | { kind: 'experience'; exp: Experience; index: number }
  | { kind: 'gift' }
);

/** The buildings the town experiences happen in (azimuth from the origin, distance and ground height in metres). */
export const TOWN_SPOTS = {
  restaurant: { az: 0.2, d: 338, y: 1.6 },
  cook: { az: 0.37, d: 338, y: 1.6 },
  pottery: { az: 0.285, d: 404, y: 7 },
  /** the middle of the town, for the overview */
  center: { az: 0.3, d: 410, y: 4 },
};
type Spot = (typeof TOWN_SPOTS)[keyof typeof TOWN_SPOTS];

/** A camera standing `back` metres in front of a building (and `side` to its right), looking at it. */
function frame(spot: Spot, back: number, height: number, side: number, focal: number, pitch = 0): Camera {
  const bx = Math.sin(spot.az) * spot.d;
  const bz = -Math.cos(spot.az) * spot.d;
  const cx = bx - Math.sin(spot.az) * back + Math.cos(spot.az) * side;
  const cz = bz + Math.cos(spot.az) * back + Math.sin(spot.az) * side;
  return { yaw: Math.atan2(bx - cx, -(bz - cz)), focal, pos: [cx, height, cz], pitch };
}

const ORIGIN: [number, number, number] = [0, 2, 0];

// The hiking trail: from the water, the camera turns and zooms toward the
// mountain so the whole range and the trail climbing it are in view; it
// stays low, so the sea and horizon hold steady.
export const HIKE_SPOT = { x: -2860, z: -3400 }; // middle of the trail
const hikeEye = { x: -650, z: -620 };
const hikeCam: Camera = {
  pos: [hikeEye.x, 6, hikeEye.z],
  yaw: Math.atan2(HIKE_SPOT.x - hikeEye.x, -(HIKE_SPOT.z - hikeEye.z)) + 0.04,
  pitch: 0.02,
  focal: 1.8,
};

const EXPERIENCE_CAMS: Record<Experience['id'], Camera> = {
  hike: hikeCam,
  // midday: the town from the water in front, on its coast with the
  // mountains behind it (the taverna is on its waterfront); then into the streets
  lunch: frame(TOWN_SPOTS.center, 380, 30, 0, 1.25, Math.atan2(4 - 30, 380)),
  cook: frame(TOWN_SPOTS.cook, 44, 3.2, -6, 1.2),
  pottery: frame(TOWN_SPOTS.pottery, 32, 9.2, 5, 1.15, 0.02),
};

export const STOPS: Stop[] = [
  { kind: 'intro', hour: 5.6, cam: { yaw: -0.08, focal: 1.0, pos: ORIGIN, pitch: 0 } },
  ...EXPERIENCES.map(
    (exp, index) =>
      ({ kind: 'experience', hour: exp.hour, exp, index, cam: EXPERIENCE_CAMS[exp.id] }) as const,
  ),
  // the closing shot: the whole moonlit bay from a little above the water
  { kind: 'gift', hour: 23.4, cam: { yaw: -0.22, focal: 1.05, pos: [40, 45, 120], pitch: -0.03 } },
];
