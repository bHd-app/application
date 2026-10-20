'use client';

import { useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';

import { HORIZON_UV, sky, townLights } from '@/lib/day';

// Full-screen sea and sky over a whole day, drawn with WebGL.
//
// Pass 1 renders a small sky lookup texture (azimuth × elevation) with a
// physically based single-scattering atmosphere (Rayleigh + Mie), lit by the
// sun wherever it is — including below the horizon, which gives real twilight
// and earth shadow. Pass 2 draws the frame: sky from the lookup, lit clouds,
// sun, moon and stars, and a sea of sharp-crested waves that reflects all of it.
// The page drives the clock (see lib/day.ts); the camera stays still and the
// sun and moon arc across the frame.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// Shared by both passes.
const COMMON = `
precision highp float;
const float PI = 3.14159265;
const float RANGE = 16.0; // RGBM range of the sky lookup texture

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
`;

const LUT_FRAG = `${COMMON}
uniform vec2 uLutRes;
uniform vec3 uSun;

// Units: km.
const float RE = 6360.0, RA = 6420.0;
const vec3 BR = vec3(5.8e-3, 13.5e-3, 33.1e-3); // Rayleigh scattering, 1/km
const float BM = 11e-3;                          // Mie scattering (haze), 1/km
const float HR = 8.0, HM = 1.2;                  // scale heights, km
const float MIE_G = 0.76;
// Ozone absorbs orange light; without it twilight turns green-yellow instead
// of the deep blue overhead you actually see.
const vec3 BO = vec3(0.65e-3, 1.881e-3, 0.085e-3);
float ozone(float h) { return max(0.0, 1.0 - abs(h - 25.0) / 15.0); }

vec2 raySphere(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - r * r;
  float d = b * b - c;
  if (d < 0.0) return vec2(-1.0);
  d = sqrt(d);
  return vec2(-b - d, -b + d);
}

vec3 atmosphere(vec3 rd, vec3 L) {
  vec3 ro = vec3(0.0, RE + 0.002, 0.0);
  float tmax = raySphere(ro, rd, RA).y;
  float seg = tmax / 14.0;
  float mu = dot(rd, L);
  float phR = 3.0 / (16.0 * PI) * (1.0 + mu * mu);
  float g2 = MIE_G * MIE_G;
  float phM = 3.0 / (8.0 * PI) * ((1.0 - g2) * (1.0 + mu * mu)) /
              ((2.0 + g2) * pow(1.0 + g2 - 2.0 * MIE_G * mu, 1.5));
  vec3 sumR = vec3(0.0), sumM = vec3(0.0);
  float odR = 0.0, odM = 0.0, odO = 0.0;
  for (int i = 0; i < 14; i++) {
    vec3 p = ro + rd * (seg * (float(i) + 0.5));
    float h = length(p) - RE;
    float hr = exp(-h / HR) * seg;
    float hm = exp(-h / HM) * seg;
    odR += hr; odM += hm; odO += ozone(h) * seg;
    float sl = raySphere(p, L, RA).y / 6.0;
    float lR = 0.0, lM = 0.0, lO = 0.0;
    bool lit = true;
    for (int j = 0; j < 6; j++) {
      vec3 pl = p + L * (sl * (float(j) + 0.5));
      float hl = length(pl) - RE;
      if (hl < 0.0) { lit = false; break; } // in the earth's shadow
      lR += exp(-hl / HR) * sl;
      lM += exp(-hl / HM) * sl;
      lO += ozone(hl) * sl;
    }
    if (lit) {
      vec3 att = exp(-(BR * (odR + lR) + BM * 1.1 * (odM + lM) + BO * (odO + lO)));
      sumR += att * hr;
      sumM += att * hm;
    }
  }
  return 22.0 * (sumR * BR * phR + sumM * BM * phM);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uLutRes;
  float az = (uv.x * 2.0 - 1.0) * PI;
  float el = uv.y * uv.y * PI * 0.5; // more rows near the horizon
  vec3 rd = vec3(sin(az) * cos(el), sin(el), -cos(az) * cos(el));
  vec3 c = atmosphere(rd, uSun);
  float m = clamp(max(max(c.r, c.g), max(c.b, 1e-6)) / RANGE, 1.0 / 255.0, 1.0);
  m = ceil(m * 255.0) / 255.0;
  gl_FragColor = vec4(c / (m * RANGE), m);
}
`;

const MAIN_FRAG = `${COMMON}
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uSun;
uniform vec3 uMoon;
uniform float uNight;    // 0 day … 1 full night
uniform float uExposure;
uniform float uStarSpin; // radians, slow rotation of the night sky
uniform sampler2D uLut;
uniform float uLights;    // 0 by day … 1 when the town's lights are all on
uniform float uLandScale; // squeezes the coastline to fit narrow screens
uniform float uYaw;       // camera heading, radians (+ = right)
uniform float uFocal;     // camera focal length (bigger = closer)

const float CAM_H = 2.2;
const float WAVE_H = 1.6;

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3; a *= 0.5; }
  return v;
}

vec3 lut(vec3 rd) {
  float az = atan(rd.x, -rd.z);
  // the lowest rows look along the ground through dense, dim air; stay just above
  float el = asin(clamp(rd.y, 0.02, 1.0));
  vec4 t = texture2D(uLut, vec2(az / (2.0 * PI) + 0.5, sqrt(el / (PI * 0.5))));
  return t.rgb * t.a * RANGE;
}

// Colour of direct sunlight after crossing the atmosphere.
vec3 sunLight() {
  float y = uSun.y;
  float airmass = 1.0 / (max(y, 0.0) + 0.035);
  vec3 tau = vec3(5.8e-3, 13.5e-3, 33.1e-3) * 8.0 + vec3(11e-3 * 1.2 * 1.1) + vec3(0.65e-3, 1.881e-3, 0.085e-3) * 15.0;
  return 22.0 * 0.08 * exp(-tau * airmass) * smoothstep(-0.03, 0.02, y);
}
const vec3 MOON_LIGHT = vec3(0.55, 0.65, 0.9);

// Night sky that the atmosphere model leaves black: deep blue, plus a glow
// around the moon. Display-referred (not affected by exposure).
vec3 nightSky(vec3 rd) {
  float y = max(rd.y, 0.0);
  vec3 c = mix(vec3(0.02, 0.03, 0.06), vec3(0.005, 0.008, 0.02), pow(y, 0.5));
  float mUp = smoothstep(-0.05, 0.05, uMoon.y);
  float s = max(dot(rd, uMoon), 0.0);
  c += MOON_LIGHT * (pow(s, 8.0) * 0.06 + pow(s, 120.0) * 0.12) * mUp;
  // last afterglow low over the horizon where the sun went down
  float side = max(dot(normalize(rd.xz + 1e-4), normalize(uSun.xz + 1e-4)), 0.0);
  c += vec3(0.16, 0.06, 0.08) * exp(-y * 10.0) * pow(side, 3.0) * smoothstep(-0.32, -0.08, uSun.y);
  return c * uNight;
}

vec3 stars(vec3 rd) {
  if (rd.y <= 0.0 || uNight <= 0.0) return vec3(0.0);
  float cs = cos(uStarSpin), sn = sin(uStarSpin);
  vec3 r = vec3(cs * rd.x - sn * rd.y, sn * rd.x + cs * rd.y, rd.z);
  vec2 p = vec2(atan(r.x, -r.z), asin(clamp(r.y, -1.0, 1.0))) * 160.0;
  vec2 cell = floor(p);
  float h = hash(cell);
  if (h < 0.975) return vec3(0.0);
  vec2 off = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5;
  float d = length(fract(p) - 0.5 - off * 0.6);
  float tw = 0.65 + 0.35 * sin(uTime * (1.5 + h * 4.0) + h * 40.0);
  float b = smoothstep(0.22, 0.0, d) * (h - 0.975) * 40.0 * tw;
  vec3 tint = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.9, 0.75), hash(cell + 1.3));
  return tint * b * uNight * smoothstep(0.0, 0.12, rd.y);
}

// Cloud cover: a domain-warped noise field on a flat layer high above.
float cloudDensity(vec2 p) {
  vec2 q = vec2(fbm(p * 0.55), fbm(p * 0.55 + vec2(5.2, 1.3)));
  float n = fbm(p + q * 1.1);
  return clamp((n - 0.5) * 2.6, 0.0, 1.0);
}

// rgb = cloud colour, a = coverage.
vec4 clouds(vec3 rd, vec3 skyCol) {
  if (rd.y <= 0.01) return vec4(0.0);
  vec2 p = rd.xz / (rd.y + 0.035) * 0.75 + vec2(uTime * 0.012, uTime * 0.004);
  float d = cloudDensity(p);
  if (d <= 0.0) return vec4(0.0);
  // light reaching this point through the cloud toward the sun / moon
  vec3 L = uSun.y > -0.1 ? uSun : uMoon;
  float dL = cloudDensity(p + normalize(L.xz + 1e-4) * 0.12);
  float trans = exp(-dL * 2.4);
  float powder = 1.0 - exp(-d * 4.0);
  float s = max(dot(rd, uSun), 0.0);

  vec3 sunCol = sunLight() * uExposure;
  vec3 ambient = lut(vec3(0.0, 1.0, 0.0)) * uExposure * 0.9 + vec3(0.02, 0.03, 0.05) * uNight;
  vec3 col = ambient * (0.55 + 0.45 * (1.0 - d));
  col += sunCol * (0.25 + 0.75 * trans) * powder * 1.3;
  // silver lining when the sun is behind thin cloud
  col += sunCol * pow(s, 10.0) * (1.0 - d) * 2.2;
  // moonlit edges at night
  float ms = max(dot(rd, uMoon), 0.0);
  col += MOON_LIGHT * 0.08 * (0.3 + trans) * uNight * smoothstep(-0.05, 0.05, uMoon.y) * (0.5 + pow(ms, 6.0));
  // haze swallows the far clouds near the horizon
  float a = d * smoothstep(0.01, 0.18, rd.y);
  col = mix(skyCol, col, smoothstep(0.0, 0.25, rd.y) * 0.85 + 0.15);
  return vec4(col, a);
}


// ── Coastline ─────────────────────────────────────────────────────────────
// Everything on land is drawn per direction, with no images or meshes:
//  - a mountain massif on the left (the hike): a skyline, plus a fake height
//    field on its face so it gets gullies, rock strata, forest and snow, all
//    lit by the real sun direction;
//  - a forested headland on the right with a lighthouse;
// Everything shares the sky's light and haze, so it follows the day for free.
// Night lights come on district by district (uLights).

float hash1(float x) { return fract(sin(x * 127.1) * 43758.5453); }
float noise1(float x) {
  float i = floor(x), f = fract(x);
  return mix(hash1(i), hash1(i + 1.0), f * f * (3.0 - 2.0 * f));
}
float fbm1(float x) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) { v += a * noise1(x); x = x * 2.03 + 3.1; a *= 0.5; }
  return v;
}
float ridged1(float x) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { float n = 1.0 - abs(noise1(x) * 2.0 - 1.0); v += a * n * n; x = x * 2.1 + 1.7; a *= 0.5; }
  return v;
}
float ridged2(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { float n = 1.0 - abs(noise(p) * 2.0 - 1.0); v += a * n * n; p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1; a *= 0.5; }
  return v;
}
float bump(float x, float c, float w) { float d = (x - c) / w; return exp(-d * d); }

// A paler range far behind the massif (just a skyline in the haze).
float farRange(float az) {
  float r = 0.07 * bump(az, -0.55, 0.3) + 0.05 * bump(az, -0.05, 0.22);
  return r * (0.8 + 0.4 * fbm1(az * 6.0 + 4.0)) - 0.004;
}
float headland(float az) {
  float h = 0.05 * bump(az, 0.6, 0.15) + 0.026 * bump(az, 0.38, 0.11);
  h *= smoothstep(0.12, 0.26, az);
  float trees = (0.6 * noise1(az * 170.0) + 0.4 * noise1(az * 360.0)) * 0.008;
  return h + trees * smoothstep(0.004, 0.012, h) - 0.002;
}

// Direction the town is lit from. We mostly look toward the sun, which would
// leave every wall facing us in shade; fold the light round to our side so
// facades read with form and texture.
vec3 keyLight(vec3 L) { return normalize(vec3(L.x, L.y, abs(L.z) * 0.55 + 0.1)); }

// Light on a surface with normal n: sky from above, sun and moon, and haze
// toward the horizon colour with distance (km).
vec3 landShade(vec3 rd, vec3 albedo, vec3 n, float ao, float dist) {
  float el = asin(clamp(rd.y, -1.0, 1.0));
  vec3 sky = lut(vec3(0.0, 1.0, 0.0)) * uExposure;
  vec3 hz = lut(normalize(vec3(rd.x, 0.05, rd.z))) * uExposure;
  vec3 amb = (sky * (0.18 + 0.16 * n.y) + hz * 0.1) * ao + vec3(0.012, 0.018, 0.035) * uNight * ao;
  float sunUp = clamp(uSun.y * 3.0 + 0.1, 0.0, 1.0);
  vec3 lit = amb
    + sunLight() * uExposure * sunUp * max(dot(n, keyLight(uSun)), 0.0) * 1.5
    + MOON_LIGHT * 0.07 * uNight * smoothstep(0.0, 0.1, uMoon.y) * max(dot(n, keyLight(uMoon)), 0.0);
  vec3 c = albedo * lit;
  vec3 horiz = normalize(vec3(rd.x, 0.015, rd.z));
  float fog = 1.0 - exp(-dist / 22.0) + 0.12 * exp(-max(el, 0.0) / 0.014) * step(1.0, dist);
  return mix(c, lut(horiz) * uExposure + nightSky(horiz), clamp(fog, 0.0, 1.0));
}

// ── The mountain: a real height field, ray-marched ─────────────────────────
// World units are km; the camera stands 2 m above the sea at the origin,
// looking along -z. The massif sits 5–8 km away on the left: a main summit,
// a second top, a lower shoulder and ridges running down to the shore.
float cone(vec2 p, vec2 c, float r) {
  float d = length(p - c) / r;
  return mix(exp(-2.2 * d), exp(-2.5 * d * d), 0.45);
}
float massif(vec2 p) {
  return 1.2 * cone(p, vec2(-2.25, -5.7), 2.7)
       + 0.78 * cone(p, vec2(-4.7, -6.2), 2.4)
       + 0.48 * cone(p, vec2(-0.85, -5.0), 1.7)
       + 0.4 * cone(p, vec2(-6.6, -3.9), 2.8)
       + 0.25 * cone(p, vec2(-3.3, -3.6), 1.6); // a spur running toward us
}
float ridged3(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { float n = 1.0 - abs(noise(p) * 2.0 - 1.0); v += a * n * n; p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1; a *= 0.5; }
  return v;
}
// Coarse terrain for marching and shadows; fine adds small rock detail for normals.
float terrainCoarse(vec2 p) {
  float b = massif(p);
  float e = ridged3(p * 1.5 + 4.0);
  return b + (e - 0.42) * 0.32 * smoothstep(0.04, 0.7, b) - 0.07;
}
float terrainFine(vec2 p) {
  float b = massif(p);
  float e = ridged2(p * 1.5 + 4.0);
  return b + (e - 0.42) * 0.32 * smoothstep(0.04, 0.7, b) - 0.07 + (fbm(p * 9.0) - 0.5) * 0.035;
}

// March a ray against the terrain; returns distance (km) or -1.
float marchTerrain(vec3 ro, vec3 rd, int quality) {
  // only the left part of the view holds the massif
  if (rd.y > 0.27 || rd.y < -0.003 || rd.x > 0.25 * -rd.z) return -1.0;
  float t = 1.5;
  float lastT = t;
  for (int i = 0; i < 100; i++) {
    if (quality == 0 && i >= 40) break;
    vec3 p = ro + rd * t;
    float d = p.y - terrainCoarse(p.xz);
    if (d < 0.0) {
      // bisect between the last two samples so slopes don't show steps
      float a = lastT, b = t;
      for (int k = 0; k < 5; k++) {
        float m = 0.5 * (a + b);
        vec3 q = ro + rd * m;
        if (q.y - terrainCoarse(q.xz) < 0.0) b = m; else a = m;
      }
      return 0.5 * (a + b);
    }
    if (p.y > 1.35) break; // above the highest summit and still climbing
    lastT = t;
    t += max(0.006 * t, d * 0.45);
    if (t > 26.0) break;
  }
  return -1.0;
}

float terrainShadow(vec3 p, vec3 L) {
  if (L.y < -0.02) return 0.0;
  float res = 1.0, t = 0.05;
  for (int i = 0; i < 10; i++) {
    vec3 q = p + L * t;
    float d = q.y - terrainCoarse(q.xz);
    res = min(res, 10.0 * d / t);
    if (res < 0.02) break;
    t += max(0.08, d * 0.6);
  }
  return clamp(res, 0.0, 1.0);
}

vec3 shadeTerrain(vec3 rd, float t, bool fine) {
  vec3 p = vec3(0.0, 0.002, 0.0) + rd * t;
  const float e = 0.012;
  vec3 n = fine
    ? normalize(vec3(terrainFine(p.xz - vec2(e, 0.0)) - terrainFine(p.xz + vec2(e, 0.0)), 2.0 * e,
                     terrainFine(p.xz - vec2(0.0, e)) - terrainFine(p.xz + vec2(0.0, e))))
    : normalize(vec3(terrainCoarse(p.xz - vec2(e * 4.0, 0.0)) - terrainCoarse(p.xz + vec2(e * 4.0, 0.0)), 8.0 * e,
                     terrainCoarse(p.xz - vec2(0.0, e * 4.0)) - terrainCoarse(p.xz + vec2(0.0, e * 4.0))));
  float h = p.y;
  float slope = n.y;

  // materials by height and steepness: forest low down, rock, snow on top
  float treeLine = 0.36 + 0.08 * noise(p.xz * 3.0);
  float forest = (1.0 - smoothstep(treeLine - 0.05, treeLine + 0.03, h)) * smoothstep(0.55, 0.7, slope);
  float snowLine = 0.55 + 0.1 * noise(p.xz * 2.5);
  float snow = smoothstep(snowLine, snowLine + 0.08, h + 0.12 * (slope - 0.6)) * smoothstep(0.35, 0.6, slope);
  snow = max(snow, smoothstep(0.85, 1.0, h) * smoothstep(0.15, 0.4, slope)); // the summit is white
  vec3 rock = mix(vec3(0.33, 0.3, 0.28), vec3(0.52, 0.48, 0.43), noise(p.xz * 18.0));
  rock *= 0.85 + 0.25 * noise(vec2(h * 60.0, p.x * 3.0)); // strata
  vec3 scrub = vec3(0.32, 0.31, 0.22);
  float tex = fine ? noise(p.xz * 140.0) : 0.5;
  vec3 trees = vec3(0.04, 0.07, 0.045) * (0.6 + 0.9 * tex);
  vec3 alb = mix(rock, scrub, smoothstep(treeLine + 0.15, treeLine, h) * 0.6);
  alb = mix(alb, trees, forest);
  alb = mix(alb, vec3(0.92, 0.94, 0.98), snow);
  // a pale beach where the land meets the water
  alb = mix(alb, vec3(0.7, 0.64, 0.52), smoothstep(0.03, 0.0, h));

  // as with the town, fold the sunlight partly round to our side so the
  // mountain's form reads even when the sun is behind it
  vec3 L = normalize(mix(uSun, keyLight(uSun), 0.6));
  float sh = fine ? terrainShadow(p + n * 0.01, L) : 1.0;
  vec3 sky = lut(vec3(0.0, 1.0, 0.0)) * uExposure;
  vec3 amb = sky * (0.22 + 0.25 * n.y) + vec3(0.012, 0.018, 0.035) * uNight;
  float sunUp = clamp(uSun.y * 3.0 + 0.1, 0.0, 1.0);
  vec3 lit = amb
    + sunLight() * uExposure * sunUp * max(dot(n, L), 0.0) * sh * 2.0
    + MOON_LIGHT * 0.09 * uNight * smoothstep(0.0, 0.1, uMoon.y) * max(dot(n, uMoon), 0.0);
  vec3 c = alb * lit;
  // haze with distance, thicker low down
  vec3 horiz = normalize(vec3(rd.x, 0.015, rd.z));
  float fog = 1.0 - exp(-t / 30.0) * exp(-0.2 * exp(-h / 0.2));
  return mix(c, lut(horiz) * uExposure + nightSky(horiz), clamp(fog, 0.0, 1.0));
}

// rgb = land colour, a = coverage; glow = light from lamps, added on top.
vec4 landscape(vec3 rd, bool fine, out vec3 glow) {
  glow = vec3(0.0);
  float az = atan(rd.x, -rd.z) / uLandScale;
  float el = asin(clamp(rd.y, -1.0, 1.0));
  float px = 1.2 / (uRes.y * uFocal); // one pixel, in radians
  vec4 o = vec4(0.0);

  // far range, ~25 km: pale and blue with distance
  float fr = farRange(az);
  float fra = smoothstep(-px, px, fr - el);
  if (fra > 0.0) {
    float sl = (farRange(az + 0.01) - farRange(az - 0.01)) / 0.02;
    vec3 n = normalize(vec3(-sl * 2.0, 0.5, 0.85));
    o = vec4(landShade(rd, vec3(0.32, 0.32, 0.33), n, 0.9, 25.0), fra);
  }

  // the massif, a real 3D height field (squeezed with the rest on narrow screens)
  vec3 rdT = normalize(vec3(sin(az) * cos(el), sin(el), -cos(az) * cos(el)));
  float tm = marchTerrain(vec3(0.0, 0.002, 0.0), rdT, fine ? 1 : 0);
  if (tm > 0.0) o = vec4(shadeTerrain(rdT, tm, fine), 1.0);

  // forested headland, ~3 km
  float h = headland(az);
  float ha = smoothstep(-px, px, h - el);
  if (ha > 0.0) {
    float sl = (headland(az + 0.006) - headland(az - 0.006)) / 0.012;
    float tex = fine ? fbm(vec2(az * 260.0, el * 260.0)) : 0.5;
    vec3 n = normalize(vec3(-sl * 1.5 + (tex - 0.5) * 0.8, 0.6, 0.8));
    o = mix(o, vec4(landShade(rd, vec3(0.06, 0.1, 0.06) * (0.7 + 0.6 * tex), n, 0.8, 3.0), 1.0), ha);
  }

  // lighthouse on the tip of the headland
  float lhAz = 0.76, lhBase = headland(lhAz);
  float inTower = step(abs(az - lhAz), 0.0018) * step(el, lhBase + 0.014) * step(lhBase - 0.004, el);
  if (inTower > 0.0) {
    vec3 alb = mix(vec3(0.88, 0.85, 0.8), vec3(0.62, 0.12, 0.1), step(0.5, fract((el - lhBase) / 0.0045)));
    o = mix(o, vec4(landShade(rd, alb, vec3(0.0, 0.0, 1.0), 1.0, 2.6), 1.0), inTower);
  }
  vec2 lamp = vec2(az - lhAz, el - (lhBase + 0.0155));
  float sweep = pow(max(cos(uTime * 1.3), 0.0), 18.0);
  glow += vec3(1.0, 0.92, 0.75) * exp(-dot(lamp, lamp) / 0.0000012) * (0.6 + 4.0 * sweep) * uLights;

  // (the harbour town itself is real 3D geometry, drawn by town/Town.tsx)
  return o;
}

vec3 skyColor(vec3 rd, bool discs) {
  vec3 c = lut(rd) * uExposure + nightSky(rd) + stars(rd);
  if (discs) {
    // sun
    float s = dot(rd, uSun);
    float r = acos(clamp(s, -1.0, 1.0)) / 0.0095;
    float limb = sqrt(max(1.0 - r * r, 0.0));
    c += sunLight() * uExposure * 60.0 * smoothstep(0.0, 0.1, limb) * (0.6 + 0.4 * limb);
    // moon: full disc with faint maria
    float m = dot(rd, uMoon);
    float mr = acos(clamp(m, -1.0, 1.0)) / 0.0115;
    if (mr < 1.0 && uMoon.y > -0.02) {
      vec3 side = normalize(cross(uMoon, vec3(0.0, 1.0, 0.0)));
      vec3 up = cross(side, uMoon);
      vec2 mp = vec2(dot(rd - uMoon, side), dot(rd - uMoon, up)) / 0.0115;
      float maria = fbm(mp * 2.5 + 3.0);
      float lit = smoothstep(1.0, 0.92, mr) * (0.75 + 0.25 * sqrt(max(1.0 - mr * mr, 0.0)));
      vec3 mc = vec3(1.0, 0.97, 0.9) * (1.05 - 0.4 * smoothstep(0.45, 0.7, maria));
      c = mix(c, mc * 1.4, lit * smoothstep(-0.02, 0.03, uMoon.y));
    }
  }
  vec4 cl = clouds(rd, c);
  c = mix(c, cl.rgb, cl.a);
  // land sits in front of the sky; lights add on top
  vec3 glow;
  vec4 land = landscape(rd, discs, glow);
  return mix(c, land.rgb, land.a) + glow;
}

// Sea height (0..1) from a sum of sharp-crested waves. Each wave drags the
// sample point along its slope, which bunches crests together like real swell.
// "detail" limits the number of octaves far from the camera (anti-aliasing).
float seaHeight(vec2 p, float detail) {
  float ang = 0.0, freq = 0.12, speed = 0.7, w = 1.0;
  float sumH = 0.0, sumW = 0.0;
  for (int i = 0; i < 26; i++) {
    if (float(i) > detail) break;
    vec2 d = vec2(sin(ang), cos(ang));
    float x = dot(d, p) * freq + uTime * speed;
    float wave = exp(sin(x) - 1.0);
    float dx = wave * cos(x);
    sumH += wave * w;
    sumW += w;
    p -= d * dx * w * 0.018 / freq;
    w *= 0.85; freq *= 1.18; speed *= 1.05; ang += 12.17;
  }
  return sumH / sumW;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 rd = normalize(vec3(uv.x, uv.y - ${HORIZON_UV.toFixed(4)}, -uFocal));
  float cy = cos(uYaw), sy = sin(uYaw);
  rd = vec3(cy * rd.x - sy * rd.z, rd.y, sy * rd.x + cy * rd.z);

  vec3 col;
  if (rd.y >= 0.0) {
    col = skyColor(rd, true);
  } else {
    float t = (CAM_H - WAVE_H * 0.5) / -rd.y;
    vec2 p = rd.xz * t;
    float detail = mix(26.0, 6.0, clamp(t / 260.0, 0.0, 1.0));
    float e = 0.03 + t * 0.0012;
    float h = seaHeight(p, detail);
    float hx = seaHeight(p + vec2(e, 0.0), detail);
    float hz = seaHeight(p + vec2(0.0, e), detail);
    vec3 n = normalize(vec3((h - hx) * WAVE_H, e, (h - hz) * WAVE_H));
    n = normalize(mix(n, vec3(0.0, 1.0, 0.0), clamp(t / 3000.0, 0.0, 0.5)));

    vec3 refl = reflect(rd, n);
    refl.y = abs(refl.y);
    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);

    vec3 sunCol = sunLight() * uExposure;
    vec3 ambient = lut(vec3(0.0, 1.0, 0.0)) * uExposure + vec3(0.015, 0.025, 0.05) * uNight;
    // water body: blue-green, lit by the sky above it
    vec3 water = vec3(0.02, 0.09, 0.12) * ambient * (0.6 + 0.4 * n.y) * 1.3;
    // light shining through thin crests when looking toward the sun
    float toward = max(dot(normalize(rd.xz), normalize(uSun.xz + 1e-4)), 0.0);
    water += vec3(0.06, 0.3, 0.26) * sunCol * pow(max(h - 0.35, 0.0), 2.0) * (0.25 + pow(toward, 3.0)) * 0.4;

    col = mix(water, skyColor(refl, false), fres);

    // sun and moon glitter: a tight core plus a wider sheen along the path
    vec3 hs = normalize(uSun - rd);
    float nh = max(dot(n, hs), 0.0);
    col += sunCol * (pow(nh, 2400.0) * 60.0 + pow(nh, 260.0) * 2.0 + pow(nh, 30.0) * 0.05);
    vec3 hm = normalize(uMoon - rd);
    float nm = max(dot(n, hm), 0.0);
    col += MOON_LIGHT * (pow(nm, 1800.0) * 3.5 + pow(nm, 160.0) * 0.12) * uNight * smoothstep(-0.02, 0.04, uMoon.y);

    // a touch of foam on the sharpest crests close by
    float foam = smoothstep(0.86, 0.97, h) * exp(-t * 0.02);
    col = mix(col, ambient * 0.8 + sunCol * 0.4, foam * 0.3);

    // aerial perspective toward the horizon
    float fog = 1.0 - exp(-t * 0.0022);
    vec3 horizDir = normalize(vec3(rd.x, 0.0, rd.z));
    col = mix(col, lut(horizDir) * uExposure + nightSky(horizDir), fog);
  }

  col = aces(col);
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0; // dither
  gl_FragColor = vec4(col, 1.0);
}
`;

const LUT_W = 192;
const LUT_H = 96;

export default function DaySky({
  hour,
  yaw,
  focal,
  /** Render resolution relative to CSS pixels (device pixel ratio capped at 1.5). */
  renderScale = 0.8,
}: {
  /** Hour of the day, 0..24 (may run past 24 for the late moon). */
  hour: MotionValue<number>;
  /** Camera heading (radians) and zoom, animated between stops. */
  yaw: MotionValue<number>;
  focal: MotionValue<number>;
  renderScale?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return; // the CSS gradient behind the canvas stays as the fallback

    const program = (frag: string) => {
      const p = gl.createProgram()!;
      for (const [type, src] of [
        [gl.VERTEX_SHADER, VERT],
        [gl.FRAGMENT_SHADER, frag],
      ] as const) {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.error(gl.getShaderInfoLog(s));
        }
        gl.attachShader(p, s);
      }
      gl.bindAttribLocation(p, 0, 'aPos');
      gl.linkProgram(p);
      return p;
    };
    const lutProg = program(LUT_FRAG);
    const mainProg = program(MAIN_FRAG);
    const u = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Sky lookup texture + framebuffer.
    const lutTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, lutTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, LUT_W, LUT_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, lutTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const L = {
      res: u(lutProg, 'uLutRes'),
      sun: u(lutProg, 'uSun'),
    };
    const M = {
      res: u(mainProg, 'uRes'),
      time: u(mainProg, 'uTime'),
      sun: u(mainProg, 'uSun'),
      moon: u(mainProg, 'uMoon'),
      night: u(mainProg, 'uNight'),
      exposure: u(mainProg, 'uExposure'),
      starSpin: u(mainProg, 'uStarSpin'),
      lights: u(mainProg, 'uLights'),
      landScale: u(mainProg, 'uLandScale'),
      yaw: u(mainProg, 'uYaw'),
      focal: u(mainProg, 'uFocal'),
      lut: u(mainProg, 'uLut'),
    };

    let W = 0;
    let H = 0;
    // Lowered automatically on slow GPUs (see the frame timer in draw()).
    let scale = renderScale;
    const resize = () => {
      const s = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
      W = Math.max(1, Math.round(canvas.clientWidth * s));
      H = Math.max(1, Math.round(canvas.clientHeight * s));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    let lastSunKey = '';
    let frame = 0;
    // Adaptive quality: if frames run long (integrated / older GPUs), drop the
    // render resolution step by step until the scroll stays smooth. The sea
    // and sky are soft, so a lower resolution is hard to notice; dropped
    // frames are not.
    let last = 0;
    let avgMs = 16.7;
    let settle = 0;
    const draw = (now: number) => {
      if (last) {
        const dt = now - last;
        // ignore one-off stalls (tab switch, GC) — only sustained slowness counts
        if (dt < 60) avgMs += (dt - avgMs) * 0.05;
        if (++settle > 90 && avgMs > 21 && scale > 0.32) {
          scale = Math.max(0.32, scale * 0.8);
          resize();
          settle = 0;
          avgMs = 16.7;
        }
      }
      last = now;
      const h = hour.get();
      const s = sky(h, canvas.clientWidth / Math.max(1, canvas.clientHeight));

      // The sky only changes when the sun moves; skip the lookup pass otherwise.
      const sunKey = s.sun.map((v) => v.toFixed(4)).join();
      if (sunKey !== lastSunKey) {
        lastSunKey = sunKey;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, LUT_W, LUT_H);
        gl.useProgram(lutProg);
        gl.uniform2f(L.res, LUT_W, LUT_H);
        gl.uniform3fv(L.sun, s.sun);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }

      // Brighten the picture as the light fades (eyes adapting), so twilight
      // stays readable; full night is carried by the moon and stars.
      const t = Math.min(1, Math.max(0, (4 - s.sunElev) / 14));
      const exposure = 0.75 + t * t * t * 40;

      gl.viewport(0, 0, W, H);
      gl.useProgram(mainProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, lutTex);
      gl.uniform1i(M.lut, 0);
      gl.uniform2f(M.res, W, H);
      gl.uniform1f(M.time, (now - start) / 1000);
      gl.uniform3fv(M.sun, s.sun);
      gl.uniform3fv(M.moon, s.moon);
      gl.uniform1f(M.night, s.night);
      gl.uniform1f(M.exposure, exposure);
      gl.uniform1f(M.starSpin, h * 0.04);
      gl.uniform1f(M.lights, townLights(h));
      gl.uniform1f(M.landScale, s.landScale);
      // narrow screens turn and zoom less, so the whole subject stays in frame
      gl.uniform1f(M.yaw, yaw.get() * s.landScale);
      gl.uniform1f(M.focal, 1 + (focal.get() - 1) * s.landScale * s.landScale);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [hour, yaw, focal, renderScale]);

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'linear-gradient(to bottom, #3b6ea8 0%, #a9c7e0 48%, #1d4a5c 52%, #06141c 100%)',
      }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
