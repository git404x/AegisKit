"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import {
  FileText,
  Download,
  Scissors,
  RefreshCw,
  Layers,
  PenTool,
  X,
} from "lucide-react";
import styles from "./PdfCore.module.css";

export default function PdfCore() {
  const [mode, setMode] = useState("extract"); // extract | merge | watermark
  const [files, setFiles] = useState([]);
  const [pageSelection, setPageSelection] = useState("");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files).filter(
      (f) => f.type === "application/pdf",
    );
    if (uploadedFiles.length === 0) return;

    // Load lightweight metadata for the first file (useful for extract mode)
    const newFiles = await Promise.all(
      uploadedFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        let pageCount = 0;
        try {
          const pdfDoc = await PDFDocument.load(arrayBuffer, {
            ignoreEncryption: true,
          });
          pageCount = pdfDoc.getPageCount();
        } catch (err) {
          console.error("Failed to read pages for", file.name);
        }
        return { file, name: file.name, buffer: arrayBuffer, pageCount };
      }),
    );

    if (mode === "merge") {
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFiles([newFiles[0]]); // Extract and Watermark only use one file
      setPageSelection(`1-${newFiles[0].pageCount}`);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const parsePageSelection = (selectionStr, maxPages) => {
    const pagesToExtract = new Set();
    const parts = selectionStr.split(",").map((s) => s.trim());
    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        if (start > 0 && end >= start && end <= maxPages) {
          for (let i = start; i <= end; i++) pagesToExtract.add(i - 1);
        }
      } else {
        const pageNum = Number(part);
        if (pageNum > 0 && pageNum <= maxPages) pagesToExtract.add(pageNum - 1);
      }
    }
    return Array.from(pagesToExtract).sort((a, b) => a - b);
  };

  const executeOperation = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    // Yield to let UI update
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      let finalPdfBytes;
      let outputName = "document";

      if (mode === "extract") {
        const sourcePdf = await PDFDocument.load(files[0].buffer);
        const newPdf = await PDFDocument.create();
        const pagesToCopy = parsePageSelection(
          pageSelection,
          files[0].pageCount,
        );
        if (pagesToCopy.length === 0)
          throw new Error("No valid pages selected.");

        const copiedPages = await newPdf.copyPages(sourcePdf, pagesToCopy);
        copiedPages.forEach((page) => newPdf.addPage(page));
        finalPdfBytes = await newPdf.save();
        outputName = `extracted-${files[0].name}`;
      } else if (mode === "merge") {
        const mergedPdf = await PDFDocument.create();
        for (const f of files) {
          const pdf = await PDFDocument.load(f.buffer);
          const copiedPages = await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices(),
          );
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        finalPdfBytes = await mergedPdf.save();
        outputName = `merged-document.pdf`;
      } else if (mode === "watermark") {
        const pdf = await PDFDocument.load(files[0].buffer);
        const helveticaFont = await pdf.embedFont(StandardFonts.HelveticaBold);
        const pages = pdf.getPages();

        pages.forEach((page) => {
          const { width, height } = page.getSize();
          const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, 40);
          page.drawText(watermarkText, {
            x: width / 2 - textWidth / 2,
            y: height / 2,
            size: 40,
            font: helveticaFont,
            color: rgb(0.9, 0.2, 0.2), // Aegis Crimson
            opacity: 0.4,
            rotate: degrees(45),
          });
        });
        finalPdfBytes = await pdf.save();
        outputName = `watermarked-${files[0].name}`;
      }

      // Download payload
      const blob = new Blob([finalPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = outputName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Operation failed:", err);
      alert("Error processing document. Ensure it is not password protected.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setFiles([]); // Clear files when switching context to prevent logic errors
  };

  return (
    <div className={styles.wrapper}>
      {/* Upload & Context Area */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === "extract" ? styles.tabActive : ""}`}
            onClick={() => handleModeChange("extract")}
          >
            Extract
          </button>
          <button
            className={`${styles.tab} ${mode === "merge" ? styles.tabActive : ""}`}
            onClick={() => handleModeChange("merge")}
          >
            Merge
          </button>
          <button
            className={`${styles.tab} ${mode === "watermark" ? styles.tabActive : ""}`}
            onClick={() => handleModeChange("watermark")}
          >
            Watermark
          </button>
        </div>

        <div
          className={styles.dropZone}
          onClick={() =>
            (mode === "merge" || files.length === 0) &&
            fileInputRef.current?.click()
          }
          style={{
            cursor:
              mode === "merge" || files.length === 0 ? "pointer" : "default",
            padding: files.length > 0 && mode !== "merge" ? "2rem" : "3rem",
          }}
        >
          {files.length === 0 ? (
            <>
              {mode === "merge" ? (
                <Layers size={48} color="var(--text-muted)" />
              ) : (
                <FileText size={48} color="var(--text-muted)" />
              )}
              <p style={{ color: "var(--text-muted)" }}>
                {mode === "merge"
                  ? "Select Multiple PDFs"
                  : "Select a PDF Document"}
              </p>
            </>
          ) : mode !== "merge" ? (
            <div className={styles.fileInfo}>
              <FileText size={48} style={{ color: "var(--accent)" }} />
              <span style={{ fontWeight: "bold" }}>{files[0].name}</span>
              <span className={styles.badge}>{files[0].pageCount} Pages</span>
            </div>
          ) : (
            <>
              <Layers
                size={32}
                color="var(--accent)"
                style={{ marginBottom: "1rem" }}
              />
              <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                {files.length} Files Queued for Merge
              </p>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                Click to add more
              </span>
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className={styles.hiddenInput}
            accept="application/pdf"
            multiple={mode === "merge"}
            onChange={handleFileUpload}
          />
        </div>

        {/* File List for Merge Mode */}
        {mode === "merge" && files.length > 0 && (
          <div className={styles.fileList}>
            {files.map((f, i) => (
              <div key={i} className={styles.fileItem}>
                <span
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    maxWidth: "80%",
                  }}
                >
                  {i + 1}. {f.name}
                </span>
                <X
                  size={16}
                  style={{ cursor: "pointer", color: "var(--accent)" }}
                  onClick={() => removeFile(i)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Controls Area */}
      <div className={styles.controls}>
        {mode === "extract" && (
          <div className={styles.inputGroup}>
            <label className={styles.label}>Pages to Extract</label>
            <input
              type="text"
              className={styles.input}
              value={pageSelection}
              onChange={(e) => setPageSelection(e.target.value)}
              disabled={files.length === 0}
            />
          </div>
        )}

        {mode === "watermark" && (
          <div className={styles.inputGroup}>
            <label className={styles.label}>Watermark Text</label>
            <input
              type="text"
              className={styles.input}
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              disabled={files.length === 0}
            />
          </div>
        )}

        {mode === "merge" && (
          <div className={styles.inputGroup}>
            <label className={styles.label}>Execution Protocol</label>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                lineHeight: "1.5",
              }}
            >
              Documents will be merged in the exact order listed. Ensure you
              upload or arrange them sequentially.
            </p>
          </div>
        )}

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
            disabled={files.length === 0 || isProcessing}
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={executeOperation}
            className={styles.btnPrimary}
            disabled={
              files.length === 0 ||
              (mode === "merge" && files.length < 2) ||
              isProcessing
            }
            style={{ flex: 1 }}
          >
            {isProcessing ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : mode === "extract" ? (
              <Scissors size={18} />
            ) : mode === "merge" ? (
              <Layers size={18} />
            ) : (
              <PenTool size={18} />
            )}
            {isProcessing
              ? "Processing..."
              : mode === "extract"
                ? "Extract"
                : mode === "merge"
                  ? "Merge PDFs"
                  : "Apply Watermark"}
          </button>
        </div>
      </div>
    </div>
  );
}
