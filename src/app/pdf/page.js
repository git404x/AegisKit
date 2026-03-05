import ToolLayout from "@/components/ui/ToolLayout";
import PdfCore from "@/components/tools/PdfCore";
import { FileText } from "lucide-react";

export default function PdfPage() {
  return (
    <ToolLayout
      title="PDF Engine"
      subtitle="Client-Side // Byte Manipulation"
      icon={FileText}
    >
      <PdfCore />
    </ToolLayout>
  );
}
