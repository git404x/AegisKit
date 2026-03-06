"use client";

import { useState, useEffect, useRef } from "react";
import { ScanFace, ScanLine } from "lucide-react";
import styles from "./LensCore.module.css";

const MOCK_DICTIONARY = {
  cryptography: "The mathematical practice of securing communication.",
  privacy: "The right to remain free from surveillance.",
  decentralized: "Distributed architecture without a single point of failure.",
  aegis: "A system of absolute protection.",
  immutable: "Data that mathematically cannot be altered.",
  telemetry: "Hidden, automated data collection.",
};

export default function LensCore() {
  const [isActive, setIsActive] = useState(false);

  // Now tracks the exact DOM Rect instead of the mouse cursor
  const [hoverData, setHoverData] = useState(null);

  const containerRef = useRef(null);
  const currentWordRef = useRef("");

  useEffect(() => {
    if (!isActive) {
      setHoverData(null);
      currentWordRef.current = "";
      return;
    }

    const handleMouseMove = (e) => {
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
        if (currentWordRef.current !== "") {
          setHoverData(null);
          currentWordRef.current = "";
        }
        return;
      }

      const textNode = range.startContainer;
      const text = textNode.nodeValue;
      const offset = range.startOffset;

      // Extract the word boundaries
      let start = offset;
      while (start > 0 && /\w/.test(text[start - 1])) start--;
      let end = offset;
      while (end < text.length && /\w/.test(text[end])) end++;

      const word = text.slice(start, end).toLowerCase();

      // Only update if we hover over a valid, NEW word
      if (word.length > 2 && word !== currentWordRef.current) {
        currentWordRef.current = word;

        // CRITICAL UPDATE: Create a physical range wrapping JUST the word to get its coordinates
        const wordRange = document.createRange();
        try {
          wordRange.setStart(textNode, start);
          wordRange.setEnd(textNode, end);

          // Get the exact physical dimensions of the text on the screen
          const rect = wordRange.getBoundingClientRect();

          setHoverData({
            word: word,
            translation: MOCK_DICTIONARY[word] || "No secure definition found.",
            rect: rect, // We store the dimensions, not the mouse position!
          });
        } catch (err) {
          // Failsafe for edge-case DOM boundaries
        }
      } else if (word.length <= 2 && currentWordRef.current !== "") {
        setHoverData(null);
        currentWordRef.current = "";
      }
    };

    const container = containerRef.current;
    container.addEventListener("mousemove", handleMouseMove);

    const handleMouseLeave = () => {
      setHoverData(null);
      currentWordRef.current = "";
    };

    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isActive]);

  return (
    <div className={styles.sandboxContainer}>
      <div className={styles.controls}>
        <div>
          <h3 style={{ margin: "0 0 0.25rem 0", color: "var(--text-main)" }}>
            Lens Engine
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            Bounding-box DOM extraction and anchored translation.
          </p>
        </div>
        <button
          className={`${styles.btnPrimary} ${isActive ? styles.active : ""}`}
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? <ScanLine size={18} /> : <ScanFace size={18} />}
          {isActive ? "Deactivate Lens" : "Activate Lens"}
        </button>
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
          In a modern digital landscape, <strong>privacy</strong> is not just a
          feature, it is a fundamental right. Through the power of{" "}
          <strong>cryptography</strong>, we can build tools that are completely
          <strong> decentralized</strong> and <strong>immutable</strong>.
        </p>
        <p>
          Activate the lens above, and hover your mouse over the bolded words
          (or any word). Notice how the engine extracts the geometric bounding
          box of the text, blocking external <strong>telemetry</strong>.
        </p>
      </div>

      {/* --- THE BOUDNING BOX UI --- */}
      {isActive && (
        <>
          {/* 1. The Word Highlighter (Snaps perfectly over the text) */}
          <div
            className={`${styles.textHighlight} ${hoverData ? styles.visible : ""}`}
            style={{
              top: hoverData?.rect.top || 0,
              left: hoverData?.rect.left || 0,
              width: hoverData?.rect.width || 0,
              height: hoverData?.rect.height || 0,
            }}
          />

          {/* 2. The Anchored Manga Tooltip */}
          <div
            className={`${styles.lensTooltip} ${hoverData ? styles.visible : ""}`}
            style={{
              // Centers horizontally based on the word's width, and anchors to the top of the word
              left: hoverData
                ? hoverData.rect.left + hoverData.rect.width / 2
                : 0,
              top: hoverData?.rect.top || 0,
            }}
          >
            <span className={styles.sourceWord}>
              {hoverData?.word || "Scanning"}
            </span>
            <span className={styles.translatedWord}>
              {hoverData ? (
                <>
                  <strong>{hoverData.translation.split(" ")[0]}</strong>{" "}
                  {hoverData.translation.substring(
                    hoverData.translation.indexOf(" ") + 1,
                  )}
                </>
              ) : (
                "..."
              )}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
