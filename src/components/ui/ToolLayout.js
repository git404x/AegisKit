import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./ToolLayout.module.css";

export default function ToolLayout({ title, subtitle, children }) {
  return (
    <main className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Back to Core</span>
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>

      {/* The specific tool (QrCore, PdfCore, etc.) will be injected here */}
      {children}
    </main>
  );
}
