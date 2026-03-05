import ToolLayout from "@/components/ui/ToolLayout";
import ImageCore from "@/components/tools/ImageCore";
import { Image as ImageIcon } from "lucide-react";

export default function ImagePage() {
  return (
    <ToolLayout
      title="Image Tools"
      subtitle="Client-Side // Resize & Convert"
      icon={ImageIcon}
    >
      <ImageCore />
    </ToolLayout>
  );
}
