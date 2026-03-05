"use client";

import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Download,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import styles from "./ImageCore.module.css";

export default function ImageCore() {
  const [imageSrc, setImageSrc] = useState(null);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [format, setFormat] = useState("image/png");
  const [maintainRatio, setMaintainRatio] = useState(true);

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

  // Redraw canvas whenever image or dimensions change
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

  const handleExport = () => {
    if (!canvasRef.current) return;

    const ext =
      format === "image/jpeg"
        ? "jpg"
        : format === "image/webp"
          ? "webp"
          : "png";
    const dataUrl = canvasRef.current.toDataURL(format, 0.9); // 0.9 quality for lossy formats

    const link = document.createElement("a");
    link.download = `aegis-edit-${Date.now()}.${ext}`;
    link.href = dataUrl;
    link.click();
  };

  const handleReset = () => {
    setImageSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={styles.wrapper}>
      {/* Visual Preview Area */}
      <div className={styles.previewSection}>
        {!imageSrc ? (
          <div
            className={styles.uploadOverlay}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={48} style={{ marginBottom: "1rem" }} />
            <p>Click or Drag Image Here</p>
            <span style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
              Supports PNG, JPG, WEBP, SVG
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

      {/* Tools & Dimensions */}
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
            disabled={!imageSrc}
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
            disabled={!imageSrc}
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
            disabled={!imageSrc}
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
            disabled={!imageSrc}
          >
            <option value="image/png">PNG (Lossless)</option>
            <option value="image/jpeg">JPEG (Compressed)</option>
            <option value="image/webp">WEBP (Modern)</option>
          </select>
        </div>

        <div
          className={styles.row}
          style={{ marginTop: "auto", paddingTop: "1rem" }}
        >
          <button
            onClick={handleReset}
            className={styles.btnSecondary}
            disabled={!imageSrc}
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleExport}
            className={styles.btnPrimary}
            disabled={!imageSrc}
            style={{ flex: 1 }}
          >
            <Download size={18} />
            Export Image
          </button>
        </div>
      </div>
    </div>
  );
}
