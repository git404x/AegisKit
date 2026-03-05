import ToolLayout from "@/components/ui/ToolLayout";
import ConverterCore from "@/components/tools/ConverterCore";

export default function ConverterPage() {
  return (
    <ToolLayout title="File Converter" subtitle="Client-Side // Parsing Engine">
      <ConverterCore />
    </ToolLayout>
  );
}
