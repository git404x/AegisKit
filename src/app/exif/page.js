import ToolLayout from "@/components/ui/ToolLayout";
import ExifCore from "@/components/tools/ExifCore";

export default function ExifPage() {
  return (
    <ToolLayout
      title="Metadata Shredder"
      subtitle="Privacy // EXIF Data Scrubber"
    >
      <ExifCore />
    </ToolLayout>
  );
}
