"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { FileText, Download, Scissors, RefreshCw } from "lucide-react";
import styles from "./PdfCore.module.css";

export default function PdfCore() {
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pageSelection, setPageSelection] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;

    setFileName(file.name);
    const arrayBuffer = await file.arrayBuffer();
    setFileData(arrayBuffer);

    // Load PDF lightly just to get metadata
    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
      setPageSelection(`1-${pdfDoc.getPageCount()}`);
    } catch (err) {
      console.error("Failed to parse PDF:", err);
      alert("Failed to read PDF. It might be encrypted or corrupted.");
    }
  };

  const parsePageSelection = (selectionStr, maxPages) => {
    const pagesToExtract = new Set();
    const parts = selectionStr.split(",").map((s) => s.trim());

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        if (start > 0 && end >= start && end <= maxPages) {
          for (let i = start; i <= end; i++) pagesToExtract.add(i - 1); // 0-indexed
        }
      } else {
        const pageNum = Number(part);
        if (pageNum > 0 && pageNum <= maxPages) {
          pagesToExtract.add(pageNum - 1);
        }
      }
    }
    return Array.from(pagesToExtract).sort((a, b) => a - b);
  };

  const handleExtract = async () => {
    if (!fileData) return;
    setIsProcessing(true);

    try {
      const sourcePdf = await PDFDocument.load(fileData);
      const newPdf = await PDFDocument.create();

      const pagesToCopy = parsePageSelection(pageSelection, pageCount);
      if (pagesToCopy.length === 0) throw new Error("No valid pages selected.");

      const copiedPages = await newPdf.copyPages(sourcePdf, pagesToCopy);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `extracted-${fileName}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Extraction failed:", err);
      alert("Error extracting pages. Check your page range.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFileData(null);
    setFileName("");
    setPageCount(0);
    setPageSelection("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={styles.wrapper}>
      {/* Upload & Info Area */}
      <div
        className={styles.dropZone}
        onClick={() => !fileData && fileInputRef.current?.click()}
        style={{ cursor: fileData ? "default" : "pointer" }}
      >
        {!fileData ? (
          <>
            <FileText size={48} style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-muted)" }}>Select a PDF Document</p>
          </>
        ) : (
          <div className={styles.fileInfo}>
            <FileText size={48} style={{ color: "var(--accent)" }} />
            <span style={{ fontWeight: "bold" }}>{fileName}</span>
            <span className={styles.badge}>{pageCount} Pages Detected</span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className={styles.hiddenInput}
          accept="application/pdf"
          onChange={handleFileUpload}
        />
      </div>

      {/* Controls Area */}
      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Pages to Extract</label>
          <input
            type="text"
            className={styles.input}
            value={pageSelection}
            onChange={(e) => setPageSelection(e.target.value)}
            placeholder="e.g., 1, 3, 5-10"
            disabled={!fileData}
          />
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginTop: "0.25rem",
            }}
          >
            Format: comma-separated or ranges (e.g., "1, 3, 5-7")
          </span>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
          <button
            onClick={handleReset}
            className={styles.btnSecondary}
            disabled={!fileData || isProcessing}
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleExtract}
            className={styles.btnPrimary}
            disabled={!fileData || isProcessing}
            style={{ flex: 1 }}
          >
            {isProcessing ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Scissors size={18} />
            )}
            {isProcessing ? "Processing..." : "Extract Pages"}
          </button>
        </div>
      </div>
    </div>
  );
}
