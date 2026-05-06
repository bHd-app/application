const root = document.documentElement;
const story = document.querySelector(".scroll-story");
const finale = document.querySelector(".finale");
const title = document.querySelector("#storyTitle");
const text = document.querySelector("#storyText");
const chapterNumber = document.querySelector("#chapterNumber");
const canvas = document.querySelector("#sparkles");
const ctx = canvas.getContext("2d");

const chapters = [
  {
    at: 0,
    scene: "intro",
    number: "00",
    title: "Scroll down",
    text: "",
  },
  {
    at: 0.58,
    scene: "date",
    number: "01",
    title: "An exceptional date",
    text: "",
  },
  {
    at: 0.74,
    scene: "nature",
    number: "02",
    title: "Or an experience in the heart of nature",
    text: "",
  },
  {
    at: 0.86,
    scene: "adventure",
    number: "03",
    title: "Or diving into the ocean",
    text: "",
  },
  {
    at: 0.94,
    scene: "cooking",
    number: "04",
    title: "Or even a cooking class",
    text: "",
  },
];

const particles = Array.from({ length: 190 }, (_, index) => {
  const angle = (index / 190) * Math.PI * 2;
  const orbit = 0.18 + Math.random() * 0.84;

  return {
    angle,
    orbit,
    size: 1.1 + Math.random() * 4.8,
    spin: 0.38 + Math.random() * 1.9,
    wave: Math.random() * Math.PI * 2,
    color: ["#f3c36b", "#ff6f8f", "#89d8b7", "#ffffff", "#2368a4", "#b82956"][
      index % 6
    ],
  };
});

let latestProgress = 0;
let smoothProgress = 0;
let activeChapter = -1;
let ticking = false;
let animationFrame = 0;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function segment(progress, start, end) {
  return clamp((progress - start) / (end - start));
}

function stageAmount(progress, start, peak, end) {
  const fadeIn = segment(progress, start, peak);
  const fadeOut = 1 - segment(progress, peak, end);
  return easeInOutCubic(clamp(Math.min(fadeIn, fadeOut)));
}

function calculateProgress() {
  const rect = story.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  return clamp(-rect.top / distance);
}

function calculateFinaleProgress() {
  const rect = finale.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  return clamp(-rect.top / distance);
}

function syncChapter(progress) {
  const nextIndex = chapters.reduce((current, chapter, index) => {
    return progress >= chapter.at ? index : current;
  }, 0);

  if (nextIndex === activeChapter) {
    return;
  }

  activeChapter = nextIndex;
  const chapter = chapters[nextIndex];
  root.dataset.scene = chapter.scene;
  title.textContent = chapter.title;
  text.textContent = chapter.text;
  chapterNumber.textContent = chapter.number;
}

function sizeCanvas() {
  const scale = window.devicePixelRatio || 1;
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.floor(bounds.width * scale);
  canvas.height = Math.floor(bounds.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function drawSparkles(progress, mood) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  const opening = easeOutCubic(segment(progress, 0.08, 0.34));
  const reveal = easeInOutCubic(segment(progress, 0.12, 0.9));

  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle, index) => {
    const pulse = Math.sin(progress * 14 + particle.wave) * 0.5 + 0.5;
    const radius = (44 + particle.orbit * 318) * opening;
    const drift = reveal * 118 * Math.sin(index * 1.7);
    const angle = particle.angle + progress * particle.spin * 2.25;
    const x = centerX + Math.cos(angle) * (radius + drift);
    const y =
      centerY +
      Math.sin(angle) * (radius * 0.7 + drift * 0.28) -
      opening * 34 -
      reveal * 18 * Math.cos(index);
    const alpha = clamp(opening * (0.26 + pulse * 0.74) - reveal * 0.03);
    const color =
      mood.cooking > 0.5
        ? ["#f3c36b", "#ffffff", "#ffcf9f"][index % 3]
        : mood.adventure > 0.5
          ? ["#ffffff", "#86d6ff", "#2368a4"][index % 3]
          : mood.nature > 0.5
            ? ["#ffffff", "#89d8b7", "#2d8f62"][index % 3]
            : particle.color;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angle + progress * 4);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20 * alpha;
    ctx.beginPath();
    ctx.roundRect(
      -particle.size / 2,
      -particle.size / 2,
      particle.size,
      particle.size,
      1.2
    );
    ctx.fill();
    ctx.restore();
  });
}

function render() {
  latestProgress = calculateProgress();
  const finaleProgress = easeInOutCubic(calculateFinaleProgress());
  const finaleCard = Math.min(finaleProgress / 0.58, 1);
  const finaleMessage = segment(finaleProgress, 0.5, 1);
  smoothProgress += (latestProgress - smoothProgress) * 0.24;

  const release = easeInOutCubic(segment(smoothProgress, 0.04, 0.18));
  const invitation = 1 - easeInOutCubic(segment(smoothProgress, 0.004, 0.055));
  const giftProgress = easeInOutCubic(segment(smoothProgress, 0.03, 0.7));
  const opening = easeOutCubic(segment(smoothProgress, 0.42, 0.7));
  const openGift = easeInOutCubic(segment(smoothProgress, 0.54, 0.72));
  const date = stageAmount(smoothProgress, 0.58, 0.7, 0.82);
  const nature = stageAmount(smoothProgress, 0.74, 0.83, 0.92);
  const adventure = stageAmount(smoothProgress, 0.86, 0.93, 0.99);
  const cooking = easeInOutCubic(segment(smoothProgress, 0.94, 0.995));
  const rawGiftFrame = giftProgress * 11;
  const lowerGiftFrame = Math.floor(rawGiftFrame);
  const upperGiftFrame = Math.min(11, lowerGiftFrame + 1);
  const giftFrameMix = rawGiftFrame - lowerGiftFrame;

  root.style.setProperty("--progress", smoothProgress.toFixed(4));
  root.style.setProperty("--finale", finaleProgress.toFixed(4));
  root.style.setProperty("--finale-card", finaleCard.toFixed(4));
  root.style.setProperty("--finale-message", finaleMessage.toFixed(4));
  root.style.setProperty("--invitation", invitation.toFixed(4));
  root.style.setProperty("--release", release.toFixed(4));
  root.style.setProperty("--opening", opening.toFixed(4));
  root.style.setProperty("--open-gift", openGift.toFixed(4));
  root.style.setProperty("--date", date.toFixed(4));
  root.style.setProperty("--nature", nature.toFixed(4));
  root.style.setProperty("--adventure", adventure.toFixed(4));
  root.style.setProperty("--cooking", cooking.toFixed(4));

  for (let index = 0; index < 12; index += 1) {
    let opacity = 0;

    if (index === lowerGiftFrame) {
      opacity = 1 - giftFrameMix;
    }

    if (index === upperGiftFrame) {
      opacity = Math.max(opacity, giftFrameMix);
    }

    root.style.setProperty(
      `--gift-frame-${String(index + 1).padStart(2, "0")}`,
      opacity.toFixed(4)
    );
  }

  syncChapter(smoothProgress);
  drawSparkles(smoothProgress, { date, nature, adventure, cooking });

  if (Math.abs(latestProgress - smoothProgress) > 0.001) {
    animationFrame = requestAnimationFrame(render);
    return;
  }

  ticking = false;
  animationFrame = 0;
}

function requestRender() {
  if (ticking) {
    return;
  }

  ticking = true;
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  animationFrame = requestAnimationFrame(render);
}

window.addEventListener("scroll", requestRender, { passive: true });
window.addEventListener("resize", () => {
  sizeCanvas();
  requestRender();
});

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function roundRect(
    x,
    y,
    width,
    height,
    radius
  ) {
    const r = Math.min(radius, width / 2, height / 2);
    this.moveTo(x + r, y);
    this.arcTo(x + width, y, x + width, y + height, r);
    this.arcTo(x + width, y + height, x, y + height, r);
    this.arcTo(x, y + height, x, y, r);
    this.arcTo(x, y, x + width, y, r);
    this.closePath();
    return this;
  };
}

sizeCanvas();
requestRender();
