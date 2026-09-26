import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";

// Usage: node scratch-fix-footer-domain.mjs <in.pdf> <out.pdf>
// Whites out the old footer line (drawn at x=50, y=20, size 8, on every
// page by scratch-watermark-existing.mjs) and redraws it with the corrected
// domain, on every page.
const [inPath, outPath] = process.argv.slice(2);

const BRAND_NAME = "GCE Papers";
const BRAND_SITE = "gcepapers.site";
const BRAND_PHONE = "+237 676 20 34 54";

const bytes = await readFile(inPath);
const doc = await PDFDocument.load(bytes);
const font = await doc.embedFont(StandardFonts.Helvetica);
const footerText = `${BRAND_NAME} — ${BRAND_SITE} — WhatsApp ${BRAND_PHONE}`;

for (const page of doc.getPages()) {
  const { width } = page.getSize();
  page.drawRectangle({
    x: 40,
    y: 14,
    width: Math.min(400, width - 60),
    height: 14,
    color: rgb(1, 1, 1),
  });
  page.drawText(footerText, {
    x: 50,
    y: 20,
    size: 8,
    font,
    color: rgb(0.55, 0.55, 0.55),
  });
}

const out = await doc.save();
await writeFile(outPath, out);
console.log("fixed", outPath);
