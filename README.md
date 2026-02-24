# Made by Math

A gallery of mathematical art by Mathewe Banda. Built with [Astro](https://astro.build) — renders to static HTML at build time with minimal vanilla JS for the lightbox and scroll animations.

All art made with [pyfreeform](https://matheweb.github.io/pyfreeform).

---

## Local Dev

```bash
npm install
npm run dev          # → http://localhost:4321/madebymath/
```

| Script | What |
|--------|------|
| `npm run content` | Rebuilds `src/generated/site-data.json` from `content/` |
| `npm run dev` | Content build + Astro dev server |
| `npm run build` | Content build + production build (`dist/`) |
| `npm run preview` | Build + preview production site |

The content build is skipped automatically if nothing in `content/` has changed.

---

## Content Structure

All content lives in `content/`. Edit there — no need to touch source code.

```
content/
├── site.json                          ← Name, hero, about, nav, footer
└── sections/
    ├── 01-connected-spanning-trees/
    │   ├── meta.json                  ← Title, description, pieces, paper
    │   ├── connected-spanning-trees.pdf
    │   ├── skull.svg
    │   └── starry_night.svg
    ├── 02-two-colored-convex-tiles/
    │   └── ...
    ├── 03-morphing-polygons/
    │   └── ...
    └── 04-dark-to-light/
        ├── meta.json                  ← No "paper" block = no paper link shown
        └── frankenstein.svg
```

Sections display in **folder name order** (`01-`, `02-`, ...). Rename prefixes to reorder.

SVGs are optimized with [SVGO](https://github.com/svg/svgo) during the content build.

---

## Adding Content

### `content/sections/XX-name/meta.json`

```json
{
  "title": "Section Title",
  "subtitle": "Optional Subtitle",
  "description": "About this work.",

  "paper": {
    "title": "Paper Title",
    "year": "2024",
    "file": "paper.pdf"
  },

  "pieces": [
    { "image": "artwork.svg", "title": "Display Name" }
  ]
}
```

The `paper` block is optional — omit it entirely if there's no paper for that section.

---

## Deploy

Configured for GitHub Pages at `https://matheweb.github.io/madebymath/`.

1. **Settings** → **Pages** → Source: **GitHub Actions**
2. Every push to `main` auto-deploys.
