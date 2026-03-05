import ToolLayout from "@/components/ui/ToolLayout";
import ConverterCore from "@/components/tools/ConverterCore";
import { FileCode2 } from "lucide-react";

export default function ConverterPage() {
  return (
    <ToolLayout
      title="File Converter"
      subtitle="Client-Side // Parsing Engine"
      icon={FileCode2}
    >
      <ConverterCore />
    </ToolLayout>
  );
}
