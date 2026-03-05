import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ShortenerCore from "@/components/tools/ShortenerCore";
import styles from "../qr/page.module.css"; // Reusing

export default function ShortenerPage() {
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
        <h1 className={styles.title}>URL Shortener</h1>
        <p className={styles.subtitle}>Local // Cryptographic Routing</p>
      </header>

      <ShortenerCore />
    </main>
  );
}
