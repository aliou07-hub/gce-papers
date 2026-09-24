import "server-only";
import { PDFDocument } from "pdf-lib";

/**
 * How many pages an unpurchased student may see for free. Deliberately
 * stingy: 1 page for most papers, 2 only for longer ones (5+ pages), and 0
 * (purchase-only, no preview) for a single-page document — never more than
 * half the paper, and never the whole thing.
 */
export function previewPageCount(totalPages: number): number {
  if (totalPages <= 1) return 0;
  if (totalPages >= 5) return 2;
  return 1;
}

/** Returns a new PDF containing only the first `pageCount` pages of `bytes`. */
export async function truncatePdf(bytes: ArrayBuffer, pageCount: number): Promise<Uint8Array> {
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const output = await PDFDocument.create();
  const indices = Array.from({ length: pageCount }, (_, i) => i);
  const pages = await output.copyPages(source, indices);
  pages.forEach((page) => output.addPage(page));
  return output.save();
}

export async function getPdfPageCount(bytes: ArrayBuffer): Promise<number> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}
