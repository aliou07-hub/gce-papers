// One-off placeholder icon generator — pure Node (zlib), no image deps.
// Produces a simple branded square: gradient background + a rounded "K" mark.
// Replace public/icons/*.png with real artwork whenever it's ready.
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function makeIcon(size) {
  const bgA = hexToRgb("#1d4ed8");
  const bgB = hexToRgb("#0ea5e9");
  const mark = [255, 255, 255]; // white glyph on blue

  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    let offset = y * (1 + size * 4);
    raw[offset] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const t = (x + y) / (size * 2);
      let r = lerp(bgA[0], bgB[0], t);
      let g = lerp(bgA[1], bgB[1], t);
      let b = lerp(bgA[2], bgB[2], t);

      // Rounded-square corner mask so the icon reads well as a maskable icon.
      const cx = x - size / 2;
      const cy = y - size / 2;
      const corner = size * 0.5 - size * 0.12;
      const distX = Math.max(Math.abs(cx) - corner, 0);
      const distY = Math.max(Math.abs(cy) - corner, 0);
      const cornerDist = Math.sqrt(distX * distX + distY * distY);
      const outside = cornerDist > size * 0.12;

      // Simple "K"-ish glyph: a vertical bar + two diagonals, drawn as thick strokes.
      const gx = (x - size * 0.32) / size;
      const gy = (y - size * 0.5) / size;
      const barHit = gx > -0.05 && gx < 0.02 && gy > -0.22 && gy < 0.22;
      const upperDiagHit = Math.abs(gx - 0.02 - -gy * 0.55) < 0.045 && gy < 0.02 && gy > -0.24;
      const lowerDiagHit = Math.abs(gx - 0.02 - gy * 0.55) < 0.045 && gy > -0.02 && gy < 0.24;
      const isMark = !outside && (barHit || upperDiagHit || lowerDiagHit);

      if (isMark) {
        r = mark[0];
        g = mark[1];
        b = mark[2];
      } else if (outside) {
        r = bgA[0];
        g = bgA[1];
        b = bgA[2];
      }

      const p = offset + 1 + x * 4;
      raw[p] = r;
      raw[p + 1] = g;
      raw[p + 2] = b;
      raw[p + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw, { level: 9 });
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), makeIcon(size));
}
fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), makeIcon(180));
fs.writeFileSync(path.join(__dirname, "..", "public", "favicon.png"), makeIcon(32));

console.log("Icons generated in public/icons");
