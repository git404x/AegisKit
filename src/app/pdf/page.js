import ToolLayout from "@/components/ui/ToolLayout";
import PdfCore from "@/components/tools/PdfCore";

export default function PdfPage() {
  return (
    <ToolLayout title="PDF Engine" subtitle="Client-Side // Byte Manipulation">
      <PdfCore />
    </ToolLayout>
  );
}
