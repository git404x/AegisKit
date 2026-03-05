"use client";

import dynamic from "next/dynamic";
import ToolLayout from "@/components/ui/ToolLayout";

const CodeCore = dynamic(() => import("@/components/tools/CodeCore"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        color: "var(--text-muted)",
      }}
    >
      Initializing Code Engine...
    </div>
  ),
});

export default function CodePage() {
  return (
    <ToolLayout
      title="Code Studio"
      subtitle="Client-Side // Beautiful Code Images"
    >
      <CodeCore />
    </ToolLayout>
  );
}
