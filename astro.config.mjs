import { defineConfig } from "astro/config";

// GitHub Pages serves from /<repo-name>/ unless you use a custom domain.
//
// Examples:
//   Custom domain (art.yourname.com)  →  "/"
//   GitHub Pages (user.github.io/math-art)  →  "/math-art"

export default defineConfig({
  site: "https://madebymath.art",
});
