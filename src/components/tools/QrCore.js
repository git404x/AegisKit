"use client";

import { useState, useEffect, useRef } from "react";
import {
  Copy,
  Download,
  Check,
  RefreshCw,
  Upload,
  AlertCircle,
} from "lucide-react";
import styles from "./QrCore.module.css";

export default function QrCore() {
  const [text, setText] = useState("https://aegiskit.local");
  const [colorMatrix, setColorMatrix] = useState("#ffffff");
  const [colorBackground, setColorBackground] = useState("#000000");
  const [dotType, setDotType] = useState("square");
  const [logo, setLogo] = useState(null);
  const [exportFormat, setExportFormat] = useState("png");
  const [copyState, setCopyState] = useState("idle"); // "idle" | "success" | "error"

  const containerRef = useRef(null);
  const qrCodeRef = useRef(null);

  // Initialize the engine once (dynamically to avoid SSR window issues)
  useEffect(() => {
    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      qrCodeRef.current = new QRCodeStyling({
        width: 260,
        height: 260,
        margin: 5,
        imageOptions: { crossOrigin: "anonymous", margin: 8 },
      });
      if (containerRef.current) {
        qrCodeRef.current.append(containerRef.current);
      }
      updateEngine();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state changes to the engine
  const updateEngine = () => {
    if (!qrCodeRef.current) return;
    qrCodeRef.current.update({
      data: text || " ",
      dotsOptions: { color: colorMatrix, type: dotType },
      backgroundOptions: { color: colorBackground },
      image: logo,
    });
  };

  // Trigger update when any custom setting changes
  useEffect(() => {
    updateEngine();
  }, [text, colorMatrix, colorBackground, dotType, logo]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setLogo(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setColorMatrix("#ffffff");
    setColorBackground("#000000");
    setDotType("square");
    setLogo(null);
  };

  const handleCopy = async () => {
    if (!qrCodeRef.current) return;
    try {
      const blob = await qrCodeRef.current.getRawData("png");
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopyState("success");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (err) {
      console.warn("Clipboard write blocked by mobile browser security:", err);
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 3000);
    }
  };

  const handleDownload = () => {
    if (!qrCodeRef.current) return;
    qrCodeRef.current.download({
      name: `aegis-qr-${Date.now()}`,
      extension: exportFormat,
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* Input & Configuration */}
      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <div
            className={styles.row}
            style={{ justifyContent: "space-between" }}
          >
            <label className={styles.label}>Payload Data</label>
            <button
              onClick={handleReset}
              className={styles.btnSecondary}
              style={{ padding: "0.25rem 0.5rem", border: "none" }}
            >
              <RefreshCw size={14} /> Reset Style
            </button>
          </div>
          <input
            type="text"
            className={styles.input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter URL or payload..."
          />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <label className={styles.label}>Dot Style</label>
            <select
              className={styles.select}
              value={dotType}
              onChange={(e) => setDotType(e.target.value)}
            >
              <option value="square">Standard</option>
              <option value="rounded">Rounded</option>
              <option value="dots">Dotted</option>
              <option value="classy">Classy</option>
              <option value="extra-rounded">Extra Rounded</option>
            </select>
          </div>

          <div
            className={styles.inputGroup}
            style={{ flex: 1, minWidth: "120px" }}
          >
            <label className={styles.label}>Matrix</label>
            <div className={styles.colorPickerWrapper}>
              <input
                type="color"
                className={styles.colorInput}
                value={colorMatrix}
                onChange={(e) => setColorMatrix(e.target.value)}
              />
              <input
                type="text"
                className={styles.hexInput}
                value={colorMatrix}
                onChange={(e) => setColorMatrix(e.target.value)}
                maxLength={7}
              />
            </div>
          </div>

          <div
            className={styles.inputGroup}
            style={{ flex: 1, minWidth: "120px" }}
          >
            <label className={styles.label}>Backdrop</label>
            <div className={styles.colorPickerWrapper}>
              <input
                type="color"
                className={styles.colorInput}
                value={colorBackground}
                onChange={(e) => setColorBackground(e.target.value)}
              />
              <input
                type="text"
                className={styles.hexInput}
                value={colorBackground}
                onChange={(e) => setColorBackground(e.target.value)}
                maxLength={7}
              />
            </div>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Center Logo</label>
          <div className={styles.fileUploadWrapper}>
            <Upload size={16} />
            <span>{logo ? "Change Logo" : "Upload PNG/SVG"}</span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={handleLogoUpload}
            />
          </div>
        </div>
      </div>

      {/* Output & Actions */}
      <div className={styles.preview}>
        {/* The engine will inject the canvas/svg directly into this div */}
        <div className={styles.canvasContainer} ref={containerRef}></div>

        <div className={styles.actions}>
          <button onClick={handleCopy} className={styles.btn}>
            {copyState === "success" && <Check size={18} />}
            {copyState === "error" && <AlertCircle size={18} />}
            {copyState === "idle" && <Copy size={18} />}

            {copyState === "success"
              ? "Copied"
              : copyState === "error"
                ? "Use Export"
                : "Copy QR"}
          </button>

          <div className={styles.row} style={{ gap: "0.5rem", flex: 1 }}>
            <select
              className={styles.select}
              style={{ width: "80px", padding: "0.75rem" }}
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="png">PNG</option>
              <option value="svg">SVG</option>
              <option value="jpeg">JPG</option>
            </select>
            <button onClick={handleDownload} className={styles.btnPrimary}>
              <Download size={18} /> Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
