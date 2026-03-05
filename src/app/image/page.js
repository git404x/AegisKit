import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ImageCore from "@/components/tools/ImageCore";
import styles from "../qr/page.module.css";

export default function ImagePage() {
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
        <h1 className={styles.title}>Image Tools</h1>
        <p className={styles.subtitle}>Client-Side // Resize & Convert</p>
      </header>

      <ImageCore />
    </main>
  );
}
