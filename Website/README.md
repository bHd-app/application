# Expergift Website

One day by the sea, scrubbed by scroll: sunrise, noon, sunset and a moonlit
night, drawn live in WebGL. Four experiences (a morning hike, lunch by the
water, a cooking workshop, pottery at night) appear at their time of day and
end on a single gift card.

## Run Locally

Needs Node.js 18.18 or newer.

```bash
cd Website
npm install
npm run dev
```

Open http://localhost:3000

For a production build: `npm run build && npm start`.

## Where things live

- `lib/day.ts`: the clock, sun and moon paths, and the experience copy.
- `components/day/DaySky.tsx`: the sky, clouds, stars, moon and sea shader.
  Render resolution drops automatically on slow GPUs.
- `components/day/DayJourney.tsx`: page layout, cards, timeline, gift card.

## Older static prototype

The files below are the earlier static version (video gift reveal). They are
not used by the Next.js site; open `index.html` with
`python3 -m http.server 5173` to see it.

## Assets

- `assets/experience-panels.jpg`: generated four-panel experience artwork.
- `assets/fish-sprite.webp`: generated transparent fish sprite for the
  adventure scene.
- `assets/food-sprite.webp`: generated transparent food sprite for the cooking
  class scene.
- `assets/gift-opening.mp4`: scroll-scrubbed gift box opening video.
