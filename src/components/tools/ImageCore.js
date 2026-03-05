"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, Download, RefreshCw } from "lucide-react";
import styles from "./ImageCore.module.css";

export default function ImageCore() {
  const [imageSrc, setImageSrc] = useState(null);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [format, setFormat] = useState("image/jpeg"); // Default to JPEG for compression
  const [maintainRatio, setMaintainRatio] = useState(true);

  // New Compression States
  const [targetKB, setTargetKB] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImageSrc(event.target.result);
        setOriginalDims({ w: img.width, h: img.height });
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (e) => {
    const newW = parseInt(e.target.value) || 0;
    setWidth(newW);
    if (maintainRatio && originalDims.w > 0) {
      setHeight(Math.round((newW / originalDims.w) * originalDims.h));
    }
  };

  const handleHeightChange = (e) => {
    const newH = parseInt(e.target.value) || 0;
    setHeight(newH);
    if (maintainRatio && originalDims.h > 0) {
      setWidth(Math.round((newH / originalDims.h) * originalDims.w));
    }
  };

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = imageSrc;
  }, [imageSrc, width, height]);

  // Binary Search Compression Engine
  const handleExport = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);

    // Yield to the event loop so the "Processing..." UI can render
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const ext =
        format === "image/jpeg"
          ? "jpg"
          : format === "image/webp"
            ? "webp"
            : "png";
      let finalDataUrl;

      // Only apply binary search if a target is set and format supports compression
      if (targetKB && targetKB > 0 && format !== "image/png") {
        const targetBytes = targetKB * 1024;
        let minQ = 0.01;
        let maxQ = 1.0;
        let bestDataUrl = null;

        // 10 Iterations is the sweet spot for rapid convergence
        for (let i = 0; i < 10; i++) {
          let currentQ = (minQ + maxQ) / 2;
          let tempUrl = canvasRef.current.toDataURL(format, currentQ);

          // Calculate exact byte size of the base64 payload
          const base64Data = tempUrl.split(",")[1];
          const sizeBytes = Math.ceil((base64Data.length * 3) / 4);

          if (sizeBytes > targetBytes) {
            maxQ = currentQ; // Too big, lower the ceiling
          } else {
            minQ = currentQ; // Fits! Raise the floor to get better visual quality
            bestDataUrl = tempUrl;
          }
        }

        // If even the lowest quality is too big, default to absolute lowest
        finalDataUrl = bestDataUrl || canvasRef.current.toDataURL(format, 0.01);
      } else {
        // Standard lossless or high-quality export
        finalDataUrl = canvasRef.current.toDataURL(format, 0.9);
      }

      const link = document.createElement("a");
      link.download = `aegis-edit-${Date.now()}.${ext}`;
      link.href = finalDataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("An error occurred during compression.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setTargetKB("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.previewSection}>
        {!imageSrc ? (
          <div
            className={styles.uploadOverlay}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={48} style={{ marginBottom: "1rem" }} />
            <p>Click or Drag Image Here</p>
            <span style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
              Supports PNG, JPG, WEBP
            </span>
          </div>
        ) : (
          <canvas ref={canvasRef} className={styles.canvas}></canvas>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className={styles.hiddenInput}
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>

      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span>Width (px)</span>
            {imageSrc && <span>Orig: {originalDims.w}</span>}
          </label>
          <input
            type="number"
            className={styles.input}
            value={width || ""}
            onChange={handleWidthChange}
            disabled={!imageSrc || isProcessing}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span>Height (px)</span>
            {imageSrc && <span>Orig: {originalDims.h}</span>}
          </label>
          <input
            type="number"
            className={styles.input}
            value={height || ""}
            onChange={handleHeightChange}
            disabled={!imageSrc || isProcessing}
          />
        </div>

        <div
          className={styles.inputGroup}
          style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}
        >
          <input
            type="checkbox"
            id="ratio"
            checked={maintainRatio}
            onChange={(e) => setMaintainRatio(e.target.checked)}
            disabled={!imageSrc || isProcessing}
          />
          <label
            htmlFor="ratio"
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Lock Aspect Ratio
          </label>
        </div>

        <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
          <label className={styles.label}>Export Format</label>
          <select
            className={styles.select}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            disabled={!imageSrc || isProcessing}
          >
            <option value="image/jpeg">JPEG (Compressed)</option>
            <option value="image/webp">WEBP (Modern)</option>
            <option value="image/png">PNG (Lossless)</option>
          </select>
        </div>

        {/* NEW: Target Size Engine */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Max Target Size (KB)</label>
          <input
            type="number"
            className={styles.input}
            value={targetKB}
            onChange={(e) => setTargetKB(e.target.value)}
            placeholder="e.g. 50 (Optional)"
            disabled={!imageSrc || format === "image/png" || isProcessing}
          />
          {format === "image/png" && (
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--accent)",
                marginTop: "0.25rem",
              }}
            >
              *Target size requires JPEG or WEBP.
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "auto",
            paddingTop: "1rem",
          }}
        >
          <button
            onClick={handleReset}
            className={styles.btnSecondary}
            disabled={!imageSrc || isProcessing}
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleExport}
            className={styles.btnPrimary}
            disabled={!imageSrc || isProcessing}
            style={{ flex: 1 }}
          >
            {isProcessing ? (
              <RefreshCw
                size={18}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Download size={18} />
            )}
            {isProcessing ? "Compressing..." : "Export"}
          </button>
        </div>
      </div>

      {/* Simple inline keyframe for the spinner */}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
