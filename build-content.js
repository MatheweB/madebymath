#!/usr/bin/env node

/**
 * build-content.js
 *
 * Reads content/ and generates:
 *   1. src/generated/site-data.json  — all metadata for Astro components
 *   2. public/content/...            — copies images + PDFs as static assets
 *                                      (SVGs are optimized via SVGO on copy)
 *
 * Run:  node build-content.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { optimize } from "svgo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "content");
const SECTIONS_DIR = path.join(CONTENT_DIR, "sections");
const OUTPUT_JSON = path.join(__dirname, "src", "generated", "site-data.json");
const PUBLIC_CONTENT = path.join(__dirname, "public", "content");

function readJSON(fp) {
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function optimizeAndCopySvg(src, dest) {
  ensureDir(path.dirname(dest));
  const raw = fs.readFileSync(src, "utf-8");
  const result = optimize(raw);
  fs.writeFileSync(dest, result.data);
}

function isFresh() {
  if (!fs.existsSync(OUTPUT_JSON)) return false;
  const outputTime = fs.statSync(OUTPUT_JSON).mtimeMs;
  const sourceFiles = [];
  // Collect all source files: site.json + everything in sections/
  sourceFiles.push(path.join(CONTENT_DIR, "site.json"));
  if (fs.existsSync(SECTIONS_DIR)) {
    for (const folder of fs.readdirSync(SECTIONS_DIR)) {
      const fp = path.join(SECTIONS_DIR, folder);
      if (!fs.statSync(fp).isDirectory()) continue;
      for (const file of fs.readdirSync(fp)) {
        sourceFiles.push(path.join(fp, file));
      }
    }
  }
  return sourceFiles.every(
    (f) => fs.existsSync(f) && fs.statSync(f).mtimeMs < outputTime
  );
}

function build() {
  if (isFresh()) {
    console.log("\n✅  Content up to date — skipping build\n");
    return;
  }

  console.log("\n📦  Building site data from content/\n");

  const sitePath = path.join(CONTENT_DIR, "site.json");
  if (!fs.existsSync(sitePath)) {
    console.error("❌  Missing content/site.json");
    process.exit(1);
  }
  const site = readJSON(sitePath);
  console.log(`  ✓ site.json  →  "${site.name}"`);

  if (!fs.existsSync(SECTIONS_DIR)) {
    console.error("❌  Missing content/sections/ directory");
    process.exit(1);
  }

  const sectionFolders = fs
    .readdirSync(SECTIONS_DIR)
    .filter((f) => fs.statSync(path.join(SECTIONS_DIR, f)).isDirectory())
    .sort();

  const sections = [];

  for (const folder of sectionFolders) {
    const folderPath = path.join(SECTIONS_DIR, folder);
    const metaPath = path.join(folderPath, "meta.json");

    if (!fs.existsSync(metaPath)) {
      console.warn(`  ⚠ Skipping ${folder}/ — no meta.json`);
      continue;
    }

    const meta = readJSON(metaPath);
    const sectionId = folder.replace(/^\d+-/, "");

    let paper = null;
    if (meta.paper?.file) {
      const paperSrc = path.join(folderPath, meta.paper.file);
      if (fs.existsSync(paperSrc)) {
        copyFile(paperSrc, path.join(PUBLIC_CONTENT, folder, meta.paper.file));
        paper = {
          title: meta.paper.title,
          year: meta.paper.year || null,
          url: `/content/${folder}/${meta.paper.file}`,
        };
      } else {
        console.warn(`  ⚠ ${folder}: paper "${meta.paper.file}" not found`);
      }
    }

    const pieces = [];
    for (const piece of meta.pieces || []) {
      const imgSrc = path.join(folderPath, piece.image);
      if (fs.existsSync(imgSrc)) {
        const dest = path.join(PUBLIC_CONTENT, folder, piece.image);
        if (piece.image.endsWith(".svg")) {
          optimizeAndCopySvg(imgSrc, dest);
        } else {
          copyFile(imgSrc, dest);
        }
      } else {
        console.warn(`  ⚠ ${folder}: image "${piece.image}" not found — placeholder`);
      }
      pieces.push({
        id: `${sectionId}--${piece.image.replace(/\.[^.]+$/, "")}`,
        title: piece.title,
        image: `/content/${folder}/${piece.image}`,
      });
    }

    sections.push({
      id: sectionId,
      title: meta.title,
      subtitle: meta.subtitle || null,
      description: meta.description || "",
      paper,
      pieces,
    });

    const paperLabel = paper ? "📄 +paper" : "   no paper";
    console.log(`  ✓ ${folder}/  →  "${meta.title}"  (${pieces.length} pieces, ${paperLabel})`);
  }

  const output = { site, sections };
  ensureDir(path.dirname(OUTPUT_JSON));
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));

  const total = sections.reduce((n, s) => n + s.pieces.length, 0);
  console.log(`\n✅  ${path.relative(__dirname, OUTPUT_JSON)}`);
  console.log(`    ${sections.length} sections, ${total} pieces\n`);
}

build();
