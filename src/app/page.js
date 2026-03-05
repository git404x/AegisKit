import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Aegis<span className={styles.accent}>Kit</span>
        </h1>
        <p className={styles.subtitle}>Secure // Local // Modular</p>
      </header>
      {/* include tools */}
      <div className={styles.grid}>
        <Link href="/qr" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              padding: "2rem",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              backgroundColor: "var(--bg-surface)",
              cursor: "pointer",
              transition: "border-color 0.2s ease",
            }}
          >
            <h3>QR Generator</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Offline matrix generation with custom styling.
            </p>
          </div>
        </Link>

        <Link
          href="/shortener"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              padding: "2rem",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              backgroundColor: "var(--bg-surface)",
              cursor: "pointer",
              transition: "border-color 0.2s ease",
            }}
          >
            <h3>URL Shortener</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Secure, local routing with cryptographic IDs.
            </p>
          </div>
        </Link>
        <Link
          href="/image"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              padding: "2rem",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              backgroundColor: "var(--bg-surface)",
              cursor: "pointer",
              transition: "border-color 0.2s ease",
              height: "100%",
            }}
          >
            <h3>Image Tools</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Local resizing, format conversion, and pixel manipulation.
            </p>
          </div>
        </Link>
        <Link href="/pdf" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              padding: "2rem",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              backgroundColor: "var(--bg-surface)",
              cursor: "pointer",
              transition: "border-color 0.2s ease",
              height: "100%",
            }}
          >
            <h3>PDF Engine</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Secure client-side document splitting and extraction.
            </p>
          </div>
        </Link>
        <Link
          href="/converter"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              padding: "2rem",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              backgroundColor: "var(--bg-surface)",
              cursor: "pointer",
              transition: "border-color 0.2s ease",
              height: "100%",
            }}
          >
            <h3>File Converter</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Parse Markdown and DOCX into compiled PDF formats offline.
            </p>
          </div>
        </Link>
        <Link href="/code" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              padding: "2rem",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              backgroundColor: "var(--bg-surface)",
              cursor: "pointer",
              transition: "border-color 0.2s ease",
              height: "100%",
            }}
          >
            <h3>Code Studio</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Create beautiful, shareable images of your code snippets.
            </p>
          </div>
        </Link>
      </div>
    </main>
  );
}
