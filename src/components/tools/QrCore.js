"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Copy, Download, Check } from "lucide-react";
import styles from "./QrCore.module.css";

export default function QrCore() {
  const [text, setText] = useState("https://aegiskit.local");
  const [colorMatrix, setColorMatrix] = useState("#ffffff"); // Default OLED White
  const [colorBackground, setColorBackground] = useState("#000000"); // Default OLED Black
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);

  // Re-render the matrix whenever inputs change
  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      text || " ", // Prevent crashing on empty input
      {
        width: 256,
        margin: 2,
        color: {
          dark: colorMatrix,
          light: colorBackground,
        },
      },
      (error) => {
        if (error) console.error("Matrix generation failed:", error);
      },
    );
  }, [text, colorMatrix, colorBackground]);

  // Web Clipboard API magic
  const handleCopy = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      navigator.clipboard
        .write([new ClipboardItem({ "image/png": blob })])
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
    });
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `aegis-qr-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className={styles.wrapper}>
      {/* Input & Configuration */}
      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Payload Data</label>
          <input
            type="text"
            className={styles.input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter URL, text, or payload..."
          />
        </div>

        <div className={styles.colorPickers}>
          <div className={styles.picker}>
            <label className={styles.label}>Matrix</label>
            <input
              type="color"
              className={styles.colorInput}
              value={colorMatrix}
              onChange={(e) => setColorMatrix(e.target.value)}
            />
          </div>
          <div className={styles.picker}>
            <label className={styles.label}>Background</label>
            <input
              type="color"
              className={styles.colorInput}
              value={colorBackground}
              onChange={(e) => setColorBackground(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Output & Actions */}
      <div className={styles.preview}>
        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef}></canvas>
        </div>

        <div className={styles.actions}>
          <button onClick={handleCopy} className={styles.btn}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Copied!" : "Copy Image"}
          </button>

          <button onClick={handleDownload} className={styles.btnPrimary}>
            <Download size={18} />
            Export PNG
          </button>
        </div>
      </div>
    </div>
  );
}
