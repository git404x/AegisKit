import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PdfCore from "@/components/tools/PdfCore";
import styles from "../qr/page.module.css";

export default function PdfPage() {
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
        <h1 className={styles.title}>PDF Engine</h1>
        <p className={styles.subtitle}>Client-Side // Byte Manipulation</p>
      </header>

      <PdfCore />
    </main>
  );
}
