import ToolLayout from "@/components/ui/ToolLayout";
import QrCore from "@/components/tools/QrCore";

export default function QrPage() {
  return (
    <ToolLayout title="QR Generator" subtitle="Offline // Matrix Rendering">
      <QrCore />
    </ToolLayout>
  );
}
