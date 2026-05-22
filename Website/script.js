/* ---------- helpers ---------- */
function clamp(v, a = 0, b = 1) {
  return Math.min(b, Math.max(a, v));
}
function seededRandom(seed) {
  let state = seed;
  return function () {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/* ---------- stars: paint + parallax + proximity sparkle ---------- */
function paintStars(container, count, seed) {
  const rand = seededRandom(seed);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    star.className = "star";
    // size variance: mostly small, occasional big
    const sizeRoll = rand();
    let size;
    if (sizeRoll > 0.96) size = 4 + rand() * 3;
    else if (sizeRoll > 0.8) size = 2.4 + rand() * 1.6;
    else size = 1 + rand() * 1.6;
    star.style.left = (rand() * 100).toFixed(2) + "%";
    star.style.top = (rand() * 100).toFixed(2) + "%";
    star.style.width = size.toFixed(2) + "px";
    star.style.height = size.toFixed(2) + "px";

    // color variety
    const colorRoll = rand();
    let tint;
    if (colorRoll > 0.94) tint = "rgb(255, 230, 180)"; // warm gold
    else if (colorRoll > 0.88) tint = "rgb(210, 225, 255)"; // cool blue
    else tint = "#fff";
    star.style.background = tint;
    star.style.setProperty("--tint", tint);

    const max = 0.5 + rand() * 0.5;
    const min = max * (0.08 + rand() * 0.25);
    star.style.setProperty("--opacity-max", max.toFixed(2));
    star.style.setProperty("--opacity-min", min.toFixed(2));
    const depth = (rand() * 0.85 + 0.15).toFixed(2);
    star.style.setProperty("--depth", depth);
    const dur = (1.6 + rand() * 4.4).toFixed(2) + "s";
    const delay = (rand() * 5).toFixed(2) + "s";
    star.style.setProperty("--twinkle-dur", dur);
    star.style.setProperty("--twinkle-delay", delay);
    star.style.opacity = max.toFixed(2);
    frag.appendChild(star);
  }
  container.appendChild(frag);
}

document.querySelectorAll(".stars").forEach((node, index) => {
  paintStars(node, 480, 1337 + index * 91);
});

const starContainers = document.querySelectorAll(".stars");
let parallaxTicking = false;
function updateParallax() {
  const vh = window.innerHeight;
  starContainers.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const t = (center - vh / 2) / vh;
    el.style.setProperty("--rel-scroll", t.toFixed(3));
  });
  parallaxTicking = false;
}
function requestParallax() {
  if (parallaxTicking) return;
  parallaxTicking = true;
  requestAnimationFrame(updateParallax);
}
window.addEventListener("resize", updateParallax);
updateParallax();

/* Per-star proximity sparkle */
const starCache = [];
function recomputeStarPositions() {
  starCache.length = 0;
  document.querySelectorAll(".hero .star").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
    starCache.push({
      el,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      lastBoost: 0,
    });
  });
}
let recomputePending = false;
function requestRecompute() {
  if (recomputePending) return;
  recomputePending = true;
  requestAnimationFrame(() => {
    recomputeStarPositions();
    recomputePending = false;
  });
}
window.addEventListener("resize", requestRecompute);

let mouseX = -9999,
  mouseY = -9999;
window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function sparkleLoop() {
  const r = 160;
  const r2 = r * r;
  for (let i = 0; i < starCache.length; i++) {
    const s = starCache[i];
    const dx = s.cx - mouseX;
    const dy = s.cy - mouseY;
    const d2 = dx * dx + dy * dy;
    let boost = 0;
    if (d2 < r2) {
      boost = 1 - Math.sqrt(d2) / r;
      boost = boost * boost; // sharper falloff
    }
    if (Math.abs(boost - s.lastBoost) > 0.01) {
      s.lastBoost = boost;
      s.el.style.setProperty("--boost", boost.toFixed(3));
    }
  }
  requestAnimationFrame(sparkleLoop);
}
recomputeStarPositions();
sparkleLoop();

/* ---------- shooting stars every 2s ---------- */
function spawnShootingStar(container) {
  if (!container) return;
  const star = document.createElement("span");
  star.className = "shooting-star";
  const fromLeft = Math.random() > 0.5;
  const startX = fromLeft ? -8 : 108;
  const startY = Math.random() * 55;
  const baseAngle = fromLeft ? 25 : 155;
  const angle = baseAngle + (Math.random() - 0.5) * 18;
  const distance = 135;
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * distance;
  const dy = Math.sin(rad) * distance;
  star.style.setProperty("--start-x", startX + "vw");
  star.style.setProperty("--start-y", startY + "vh");
  star.style.setProperty("--travel-x", dx + "vw");
  star.style.setProperty("--travel-y", dy + "vh");
  star.style.setProperty("--angle", angle + "deg");
  const duration = 1100 + Math.random() * 500;
  star.style.setProperty("--dur", duration + "ms");
  container.appendChild(star);
  setTimeout(() => star.remove(), duration + 200);
}

function visibleStarContainers() {
  const vh = window.innerHeight;
  return Array.from(document.querySelectorAll(".stars")).filter((c) => {
    const r = c.getBoundingClientRect();
    return r.bottom > 0 && r.top < vh;
  });
}

setInterval(() => {
  const containers = visibleStarContainers();
  if (!containers.length) return;
  const pick = containers[Math.floor(Math.random() * containers.length)];
  spawnShootingStar(pick);
}, 2000);

/* ---------- journey video: scrub on scroll (desktop) / autoplay loop (touch) ---------- */
const journey = document.querySelector(".journey");
const stage = document.querySelector(".stage");
const journeyVideo = document.getElementById("journeyVideo");

// Touch/mobile browsers (esp. iOS Safari) don't reliably render frames via
// currentTime scrubbing. Detect them and fall back to autoplay+loop so the
// video is always visible, while scene labels still respond to scroll.
const isTouchDevice =
  (window.matchMedia &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches) ||
  /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent || "");

let videoReady = false;
let videoDuration = 0;

if (journeyVideo) {
  if (isTouchDevice) {
    journeyVideo.loop = true;
    journeyVideo.muted = true;
    journeyVideo.setAttribute("muted", "");
    journeyVideo.setAttribute("autoplay", "");
    journeyVideo.setAttribute("loop", "");
    journeyVideo.setAttribute("playsinline", "");
    const tryPlay = () => journeyVideo.play().catch(() => {});
    tryPlay();
    journeyVideo.addEventListener("loadedmetadata", tryPlay);
    journeyVideo.addEventListener("canplay", tryPlay);
    // Some mobile browsers still block autoplay until first user gesture.
    const playOnGesture = () => {
      tryPlay();
      window.removeEventListener("touchstart", playOnGesture);
      window.removeEventListener("touchend", playOnGesture);
      window.removeEventListener("click", playOnGesture);
    };
    window.addEventListener("touchstart", playOnGesture, { passive: true });
    window.addEventListener("touchend", playOnGesture, { passive: true });
    window.addEventListener("click", playOnGesture, { passive: true });
  } else {
    journeyVideo.addEventListener("loadedmetadata", () => {
      videoReady = true;
      videoDuration = journeyVideo.duration || 0;
      journeyVideo.pause();
      journeyVideo.currentTime = 0;
      syncVideoToScroll();
      syncSceneLabel();
    });
    journeyVideo.addEventListener("canplaythrough", () => {
      videoReady = true;
      videoDuration = journeyVideo.duration || videoDuration;
    });
  }
}

function journeyProgress() {
  if (!journey) return 0;
  const rect = journey.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  if (distance <= 0) return 0;
  return clamp(-rect.top / distance);
}

function syncVideoToScroll() {
  if (isTouchDevice) return;
  if (!journeyVideo || !videoReady || !videoDuration) return;
  const p = journeyProgress();
  const target = clamp(p) * videoDuration;
  // Avoid micro-thrash
  if (Math.abs(journeyVideo.currentTime - target) > 0.02) {
    if ("fastSeek" in journeyVideo) {
      try {
        journeyVideo.fastSeek(target);
      } catch (e) {
        journeyVideo.currentTime = target;
      }
    } else {
      journeyVideo.currentTime = target;
    }
  }
}

/* ---------- scene labels driven by progress ---------- */
const SCENES = [
  { start: 0.0, end: 0.25 },
  { start: 0.25, end: 0.5 },
  { start: 0.5, end: 0.75 },
  { start: 0.75, end: 1.01 },
];
const sceneLabels = document.querySelectorAll(".scene-label");
let activeSceneIdx = -1;

function syncSceneLabel() {
  const p = journeyProgress();
  let idx = SCENES.findIndex((s) => p >= s.start && p < s.end);
  if (idx < 0) idx = p >= 1 ? SCENES.length - 1 : 0;
  if (idx === activeSceneIdx) return;
  activeSceneIdx = idx;
  sceneLabels.forEach((el, i) => {
    el.classList.toggle("active", i === idx);
  });
}

/* ---------- ambient color tint matching the video chapter ---------- */
const SCENE_TINTS = [
  { t: 0.0, color: "10, 26, 16" },
  { t: 0.25, color: "38, 14, 24" },
  { t: 0.5, color: "32, 20, 8" },
  { t: 0.75, color: "26, 14, 8" },
];
function pickTint(progress) {
  let a = SCENE_TINTS[0];
  let b = SCENE_TINTS[SCENE_TINTS.length - 1];
  for (let i = 0; i < SCENE_TINTS.length - 1; i++) {
    if (progress >= SCENE_TINTS[i].t && progress < SCENE_TINTS[i + 1].t) {
      a = SCENE_TINTS[i];
      b = SCENE_TINTS[i + 1];
      break;
    }
  }
  const span = b.t - a.t || 1;
  const local = (progress - a.t) / span;
  const ar = a.color.split(",").map((n) => parseFloat(n));
  const br = b.color.split(",").map((n) => parseFloat(n));
  return ar.map((v, i) => Math.round(v + (br[i] - v) * clamp(local))).join(",");
}
function updateAmbient() {
  const p = journeyProgress();
  document.documentElement.style.setProperty("--ambient", pickTint(p));
}

/* ---------- smooth easing scroll (wheel inertia) ---------- */
let targetScroll = window.scrollY;
let currentScroll = window.scrollY;
let scrollAnimating = false;
const SCROLL_EASE = 0.085;
const WHEEL_MULTIPLIER = 0.9;

function maxScroll() {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
}

function smoothScrollTick() {
  const diff = targetScroll - currentScroll;
  if (Math.abs(diff) < 0.4) {
    currentScroll = targetScroll;
    window.scrollTo(0, currentScroll);
    scrollAnimating = false;
    return;
  }
  currentScroll += diff * SCROLL_EASE;
  window.scrollTo(0, currentScroll);
  requestAnimationFrame(smoothScrollTick);
}

function ensureScrollAnim() {
  if (scrollAnimating) return;
  scrollAnimating = true;
  requestAnimationFrame(smoothScrollTick);
}

if (!isTouchDevice) {
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      targetScroll = Math.max(
        0,
        Math.min(targetScroll + e.deltaY * WHEEL_MULTIPLIER, maxScroll())
      );
      ensureScrollAnim();
    },
    { passive: false }
  );
}

window.addEventListener("keydown", (e) => {
  const step = window.innerHeight * 0.9;
  let delta = 0;
  if (e.key === "ArrowDown") delta = 80;
  else if (e.key === "ArrowUp") delta = -80;
  else if (e.key === "PageDown" || e.key === " ") delta = step;
  else if (e.key === "PageUp") delta = -step;
  else if (e.key === "Home") {
    e.preventDefault();
    targetScroll = 0;
    ensureScrollAnim();
    return;
  } else if (e.key === "End") {
    e.preventDefault();
    targetScroll = maxScroll();
    ensureScrollAnim();
    return;
  } else return;
  e.preventDefault();
  targetScroll = Math.max(0, Math.min(targetScroll + delta, maxScroll()));
  ensureScrollAnim();
});

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    targetScroll = Math.max(
      0,
      Math.min(window.scrollY + target.getBoundingClientRect().top, maxScroll())
    );
    ensureScrollAnim();
  });
});

window.addEventListener(
  "scroll",
  () => {
    requestParallax();
    requestRecompute();
    syncVideoToScroll();
    syncSceneLabel();
    updateAmbient();
  },
  { passive: true }
);

requestParallax();
syncVideoToScroll();
syncSceneLabel();
updateAmbient();
