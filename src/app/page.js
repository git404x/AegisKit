import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Aegis<span className={styles.accent}>Kit</span>
        </h1>
        <p className={styles.subtitle}>Secure // Local // Modular</p>
      </header>
      <div className={styles.grid}>
        <a href="/qr" style={{ textDecoration: "none", color: "inherit" }}>
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
        </a>
      </div>
    </main>
  );
}
