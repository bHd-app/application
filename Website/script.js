const root = document.documentElement;
const story = document.querySelector(".scroll-story");
const title = document.querySelector("#storyTitle");
const text = document.querySelector("#storyText");
const chapterNumber = document.querySelector("#chapterNumber");
const canvas = document.querySelector("#sparkles");
const ctx = canvas.getContext("2d");

const chapters = [
  {
    at: 0,
    number: "01",
    title: "نفس اول",
    text: "کادو هنوز بسته است، اما نورهای کوچک از لبه‌های روبان پیداست.",
  },
  {
    at: 0.24,
    number: "02",
    title: "اولین ترک نور",
    text: "درِ کادو از جایش جدا می‌شود و یک گرمای طلایی از داخلش بالا می‌آید.",
  },
  {
    at: 0.49,
    number: "03",
    title: "خاطره‌ها پرتاب می‌شوند",
    text: "هر کارت با ریتم خودش حرکت می‌کند؛ یکی آرام، یکی تند، یکی شناور.",
  },
  {
    at: 0.73,
    number: "04",
    title: "همه چیز زنده است",
    text: "حالا صحنه پر از تجربه‌هایی است که انگار از داخل کادو نفس می‌کشند.",
  },
];

const particles = Array.from({ length: 120 }, (_, index) => {
  const angle = (index / 120) * Math.PI * 2;
  const orbit = 0.2 + Math.random() * 0.78;

  return {
    angle,
    orbit,
    size: 1.2 + Math.random() * 3.8,
    spin: 0.45 + Math.random() * 1.8,
    hue: ["#f6c76f", "#f77862", "#90d3be", "#ffffff", "#3863a7"][
      index % 5
    ],
  };
});

let latestProgress = 0;
let smoothProgress = 0;
let activeChapter = -1;
let ticking = false;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOut(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function calculateProgress() {
  const rect = story.getBoundingClientRect();
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

function drawSparkles(progress) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  const opening = easeOutCubic(clamp((progress - 0.18) / 0.4));
  const reveal = easeInOut(clamp((progress - 0.42) / 0.48));

  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle, index) => {
    const pulse = Math.sin(progress * 12 + index * 0.37) * 0.5 + 0.5;
    const radius = (58 + particle.orbit * 270) * opening;
    const drift = reveal * 95 * Math.sin(index);
    const angle = particle.angle + progress * particle.spin;
    const x = centerX + Math.cos(angle) * (radius + drift);
    const y = centerY + Math.sin(angle) * (radius * 0.72 + drift * 0.38) - opening * 28;
    const alpha = clamp(opening * (0.32 + pulse * 0.68) - reveal * 0.12);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angle + progress * 3);
    ctx.fillStyle = particle.hue;
    ctx.shadowColor = particle.hue;
    ctx.shadowBlur = 18 * alpha;
    ctx.beginPath();
    ctx.roundRect(
      -particle.size / 2,
      -particle.size / 2,
      particle.size,
      particle.size,
      1
    );
    ctx.fill();
    ctx.restore();
  });
}

function render() {
  ticking = false;
  latestProgress = calculateProgress();
  smoothProgress += (latestProgress - smoothProgress) * 0.12;

  const opening = easeOutCubic(clamp((smoothProgress - 0.16) / 0.36));
  const reveal = easeInOut(clamp((smoothProgress - 0.38) / 0.46));

  root.style.setProperty("--progress", smoothProgress.toFixed(4));
  root.style.setProperty("--opening", opening.toFixed(4));
  root.style.setProperty("--reveal", reveal.toFixed(4));

  syncChapter(smoothProgress);
  drawSparkles(smoothProgress);

  if (Math.abs(latestProgress - smoothProgress) > 0.001) {
    requestAnimationFrame(render);
  }
}

function requestRender() {
  if (ticking) {
    return;
  }
  ticking = true;
  requestAnimationFrame(render);
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
