"use client";

import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import { FileType, Download, RefreshCw, FileText, Code } from "lucide-react";
import styles from "./ConverterCore.module.css";

marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
});

const CODE_EXTENSIONS = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "py",
  "cpp",
  "c",
  "java",
  "html",
  "css",
  "json",
  "sh",
  "yaml",
  "rs",
  "go",
  "txt",
  "log",
];

export default function ConverterCore() {
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileExt, setFileExt] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Configuration States
  const [theme, setTheme] = useState("dark");
  const [margin, setMargin] = useState("normal"); // normal (15mm) | narrow (5mm)
  const [fontSize, setFontSize] = useState("14px");
  const [quality, setQuality] = useState("high");

  const fileInputRef = useRef(null);
  const renderRef = useRef(null);

  // Dynamically load syntax highlighting themes
  useEffect(() => {
    const linkId = "hljs-theme-stylesheet";
    let link = document.getElementById(linkId);

    const themeUrl =
      theme === "dark"
        ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
        : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";

    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = themeUrl;
  }, [theme]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    setFileName(file.name);
    setFileExt(ext);
    setFileData(file);

    try {
      const text = await file.text();

      if (ext === "md") {
        setHtmlContent(marked.parse(text));
      } else if (CODE_EXTENSIONS.includes(ext)) {
        const highlighted = hljs.highlightAuto(text).value;
        setHtmlContent(`<pre><code class="hljs">${highlighted}</code></pre>`);
      } else {
        alert(
          "Unsupported format. Please upload Markdown (.md) or Source Code files.",
        );
        handleReset();
      }
    } catch (err) {
      console.error("Parsing failed:", err);
      alert("Failed to parse the document.");
    }
  };

  const handleExport = async () => {
    if (!renderRef.current || !htmlContent) return;
    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = renderRef.current;

      const opt = {
        margin: margin === "narrow" ? 5 : 15,
        filename: `${fileName.split(".")[0]}-aegis.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: quality === "high" ? 2 : 1, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Compilation failed:", err);
      alert(
        "Failed to generate PDF. If the file is extremely large, try lowering the Render Quality.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFileData(null);
    setFileName("");
    setFileExt("");
    setHtmlContent("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isCode = CODE_EXTENSIONS.includes(fileExt) && fileExt !== "txt";

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftPane}>
        <div
          className={styles.dropZone}
          onClick={() => !fileData && fileInputRef.current?.click()}
          style={{ cursor: fileData ? "default" : "pointer" }}
        >
          {!fileData ? (
            <>
              <FileType size={48} style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
                Drop Markdown or Code File
              </p>
            </>
          ) : (
            <div className={styles.fileInfo}>
              {isCode ? (
                <Code size={48} style={{ color: "var(--accent)" }} />
              ) : (
                <FileText size={48} style={{ color: "var(--accent)" }} />
              )}
              <span style={{ fontWeight: "bold", wordBreak: "break-all" }}>
                {fileName}
              </span>
              <span className={styles.badge}>
                {isCode ? "Source Code" : "Markdown"}
              </span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className={styles.hiddenInput}
            accept=".md,.js,.jsx,.ts,.tsx,.py,.cpp,.c,.java,.html,.css,.json,.sh,.yaml,.rs,.go,.txt,.log"
            onChange={handleFileUpload}
          />
        </div>

        <div className={styles.settingsGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Theme</label>
            <select
              className={styles.select}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="dark">Dark (OLED)</option>
              <option value="light">Light (Print)</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Margins</label>
            <select
              className={styles.select}
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
            >
              <option value="normal">Normal (15mm)</option>
              <option value="narrow">Narrow (5mm)</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Font Size</label>
            <select
              className={styles.select}
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            >
              <option value="12px">Small</option>
              <option value="14px">Normal</option>
              <option value="16px">Large</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Render Quality</label>
            <select
              className={styles.select}
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              <option value="high">High (2x)</option>
              <option value="standard">Standard (1x - For Huge Files)</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.rightPane}>
        {htmlContent ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "-1rem",
              }}
            >
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Live Render Preview:
              </p>
            </div>
            <div className={styles.previewContainer}>
              <div
                ref={renderRef}
                className={styles.renderChamber}
                data-theme={theme}
                style={{ fontSize: fontSize }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed var(--border-color)",
              borderRadius: "8px",
            }}
          >
            <p style={{ color: "var(--text-muted)" }}>Awaiting Payload...</p>
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
          <button
            onClick={handleReset}
            className={styles.btnSecondary}
            disabled={!fileData || isProcessing}
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={handleExport}
            className={styles.btnPrimary}
            disabled={!fileData || isProcessing}
            style={{ flex: 1 }}
          >
            {isProcessing ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {isProcessing ? "Compiling Document..." : "Export PDF"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}
