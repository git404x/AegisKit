import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QrCore from "@/components/tools/QrCore";
import styles from "./page.module.css";

export default function QrPage() {
  return (
    <main className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <ArrowLeft
          size={16}
          style={{ marginRight: "8px", verticalAlign: "middle" }}
        />
        <span style={{ verticalAlign: "middle" }}>Back to Core</span>
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>QR Generator</h1>
        <p className={styles.subtitle}>Offline // Matrix Rendering</p>
      </header>

      {/* The isolated QrCore tool */}
      <QrCore />
    </main>
  );
}
