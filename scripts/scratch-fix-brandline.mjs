import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";

// Usage: node scratch-fix-brandline.mjs <in.pdf> <out.pdf>
// Covers the old "Kaolorevision" brand line (drawn at x=50, baseline y=758, size 9)
// on page 1 only, and redraws "GCE Papers" in its place.
const [inPath, outPath] = process.argv.slice(2);

const bytes = await readFile(inPath);
const doc = await PDFDocument.load(bytes);
const font = await doc.embedFont(StandardFonts.Helvetica);
const page = doc.getPages()[0];
const { width } = page.getSize();

// White-out a generous band around the old brand line.
page.drawRectangle({
  x: 45,
  y: 750,
  width: Math.min(300, width - 90),
  height: 16,
  color: rgb(1, 1, 1),
});
page.drawText("GCE Papers", { x: 50, y: 758, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

const out = await doc.save();
await writeFile(outPath, out);
console.log("fixed", outPath);
