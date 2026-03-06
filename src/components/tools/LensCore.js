"use client";

import { useState, useEffect, useRef } from "react";
import { ScanFace, ScanLine } from "lucide-react";
import styles from "./LensCore.module.css";

// Helper to fetch live data without crashing the UI
const fetchLensData = async (text, mode) => {
  try {
    if (mode === "word") {
      // Free open API for dictionary definitions
      const cleanWord = text.replace(/[^a-zA-Z0-9]/g, "");
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`,
      );
      if (!res.ok) return "No secure definition found.";
      const data = await res.json();
      return (
        data[0]?.meanings[0]?.definitions[0]?.definition ||
        "Definition unavailable."
      );
    } else if (mode === "sentence") {
      // Free open API for translations (Translating English to Spanish for the demo)
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`,
      );
      const data = await res.json();
      return data.responseData?.translatedText || "Translation failed.";
    }
  } catch (err) {
    return "Offline or connection error.";
  }
};

export default function LensCore() {
  const [isActive, setIsActive] = useState(false);
  const [extractMode, setExtractMode] = useState("word"); // 'word' or 'sentence'
  const [hoverData, setHoverData] = useState(null);

  const containerRef = useRef(null);
  const currentTargetRef = useRef("");

  useEffect(() => {
    if (!isActive) {
      setHoverData(null);
      currentTargetRef.current = "";
      return;
    }

    const handleMouseMove = async (e) => {
      let range;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
        }
      }

      if (!range || range.startContainer.nodeType !== Node.TEXT_NODE) {
        if (currentTargetRef.current !== "") {
          setHoverData(null);
          currentTargetRef.current = "";
        }
        return;
      }

      const textNode = range.startContainer;
      const text = textNode.nodeValue;
      const offset = range.startOffset;

      let start = offset;
      let end = offset;

      // --- ADVANCED DOM EXTRACTION MATH ---
      if (extractMode === "word") {
        while (start > 0 && /\w/.test(text[start - 1])) start--;
        while (end < text.length && /\w/.test(text[end])) end++;
      } else if (extractMode === "sentence") {
        // Walk back until we hit a punctuation mark (.!?) followed by a space, or start of node
        while (
          start > 0 &&
          !/(?:^|[.!?]\s)/.test(text.slice(Math.max(0, start - 2), start))
        )
          start--;
        // Walk forward until we hit a punctuation mark
        while (end < text.length && !/[.!?]/.test(text[end])) end++;
        if (end < text.length) end++; // Include the punctuation mark
      }

      const extractedText = text.slice(start, end).trim();

      // Only trigger if we moved to a NEW target
      if (
        extractedText.length > 2 &&
        extractedText !== currentTargetRef.current
      ) {
        currentTargetRef.current = extractedText;

        const targetRange = document.createRange();
        try {
          targetRange.setStart(
            textNode,
            start + text.slice(start, end).indexOf(extractedText),
          );
          targetRange.setEnd(
            textNode,
            start +
              text.slice(start, end).indexOf(extractedText) +
              extractedText.length,
          );

          const rect = targetRange.getBoundingClientRect();

          // 1. Immediately show the UI in a "Loading" state
          setHoverData({
            text: extractedText,
            result: null,
            loading: true,
            rect: rect,
          });

          // 2. Fetch the real data asynchronously
          const resultText = await fetchLensData(extractedText, extractMode);

          // 3. Update the UI ONLY if the user hasn't moved their mouse to a new word/sentence while waiting
          if (currentTargetRef.current === extractedText) {
            setHoverData({
              text: extractedText,
              result: resultText,
              loading: false,
              rect: rect,
            });
          }
        } catch (err) {}
      } else if (extractedText.length <= 2 && currentTargetRef.current !== "") {
        setHoverData(null);
        currentTargetRef.current = "";
      }
    };

    const container = containerRef.current;
    container.addEventListener("mousemove", handleMouseMove);

    const handleMouseLeave = () => {
      setHoverData(null);
      currentTargetRef.current = "";
    };

    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isActive, extractMode]); // Re-run effect if mode changes

  return (
    <div className={styles.sandboxContainer}>
      <div className={styles.controls}>
        <div>
          <h3 style={{ margin: "0 0 0.25rem 0", color: "var(--text-main)" }}>
            Lens Engine (Live)
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            Real-time API extraction for words and sentences.
          </p>
        </div>
        <div className={styles.controlGroup}>
          <select
            className={styles.modeSelect}
            value={extractMode}
            onChange={(e) => setExtractMode(e.target.value)}
          >
            <option value="word">Word (Define)</option>
            <option value="sentence">Sentence (Translate ES)</option>
          </select>

          <button
            className={`${styles.btnPrimary} ${isActive ? styles.active : ""}`}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? <ScanLine size={18} /> : <ScanFace size={18} />}
            {isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`${styles.article} ${isActive ? styles.lensActive : ""}`}
      >
        <p>
          Welcome to the AegisKit Lens sandbox. This area simulates an external
          website like Medium or a Wikipedia article.
        </p>
        <p>
          In a modern digital landscape, privacy is not just a feature, it is a
          fundamental right. Through the power of cryptography, we can build
          tools that are completely decentralized and immutable.
        </p>
        <p>
          Activate the lens above, and switch the dropdown to "Sentence". Notice
          how the engine dynamically calculates the bounds of entire grammatical
          structures and fetches real-time Spanish translations over the network
          while you hover.
        </p>
      </div>

      {isActive && (
        <>
          <div
            className={`${styles.textHighlight} ${hoverData ? styles.visible : ""}`}
            style={{
              top: hoverData?.rect.top || 0,
              left: hoverData?.rect.left || 0,
              width: hoverData?.rect.width || 0,
              height: hoverData?.rect.height || 0,
            }}
          />

          <div
            className={`${styles.lensTooltip} ${hoverData ? styles.visible : ""}`}
            style={{
              left: hoverData
                ? hoverData.rect.left + hoverData.rect.width / 2
                : 0,
              top: hoverData?.rect.top || 0,
            }}
          >
            <span className={styles.sourceWord}>
              {hoverData?.text || "Scanning"}
            </span>
            <div className={styles.translatedWord}>
              {hoverData?.loading ? (
                <div className={styles.loadingSkeleton} />
              ) : (
                hoverData?.result
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
