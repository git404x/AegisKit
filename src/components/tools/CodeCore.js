"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup"; // HTML/XML
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css";
import {
  Download,
  RefreshCw,
  Image as ImageIcon,
  Copy,
  Check,
} from "lucide-react";
import styles from "./CodeCore.module.css";

const DEFAULT_CODE = `// Welcome to AegisKit Code Studio
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`;

export default function CodeCore() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("tomorrow");
  const [bgColor, setBgColor] = useState("#1e1e1e");
  const [padding, setPadding] = useState(32);
  const [showWindowControls, setShowWindowControls] = useState(true);

  // Action States
  const [isExporting, setIsExporting] = useState(false);
  const [copyState, setCopyState] = useState("idle"); // idle | copying | success

  const exportRef = useRef(null);

  useEffect(() => {
    const linkId = "prism-theme-stylesheet";
    let link = document.getElementById(linkId);

    const themeUrl = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-${theme}.min.css`;

    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = themeUrl;
  }, [theme]);

  // Reusable Canvas Generator
  const generateCanvas = async () => {
    if (!exportRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;
    return await html2canvas(exportRef.current, {
      scale: 2, // High resolution
      backgroundColor: null, // Transparent to respect padding
      logging: false,
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `aegis-code-${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to create image.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    setCopyState("copying");
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      // Convert canvas to Blob for the Clipboard API
      canvas.toBlob(async (blob) => {
        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);

          setCopyState("success");
          setTimeout(() => setCopyState("idle"), 2000); // Reset after 2 seconds
        } catch (err) {
          console.error("Clipboard error:", err);
          alert("Clipboard access denied. Check your browser permissions.");
          setCopyState("idle");
        }
      }, "image/png");
    } catch (err) {
      console.error("Copy failed:", err);
      setCopyState("idle");
    }
  };

  const highlight = (code) =>
    Prism.highlight(
      code,
      Prism.languages[language] || Prism.languages.plaintext,
      language,
    );

  return (
    <div className={styles.wrapper}>
      <div className={styles.settingsPane}>
        <div className={styles.settingsGroup}>
          <p className={styles.groupTitle}>Editor</p>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Language</label>
            <select
              className={styles.select}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="bash">Bash</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Theme</label>
            <select
              className={styles.select}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="tomorrow">Tomorrow Night</option>
              <option value="okaidia">Okaidia</option>
              <option value="twilight">Twilight</option>
              <option value="coy">Coy (Light)</option>
              <option value="solarizedlight">Solarized Light</option>
            </select>
          </div>
        </div>

        <div className={styles.settingsGroup}>
          <p className={styles.groupTitle}>Window</p>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Background</label>
            <input
              type="color"
              className={styles.colorInput}
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Padding (px)</label>
            <input
              type="range"
              className={styles.input}
              min="0"
              max="64"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
            />
          </div>
          <label className={styles.checkboxGroup}>
            <input
              type="checkbox"
              checked={showWindowControls}
              onChange={(e) => setShowWindowControls(e.target.checked)}
            />
            <span className={styles.label}>Show Window Controls</span>
          </label>
        </div>
      </div>

      <div className={styles.previewPane}>
        <div className={styles.previewContainer}>
          <div
            ref={exportRef}
            className={styles.exportContainer}
            style={{ backgroundColor: bgColor, padding: `${padding}px` }}
          >
            <div style={{ borderRadius: "8px", overflow: "hidden" }}>
              {showWindowControls && (
                <div
                  className={styles.windowHeader}
                  style={{
                    backgroundColor:
                      theme.includes("light") || theme === "coy"
                        ? "rgba(0,0,0,0.05)"
                        : "rgba(255,255,255,0.1)",
                  }}
                >
                  <div className={styles.windowControls}>
                    <div className={`${styles.control} ${styles.close}`}></div>
                    <div
                      className={`${styles.control} ${styles.minimize}`}
                    ></div>
                    <div
                      className={`${styles.control} ${styles.maximize}`}
                    ></div>
                  </div>
                </div>
              )}
              <div className={styles.editorContainer}>
                <Editor
                  value={code}
                  onValueChange={(code) => setCode(code)}
                  highlight={highlight}
                  padding={20}
                  style={{
                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                    fontSize: 14,
                    backgroundColor:
                      theme.includes("light") || theme === "coy"
                        ? "#f5f2f0"
                        : "#2d2d2d",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={handleCopy}
            className={styles.btnSecondary}
            disabled={copyState !== "idle" || isExporting}
            style={{ flex: 1 }}
          >
            {copyState === "copying" ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : copyState === "success" ? (
              <Check size={18} color="var(--accent)" />
            ) : (
              <Copy size={18} />
            )}
            {copyState === "copying"
              ? "Copying..."
              : copyState === "success"
                ? "Copied!"
                : "Copy Image"}
          </button>

          <button
            onClick={handleExport}
            className={styles.btnPrimary}
            disabled={isExporting || copyState === "copying"}
            style={{ flex: 1 }}
          >
            {isExporting ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <ImageIcon size={18} />
            )}
            {isExporting ? "Rendering..." : "Export as PNG"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}
