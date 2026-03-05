import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./ToolLayout.module.css";

export default function ToolLayout({ title, subtitle, icon: Icon, children }) {
  return (
    <main className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={18} />
          <span>Return to Hub</span>
        </Link>
      </nav>

      <header className={styles.header}>
        {Icon && (
          <div className={styles.iconWrapper}>
            <Icon size={36} strokeWidth={1.5} />
          </div>
        )}
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </header>

      {/* tool core will be injected here */}
      {children}
    </main>
  );
}
