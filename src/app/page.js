import Link from "next/link";
import {
  Link as LinkIcon,
  QrCode,
  FileText,
  Image as ImageIcon,
  FileCode2,
  Code2,
  ScanFace,
} from "lucide-react";
import styles from "./page.module.css";
import BlurText from "../components/ui/BlurText.js";
import TextType from "../components/ui/TextType.js";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <BlurText as="span" text="AegisKit" />
          </h1>
          <p className={styles.subtitle}>
            <TextType
              as="span"
              text={["Secure. Local. Modular.", "A privacy-first web toolkit."]}
            />
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        <Link href="/shortener" style={{ textDecoration: "none" }}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <LinkIcon size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>URL Routing Engine</h3>
              <p className={styles.cardDesc}>
                Local-first, privacy-respecting link redirection and management.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/qr" style={{ textDecoration: "none" }}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <QrCode size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Matrix Forge</h3>
              <p className={styles.cardDesc}>
                Generate highly customizable, scalable SVG/PNG QR codes offline.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/pdf" style={{ textDecoration: "none" }}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <FileText size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Document Forge</h3>
              <p className={styles.cardDesc}>
                Extract, merge, and inject vector watermarks into PDF files
                securely.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/image" style={{ textDecoration: "none" }}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <ImageIcon size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Image Processor</h3>
              <p className={styles.cardDesc}>
                Target-size compression, EXIF data shredding, and location
                spoofing.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/converter" style={{ textDecoration: "none" }}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <FileCode2 size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Conversion Matrix</h3>
              <p className={styles.cardDesc}>
                Parse Markdown and source code into compiled, highlighted PDF
                formats.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/code" style={{ textDecoration: "none" }}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <Code2 size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Code Studio</h3>
              <p className={styles.cardDesc}>
                Create beautiful, customizable, shareable images of your code
                snippets.
              </p>
            </div>
          </div>
        </Link>
        <Link href="/lens" style={{ textDecoration: "none" }}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              {/* Import ScanFace at the top of page.js if you haven't */}
              <ScanFace size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Aegis Lens</h3>
              <p className={styles.cardDesc}>
                Global hover-translation engine prototype and DOM extractor.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </main>
  );
}
