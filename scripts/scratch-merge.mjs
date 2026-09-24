import { PDFDocument } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";

const [p1path, p2path, outPath] = process.argv.slice(2);
const p1 = await readFile(p1path);
const p2 = await readFile(p2path);
const doc1 = await PDFDocument.load(p1);
const doc2 = await PDFDocument.load(p2);
const pages2 = await doc1.copyPages(doc2, doc2.getPageIndices());
pages2.forEach((p) => doc1.addPage(p));
const bytes = await doc1.save();
await writeFile(outPath, bytes);
console.log("merged", outPath);
