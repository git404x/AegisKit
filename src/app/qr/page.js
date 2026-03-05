import ToolLayout from "@/components/ui/ToolLayout";
import QrCore from "@/components/tools/QrCore";
import { QrCode } from "lucide-react";

export default function QrPage() {
  return (
    <ToolLayout
      title="QR Generator"
      subtitle="Offline // Matrix Rendering"
      icon={QrCode}
    >
      <QrCore />
    </ToolLayout>
  );
}
