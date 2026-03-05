"use client";

import { useState, useRef, useEffect } from "react";
import exifr from "exifr";
import piexif from "piexifjs";
import {
  UploadCloud,
  Download,
  RefreshCw,
  ShieldAlert,
  Shield,
  Scissors,
  VenetianMask,
} from "lucide-react";
import styles from "./ImageCore.module.css";

export default function ImageCore() {
  const [mode, setMode] = useState("compress"); // compress | metadata
  const [imageSrc, setImageSrc] = useState(null);
  const [fileName, setFileName] = useState("");
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Compress State
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [format, setFormat] = useState("image/jpeg");
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [targetKB, setTargetKB] = useState("");

  // Metadata State
  const [exifData, setExifData] = useState(null);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

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

    try {
      const parsed = await exifr.parse(file, {
        tiff: true,
        ifd0: true,
        exif: true,
        gps: true,
      });
      if (parsed && Object.keys(parsed).length > 0) {
        const cleanData = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === "string" || typeof value === "number")
            cleanData[key] = value;
          else if (value instanceof Date)
            cleanData[key] = value.toLocaleString();
        }
        setExifData(Object.keys(cleanData).length > 0 ? cleanData : null);
      } else {
        setExifData(null);
      }
    } catch (err) {
      setExifData(null);
    }
  };

  useEffect(() => {
    if (!imageSrc || !canvasRef.current || mode !== "compress") return;
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
  }, [imageSrc, width, height, mode]);

  // --- Compression Engine (Binary Search) ---
  const handleCompressExport = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const ext =
        format === "image/jpeg"
          ? "jpg"
          : format === "image/webp"
            ? "webp"
            : "png";
      let finalDataUrl;

      if (targetKB && targetKB > 0 && format !== "image/png") {
        const targetBytes = targetKB * 1024;
        let minQ = 0.01,
          maxQ = 1.0,
          bestDataUrl = null;

        for (let i = 0; i < 10; i++) {
          let currentQ = (minQ + maxQ) / 2;
          let tempUrl = canvasRef.current.toDataURL(format, currentQ);
          const sizeBytes = Math.ceil((tempUrl.split(",")[1].length * 3) / 4);

          if (sizeBytes > targetBytes) maxQ = currentQ;
          else {
            minQ = currentQ;
            bestDataUrl = tempUrl;
          }
        }
        finalDataUrl = bestDataUrl || canvasRef.current.toDataURL(format, 0.01);
      } else {
        finalDataUrl = canvasRef.current.toDataURL(format, 0.9);
      }

      triggerDownload(finalDataUrl, `aegis-compressed-${Date.now()}.${ext}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- EXIF Engine ---
  const handleShred = () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = originalDims.w;
        canvas.height = originalDims.h;
        canvas.getContext("2d").drawImage(img, 0, 0);
        triggerDownload(
          canvas.toDataURL("image/jpeg", 1.0),
          `shredded-${fileName}`,
        );
        setIsProcessing(false);
      };
      img.src = imageSrc;
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleSpoof = () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = originalDims.w;
        canvas.height = originalDims.h;
        canvas.getContext("2d").drawImage(img, 0, 0);
        const cleanJpeg = canvas.toDataURL("image/jpeg", 1.0);

        const cameras = [
          "Sony ILCE-7RM4",
          "Canon EOS R5",
          "Nikon Z9",
          "Fujifilm X-T4",
        ];
        const randomCamera =
          cameras[Math.floor(Math.random() * cameras.length)];

        const zeroth = {};
        const exif = {};
        const gps = {};

        zeroth[piexif.ImageIFD.Make] = randomCamera.split(" ")[0];
        zeroth[piexif.ImageIFD.Model] = randomCamera;
        zeroth[piexif.ImageIFD.Software] =
          "Adobe Photoshop Lightroom Classic 12.4";
        exif[piexif.ExifIFD.DateTimeOriginal] = "2019:04:15 14:32:11";

        gps[piexif.GPSIFD.GPSLatitudeRef] = "N";
        gps[piexif.GPSIFD.GPSLatitude] = [
          [Math.floor(Math.random() * 20), 1],
          [0, 1],
          [0, 1],
        ];
        gps[piexif.GPSIFD.GPSLongitudeRef] = "W";
        gps[piexif.GPSIFD.GPSLongitude] = [
          [Math.floor(Math.random() * 150), 1],
          [0, 1],
          [0, 1],
        ];

        const exifObj = { "0th": zeroth, Exif: exif, GPS: gps };
        const exifBytes = piexif.dump(exifObj);
        const spoofedJpeg = piexif.insert(exifBytes, cleanJpeg);

        triggerDownload(spoofedJpeg, `decoy-${fileName.split(".")[0]}.jpg`);
        setIsProcessing(false);
      };
      img.src = imageSrc;
    } catch (err) {
      alert("Failed to inject decoy data. Make sure it's a valid image.");
      setIsProcessing(false);
    }
  };

  const triggerDownload = (dataUrl, name) => {
    const link = document.createElement("a");
    link.download = name;
    link.href = dataUrl;
    link.click();
  };

  const handleReset = () => {
    setImageSrc(null);
    setTargetKB("");
    setExifData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={styles.wrapper}>
      {/* LEFT PANE: Previews & Context */}
      <div className={styles.previewSection}>
        {/* Only show tabs if an image is loaded to prevent UI bugs */}
        {imageSrc && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === "compress" ? styles.tabActive : ""}`}
              onClick={() => setMode("compress")}
            >
              Resize & Compress
            </button>
            <button
              className={`${styles.tab} ${mode === "metadata" ? styles.tabActive : ""}`}
              onClick={() => setMode("metadata")}
            >
              Metadata Engine
            </button>
          </div>
        )}

        {!imageSrc ? (
          <div
            className={styles.uploadOverlay}
            onClick={() => fileInputRef.current?.click()}
            style={{ minHeight: "300px" }}
          >
            <UploadCloud
              size={48}
              style={{ marginBottom: "1rem", color: "var(--text-muted)" }}
            />
            <p style={{ color: "var(--text-muted)" }}>
              Click or Drag Image Here
            </p>
          </div>
        ) : mode === "compress" ? (
          <canvas ref={canvasRef} className={styles.canvas}></canvas>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              height: "100%",
            }}
          >
            <img
              src={imageSrc}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "contain",
                borderRadius: "4px",
                backgroundColor: "var(--bg-base)",
                border: "1px solid var(--border-color)",
              }}
            />

            {/* Relocated Info Text */}
            <div className={styles.infoBox}>
              <h4 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Security Protocols
              </h4>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  lineHeight: "1.5",
                }}
              >
                <strong>Shred:</strong> Completely strips all EXIF, GPS, and
                camera data by rendering exclusively via an invisible HTML5
                canvas.
                <br />
                <br />
                <strong>Spoof:</strong> Injects false camera models and random
                oceanic GPS coordinates to disguise the true origin of the file.
              </p>
            </div>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className={styles.hiddenInput}
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>

      {/* RIGHT PANE: Controls & Inspector */}
      <div className={styles.controls}>
        {mode === "compress" ? (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <span>Width (px)</span>
                {imageSrc && <span>Orig: {originalDims.w}</span>}
              </label>
              <input
                type="number"
                className={styles.input}
                value={width || ""}
                onChange={(e) => {
                  setWidth(parseInt(e.target.value));
                  if (maintainRatio && originalDims.w)
                    setHeight(
                      Math.round(
                        (parseInt(e.target.value) / originalDims.w) *
                          originalDims.h,
                      ),
                    );
                }}
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
                onChange={(e) => {
                  setHeight(parseInt(e.target.value));
                  if (maintainRatio && originalDims.h)
                    setWidth(
                      Math.round(
                        (parseInt(e.target.value) / originalDims.h) *
                          originalDims.w,
                      ),
                    );
                }}
                disabled={!imageSrc || isProcessing}
              />
            </div>
            <div
              className={styles.inputGroup}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: "0.5rem",
              }}
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
                onClick={handleCompressExport}
                className={styles.btnPrimary}
                disabled={!imageSrc || isProcessing}
                style={{ flex: 1 }}
              >
                {isProcessing ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}{" "}
                Export
              </button>
            </div>
          </>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* Relocated EXIF Inspector */}
            <div className={styles.inspector}>
              {exifData ? (
                <>
                  <div className={styles.statusHeader}>
                    <ShieldAlert size={28} color="var(--color-danger)" />
                    <div>
                      <div className={styles.dangerText}>
                        Tracking Data Detected
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {Object.keys(exifData).length} tags exposed.
                      </div>
                    </div>
                  </div>
                  <div className={styles.dataGrid}>
                    {Object.entries(exifData).map(([key, value]) => (
                      <div key={key} className={styles.dataRow}>
                        <span className={styles.dataKey}>{key}</span>
                        <span className={styles.dataValue}>
                          {value.toString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: "1rem",
                  }}
                >
                  <Shield size={48} color="var(--color-success)" />
                  <div style={{ textAlign: "center" }}>
                    <div className={styles.safeText}>Image is Clean</div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        marginTop: "0.25rem",
                      }}
                    >
                      No embedded tracking data found.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pinned Action Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "auto",
              }}
            >
              <button
                onClick={handleReset}
                className={styles.btnSecondary}
                disabled={!imageSrc || isProcessing}
                style={{ width: "fit-content" }}
              >
                <RefreshCw size={18} /> Clear Image
              </button>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={handleSpoof}
                  className={`${styles.btnPrimary} ${styles.btnWarning}`}
                  disabled={!imageSrc || isProcessing}
                  style={{ flex: 1 }}
                >
                  <VenetianMask size={18} /> Spoof EXIF
                </button>

                <button
                  onClick={handleShred}
                  className={`${styles.btnPrimary} ${styles.btnDanger}`}
                  disabled={!imageSrc || isProcessing || !exifData}
                  style={{ flex: 1 }}
                >
                  <Scissors size={18} /> Shred Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}
