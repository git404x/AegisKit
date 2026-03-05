"use client";

import { useState, useRef } from "react";
import exifr from "exifr";
import {
  Shield,
  ShieldAlert,
  Image as ImageIcon,
  UploadCloud,
  RefreshCw,
  Scissors,
} from "lucide-react";
import styles from "./ExifCore.module.css";

export default function ExifCore() {
  const [imageSrc, setImageSrc] = useState(null);
  const [fileName, setFileName] = useState("");
  const [exifData, setExifData] = useState(null);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    // 1. Load Image for Preview and Canvas rendering
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImageSrc(event.target.result);
        setOriginalDims({ w: img.width, h: img.height });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    // 2. Parse EXIF Data
    try {
      const parsed = await exifr.parse(file, {
        tiff: true,
        ifd0: true,
        exif: true,
        gps: true,
      });

      if (parsed && Object.keys(parsed).length > 0) {
        // Filter out complex array buffers and format coordinates
        const cleanData = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === "string" || typeof value === "number") {
            cleanData[key] = value;
          } else if (value instanceof Date) {
            cleanData[key] = value.toLocaleString();
          }
        }
        setExifData(Object.keys(cleanData).length > 0 ? cleanData : null);
      } else {
        setExifData(null); // No EXIF found
      }
    } catch (err) {
      console.error("EXIF Parsing failed:", err);
      setExifData(null);
    }
  };

  const handleShred = async () => {
    if (!imageSrc || !canvasRef.current) return;
    setIsProcessing(true);

    // Yield to let UI update
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Render at EXACT original resolution to preserve quality
        canvas.width = originalDims.w;
        canvas.height = originalDims.h;
        ctx.clearRect(0, 0, originalDims.w, originalDims.h);
        ctx.drawImage(img, 0, 0, originalDims.w, originalDims.h);

        // Exporting from Canvas strips all EXIF natively
        const cleanDataUrl = canvas.toDataURL("image/jpeg", 1.0); // Max quality JPEG

        const link = document.createElement("a");
        link.download = `shredded-${fileName}`;
        link.href = cleanDataUrl;
        link.click();

        setIsProcessing(false);
      };
      img.src = imageSrc;
    } catch (err) {
      console.error("Shredding failed:", err);
      alert("Failed to shred metadata.");
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setFileName("");
    setExifData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={styles.wrapper}>
      {/* Left Pane: Image Input & Preview */}
      <div className={styles.leftPane}>
        {!imageSrc ? (
          <div
            className={styles.dropZone}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={48} style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
              Select an Image to Scan
            </p>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Supports JPEG, HEIC, PNG
            </span>
            <input
              type="file"
              ref={fileInputRef}
              className={styles.hiddenInput}
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <img src={imageSrc} alt="Preview" className={styles.imagePreview} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              <span>{fileName}</span>
              <span>
                {originalDims.w} x {originalDims.h}
              </span>
            </div>
            {/* Hidden canvas used exclusively for the shredding operation */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
          <button
            onClick={handleReset}
            className={styles.btnSecondary}
            disabled={!imageSrc || isProcessing}
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={handleShred}
            className={styles.btnPrimary}
            disabled={!imageSrc || isProcessing || !exifData}
            style={{ flex: 1 }}
          >
            {isProcessing ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Scissors size={18} />
            )}
            {isProcessing ? "Purging Data..." : "Shred Metadata & Export"}
          </button>
        </div>
      </div>

      {/* Right Pane: EXIF Inspector */}
      <div className={styles.rightPane}>
        <div className={styles.inspector}>
          {!imageSrc ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              <p>Awaiting Image Payload...</p>
            </div>
          ) : exifData ? (
            <>
              <div className={styles.statusHeader}>
                <ShieldAlert size={28} color="#ff5f56" />
                <div>
                  <div className={styles.dangerText}>
                    Tracking Data Detected
                  </div>
                  <div
                    style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                  >
                    {Object.keys(exifData).length} hidden tags found.
                  </div>
                </div>
              </div>

              <div className={styles.dataGrid}>
                {Object.entries(exifData).map(([key, value]) => (
                  <div key={key} className={styles.dataRow}>
                    <span className={styles.dataKey}>{key}</span>
                    <span className={styles.dataValue}>{value.toString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                gap: "1rem",
              }}
            >
              <Shield size={48} color="#27c93f" />
              <div style={{ textAlign: "center" }}>
                <div className={styles.safeText}>Image is Clean</div>
                <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  No EXIF or tracking metadata was found.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}
