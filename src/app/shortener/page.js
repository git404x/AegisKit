import ToolLayout from "@/components/ui/ToolLayout";
import ShortenerCore from "@/components/tools/ShortenerCore";

export default function ShortenerPage() {
  return (
    <ToolLayout title="URL Shortener" subtitle="Local // Cryptographic Routing">
      <ShortenerCore />
    </ToolLayout>
  );
}
