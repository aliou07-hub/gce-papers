import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Usage: node scratch-watermark-existing.mjs <in.pdf> <out.pdf>
const [inPath, outPath] = process.argv.slice(2);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, "..", "public", "branding", "icon.png");
const BRAND_NAME = "GCE Papers";
const BRAND_SITE = "gcpapers.site";
const BRAND_PHONE = "+237 676 20 34 54";

const existingBytes = await readFile(inPath);
const doc = await PDFDocument.load(existingBytes);
const font = await doc.embedFont(StandardFonts.Helvetica);
const logoBytes = await readFile(LOGO_PATH);
const logoImage = await doc.embedPng(logoBytes);
const logoRatio = logoImage.height / logoImage.width;

for (const page of doc.getPages()) {
  const { width, height } = page.getSize();

  const wmWidth = Math.min(320, width * 0.55);
  const wmHeight = wmWidth * logoRatio;
  page.drawImage(logoImage, {
    x: (width - wmWidth) / 2,
    y: (height - wmHeight) / 2,
    width: wmWidth,
    height: wmHeight,
    opacity: 0.06,
  });

  const hdrWidth = Math.min(26, width * 0.05);
  const hdrHeight = hdrWidth * logoRatio;
  page.drawImage(logoImage, {
    x: width - 50 - hdrWidth,
    y: height - 30 - hdrHeight,
    width: hdrWidth,
    height: hdrHeight,
  });

  const footerSize = 8;
  const footerText = `${BRAND_NAME} — ${BRAND_SITE} — WhatsApp ${BRAND_PHONE}`;
  page.drawText(footerText, {
    x: 50,
    y: 20,
    size: footerSize,
    font,
    color: rgb(0.55, 0.55, 0.55),
  });
}

const bytes = await doc.save();
await writeFile(outPath, bytes);
console.log("watermarked", outPath, bytes.length, "bytes");
