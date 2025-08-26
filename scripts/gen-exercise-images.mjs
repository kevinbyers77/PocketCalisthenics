// scripts/gen-exercise-images.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "src", "data", "exercise_library.json");
const OUTDIR = path.join(ROOT, "public", "exercise-images");

// Controls
const MAX_COUNT = parseInt(process.env.LIMIT || "0", 10) || Infinity; // e.g. set LIMIT=5 for first five
const ONLY_IDS = (process.env.ONLY_IDS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---- helpers --------------------------------------------------

const COLORS = [
  // alternating blue / green / amber backgrounds
  { bg: "desaturated blue #2c66e4", ring: "#1d4ed8" },     // blue-700
  { bg: "deep green #2c7a4a", ring: "#047857" },          // emerald-700
  { bg: "warm amber #b7791f", ring: "#b45309" },          // amber-700
];

function stylePrompt({ name, description, colorIdx }) {
  const c = COLORS[colorIdx % COLORS.length];

  return `Flat, clean **vector illustration** of an athletic **male** performing **${name}**.
- Pose: accurate body alignment, natural proportions, minimal facial detail.
- View: side view (or 3/4 if clearer), entire body **fully inside frame**.
- Composition: subject centered **inside a white circular frame with two thin grey rings** (the rings are part of the design).
- Background: solid ${c.bg}; floor strip at bottom for ground plane, subtle.
- Palette: modern, muted; clothing in navy/royal tones; shoes light grey.
- No text, no logo, no UI, no watermark.
- Style: friendly fitness app icon, smooth shapes, soft shadows, crisp edges.

Exercise notes for pose fidelity: ${description || "natural movement form"}.
`;
}

// ---- main -----------------------------------------------------

const json = JSON.parse(fs.readFileSync(DATA, "utf8"));
const list = json.exercise_library || json; // in case the JSON is either array or {exercise_library}

if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

// Optional sub-selection
let items = list;
if (ONLY_IDS.length) items = items.filter(x => ONLY_IDS.includes(x.id));
items = items.slice(0, MAX_COUNT);

if (!items.length) {
  console.log("Nothing to generate (check LIMIT or ONLY_IDS).");
  process.exit(0);
}

console.log(`Generating ${items.length} images → ${path.relative(ROOT, OUTDIR)}`);

let idx = 0;
for (const ex of items) {
  idx++;
  const file = path.join(OUTDIR, `${ex.id}.png`);
  if (fs.existsSync(file)) {
    console.log(`✔︎ Skip existing: ${ex.id}`);
    continue;
  }

  const prompt = stylePrompt({
    name: ex.name,
    description: ex.description,
    colorIdx: idx - 1
  });

  console.log(`→ ${ex.id}: ${ex.name}`);

  const res = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    // IMPORTANT: ask the model to include the circular frame inside the image,
    // so we keep full control over the look in a single raster.
    // (We do NOT request transparent background so the frame is visible.)
    // background: "white"  // default is fine
  });

  const b64 = res.data?.[0]?.b64_json;
  if (!b64) {
    console.error(`✖ Failed to get image for ${ex.id}`);
    continue;
  }
  fs.writeFileSync(file, Buffer.from(b64, "base64"));
  console.log(`  saved ${path.relative(ROOT, file)}`);
}

console.log("Done.");
