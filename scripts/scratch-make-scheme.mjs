import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Usage: node make-scheme.mjs <spec.json> <out.pdf>
// spec.json: { title, subtitle, note?, answers: {"1":"C", ...}, totalQuestions }
const spec = JSON.parse(await readFile(process.argv[2], "utf8"));
const outPath = process.argv[3];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, "..", "public", "branding", "icon.png");
const BRAND_NAME = "GCE Papers";
const BRAND_SITE = "gcpapers.site";
const BRAND_PHONE = "+237 676 20 34 54";

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);
const logoBytes = await readFile(LOGO_PATH);
const logoImage = await doc.embedPng(logoBytes);
const logoRatio = logoImage.height / logoImage.width;

function stampPage(p) {
  // Faint centered watermark
  const wmWidth = 320;
  const wmHeight = wmWidth * logoRatio;
  p.drawImage(logoImage, {
    x: (595 - wmWidth) / 2,
    y: (842 - wmHeight) / 2,
    width: wmWidth,
    height: wmHeight,
    opacity: 0.06,
  });
  // Small header logo (top-right)
  const hdrWidth = 26;
  const hdrHeight = hdrWidth * logoRatio;
  p.drawImage(logoImage, { x: 595 - 50 - hdrWidth, y: 812, width: hdrWidth, height: hdrHeight });
  // Footer branding
  p.drawText(`${BRAND_NAME} — ${BRAND_SITE} — WhatsApp ${BRAND_PHONE}`, {
    x: 50,
    y: 28,
    size: 8,
    font,
    color: rgb(0.55, 0.55, 0.55),
  });
}

let page = doc.addPage([595, 842]);
stampPage(page);
let y = 800;

function wrapText(text, maxWidth, f, size) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (f.widthOfTextAtSize(test, size) > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function line(text, { size = 11, f = font, color = rgb(0, 0, 0), dy = 16, wrap = false } = {}) {
  const texts = wrap ? wrapText(text, 495, f, size) : [text];
  for (const t of texts) {
    if (y < 60) {
      page = doc.addPage([595, 842]);
      stampPage(page);
      y = 800;
    }
    page.drawText(t, { x: 50, y, size, font: f, color });
    y -= dy;
  }
}

line(spec.title, { size: 14, f: bold, dy: 22 });
line(spec.subtitle, { size: 11, dy: 20 });
line(BRAND_NAME, { size: 9, color: rgb(0.4, 0.4, 0.4), dy: 24 });

line(
  "Each answer verified independently against the question paper, computed and re-checked three times before inclusion.",
  { size: 9, color: rgb(0.35, 0.35, 0.35), dy: 12, wrap: true }
);
y -= 8;

if (spec.note) {
  line(spec.note, { size: 9, color: rgb(0.6, 0.2, 0.2), dy: 12, wrap: true });
  y -= 8;
}

const cols = 5;
const colWidth = 95;
let i = 0;
const startY = y;
const total = spec.totalQuestions;
for (let q = 1; q <= total; q++) {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = 50 + col * colWidth;
  const rowY = startY - row * 18;
  if (rowY < 40) continue; // safety, shouldn't happen for <=100 q
  const answer = spec.answers[String(q)] ?? "—";
  page.drawText(`${q}.`, { x, y: rowY, size: 11, font: bold });
  page.drawText(String(answer), {
    x: x + 24,
    y: rowY,
    size: 11,
    font,
    color: answer === undefined || spec.answers[String(q)] === undefined ? rgb(0.6, 0.2, 0.2) : rgb(0, 0, 0),
  });
  i++;
}

const bytes = await doc.save();
await writeFile(outPath, bytes);
console.log("written", outPath, bytes.length, "bytes");
