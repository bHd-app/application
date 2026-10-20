'use client';

import { useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';

// Full-screen sunset sea drawn with a single WebGL fragment shader.
// Inspired by github.com/Noniv/web-ocean (a full WebGPU FFT ocean), but written
// from scratch as a light background: a sky with sun and soft clouds, and a sea
// made of sharp-crested directional waves with Fresnel sky reflection, light
// through the crests and sun glitter.
// Scroll progress lowers the sun (golden hour → dusk) and slowly turns the camera.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uSunElev; // radians
uniform float uYaw;     // radians

const float CAM_H = 2.2;   // eye height above the mean sea level, metres
const float WAVE_H = 1.7;  // crest-to-trough height of the swell
// Sun sits off to the left so it isn't hidden behind the photo cards.
const float SUN_AZIM = -0.55;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}

vec3 sunDir() {
  float c = cos(uSunElev);
  return normalize(vec3(sin(SUN_AZIM) * c, sin(uSunElev), -cos(SUN_AZIM) * c));
}
// 0 at dusk (sun just under the horizon), 1 at golden hour.
float dayAmount() { return clamp((uSunElev + 0.03) / 0.11, 0.0, 1.0); }
// Sunlight reddens as it crosses more atmosphere near the horizon.
vec3 sunColor() {
  return mix(vec3(1.0, 0.32, 0.1), vec3(1.0, 0.6, 0.3), dayAmount());
}

vec3 sky(vec3 rd, bool withSun) {
  vec3 sd = sunDir();
  float day = dayAmount();
  float y = max(rd.y, 0.0);
  float s = max(dot(rd, sd), 0.0);
  // how much this direction faces the sun's side of the sky (horizontal only)
  float side = 0.5 + 0.5 * dot(normalize(rd.xz + 1e-4), normalize(sd.xz));

  vec3 zenith = mix(vec3(0.025, 0.03, 0.09), vec3(0.06, 0.11, 0.3), day);
  vec3 horizonSun = mix(vec3(0.7, 0.18, 0.06), vec3(1.0, 0.45, 0.16), day);
  vec3 horizonAway = mix(vec3(0.14, 0.07, 0.16), vec3(0.3, 0.17, 0.27), day);
  vec3 horizon = mix(horizonAway, horizonSun, pow(side, 2.5));
  vec3 col = mix(horizon, zenith, pow(y, 0.38));
  // a thin bright band right at the horizon
  col += horizonSun * 0.18 * exp(-y * 40.0) * (0.3 + 0.7 * side);

  // layered forward scattering around the sun
  vec3 sc = sunColor();
  col += sc * (pow(s, 4.0) * 0.22 + pow(s, 24.0) * 0.4 + pow(s, 300.0) * 1.2) * (1.0 - 0.5 * y);

  if (withSun) {
    // disc with limb darkening, softly flattened by the horizon
    float r = acos(min(s, 1.0)) / 0.0105; // 1 at the disc edge
    float limb = sqrt(max(1.0 - r * r, 0.0));
    col += sc * vec3(1.0, 0.85, 0.7) * 5.0 * smoothstep(0.0, 0.08, limb) * (0.55 + 0.45 * limb);
  }

  if (rd.y > 0.0) {
    vec2 uv = rd.xz / (rd.y + 0.05);
    float lit = 0.35 + 0.65 * pow(s, 3.0);
    // high, stretched cirrus
    float ci = fbm(uv * vec2(0.35, 1.6) + vec2(uTime * 0.004, 0.0));
    ci = smoothstep(0.55, 0.9, ci) * 0.5;
    // lower, broken clouds with bright rims toward the sun
    vec2 cp = uv * 1.1 + vec2(uTime * 0.01, 3.0);
    float cl = fbm(cp);
    float dens = smoothstep(0.5, 0.78, cl);
    float rim = smoothstep(0.5, 0.58, cl) - smoothstep(0.6, 0.75, cl);
    vec3 shade = mix(vec3(0.16, 0.1, 0.14), vec3(0.62, 0.36, 0.3), day * 0.7 + 0.3);
    vec3 cloudCol = mix(shade, sc * 1.1, lit * 0.6) + sc * rim * pow(s, 6.0) * 1.6;
    float fadeIn = smoothstep(0.0, 0.15, rd.y);
    col = mix(col, mix(col, sc * 1.2, 0.5) * (0.4 + lit), ci * fadeIn);
    col = mix(col, cloudCol, dens * fadeIn * 0.9);
  }
  return col;
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
  float pitch = -0.035;
  vec3 rd = normalize(vec3(uv.x, uv.y + pitch, -1.3));
  float cy = cos(uYaw), sy = sin(uYaw);
  rd = vec3(cy * rd.x - sy * rd.z, rd.y, sy * rd.x + cy * rd.z);

  vec3 sd = sunDir();
  vec3 sc = sunColor();
  float day = dayAmount();
  vec3 col;
  if (rd.y >= -0.0005) {
    col = sky(rd, true);
  } else {
    // intersect the mid-wave plane
    float t = (CAM_H - WAVE_H * 0.5) / -rd.y;
    vec2 p = rd.xz * t;
    float detail = mix(26.0, 6.0, clamp(t / 260.0, 0.0, 1.0));
    float e = 0.03 + t * 0.0012; // wider normal footprint far away
    float h = seaHeight(p, detail);
    float hx = seaHeight(p + vec2(e, 0.0), detail);
    float hz = seaHeight(p + vec2(0.0, e), detail);
    vec3 n = normalize(vec3((h - hx) * WAVE_H, e, (h - hz) * WAVE_H));
    // flatten normals toward the horizon so it settles into a calm sheen
    n = normalize(mix(n, vec3(0.0, 1.0, 0.0), clamp(t / 3000.0, 0.0, 0.5)));

    vec3 refl = reflect(rd, n);
    refl.y = abs(refl.y);
    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);

    // water body: deep blue-green, lit from the sky
    vec3 deep = mix(vec3(0.004, 0.018, 0.03), vec3(0.012, 0.06, 0.085), day);
    vec3 water = deep * (0.6 + 0.4 * max(n.y, 0.0));
    // light shining through thin crests when looking toward the sun
    vec2 fwd = normalize(rd.xz);
    float toward = max(dot(fwd, normalize(sd.xz)), 0.0);
    water += vec3(0.05, 0.22, 0.2) * sc * pow(max(h - 0.35, 0.0), 2.0) * (0.3 + pow(toward, 3.0)) * (0.2 + day);

    col = mix(water, sky(refl, false), fres);

    // sun glitter: a tight core plus a wider sheen along the sun's path
    vec3 hv = normalize(sd - rd);
    float nh = max(dot(n, hv), 0.0);
    float sunUp = smoothstep(-0.035, 0.01, uSunElev);
    col += sc * (pow(nh, 2400.0) * 40.0 + pow(nh, 260.0) * 2.2 + pow(nh, 30.0) * 0.12) * sunUp;

    // a touch of foam on the sharpest crests close by
    float foam = smoothstep(0.86, 0.97, h) * exp(-t * 0.02);
    col = mix(col, sky(vec3(0.0, 1.0, 0.0), false) * 0.6 + sc * 0.25, foam * 0.35);

    // aerial perspective toward the horizon
    float fog = 1.0 - exp(-t * 0.0022);
    col = mix(col, sky(normalize(vec3(rd.x, 0.0005, rd.z)), false), fog);
  }

  col = aces(col * 0.95);
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0; // dither
  gl_FragColor = vec4(col, 1.0);
}
`;

const D2R = Math.PI / 180;

export default function OceanBackground({
  progress,
  /** Render resolution relative to CSS pixels (device pixel ratio capped at 1.5). */
  renderScale = 0.8,
}: {
  progress: MotionValue<number>;
  renderScale?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return; // CSS gradient behind the canvas stays as the fallback

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
      }
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uSunElev = gl.getUniformLocation(prog, 'uSunElev');
    const uYaw = gl.getUniformLocation(prog, 'uYaw');

    const resize = () => {
      const s = Math.min(window.devicePixelRatio || 1, 1.5) * renderScale;
      const w = Math.max(1, Math.round(canvas.clientWidth * s));
      const h = Math.max(1, Math.round(canvas.clientHeight * s));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      const p = progress.get();
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform1f(uSunElev, (3.6 - 5.1 * p) * D2R); // 3.6° → -1.5°
      gl.uniform1f(uYaw, (-10 + 18 * p) * D2R);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [progress, renderScale]);

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'linear-gradient(to bottom, #1d2b4a 0%, #c46a45 48%, #12202a 52%, #050a10 100%)',
      }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
