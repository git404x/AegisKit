"use client";

import dynamic from "next/dynamic";
import ToolLayout from "@/components/ui/ToolLayout";
import { ScanFace } from "lucide-react";

// Dynamically import the core and disable SSR since it requires the physical DOM
const LensCore = dynamic(() => import("@/components/tools/LensCore"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        padding: "4rem",
        textAlign: "center",
        color: "var(--text-muted)",
      }}
    >
      Initializing Lens Engine...
    </div>
  ),
});

export default function LensPage() {
  return (
    <ToolLayout
      title="Aegis Lens"
      subtitle="Client-Side // Hover Translation Sandbox"
      icon={ScanFace}
    >
      <LensCore />
    </ToolLayout>
  );
}
