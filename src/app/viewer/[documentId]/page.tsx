import { PdfViewer } from "@/components/app/PdfViewer";

export const metadata = { title: "Viewer — GCE Papers" };

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  return <PdfViewer documentId={documentId} />;
}
