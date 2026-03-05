import ToolLayout from "@/components/ui/ToolLayout";
import ShortenerCore from "@/components/tools/ShortenerCore";
import { Link as LinkIcon } from "lucide-react";

export default function ShortenerPage() {
  return (
    <ToolLayout
      title="URL Shortener"
      subtitle="Local // Cryptographic Routing"
      icon={LinkIcon}
    >
      <ShortenerCore />
    </ToolLayout>
  );
}
