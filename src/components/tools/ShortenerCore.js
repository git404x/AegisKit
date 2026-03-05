"use client";

import { useState } from "react";
import { Link as LinkIcon, Copy, Check, AlertCircle } from "lucide-react";
import styles from "./ShortenerCore.module.css";

export default function ShortenerCore() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copyState, setCopyState] = useState("idle"); // "idle" | "success" | "error"

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShortUrl(null);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl }),
      });

      // ROBUST JSON SAFEGUARD
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        // Fallback if the server threw a fatal HTML error
        throw new Error(
          `Server returned a non-JSON response (Status: ${res.status}).`,
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to forge link");
      }

      setShortUrl(data.shortUrl);
      setOriginalUrl("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopyState("success");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (err) {
      console.warn("Clipboard access denied:", err);
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 3000);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleShorten} className={styles.inputGroup}>
        <label className={styles.label}>Destination URL</label>
        <input
          type="text"
          required
          className={styles.input}
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="e.g. github.com or https://example.com/..."
        />
        {error && <span className={styles.error}>{error}</span>}

        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={loading || !originalUrl}
        >
          <LinkIcon size={18} />
          {loading ? "Forging Link..." : "Create Shortlink"}
        </button>
      </form>

      {shortUrl && (
        <div className={styles.resultBox}>
          <span className={styles.label}>Your Secure Link</span>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.shortLink}
          >
            {shortUrl}
          </a>

          <button onClick={handleCopy} className={styles.btn}>
            {copyState === "success" && <Check size={16} />}
            {copyState === "error" && <AlertCircle size={16} />}
            {copyState === "idle" && <Copy size={16} />}
            {copyState === "success"
              ? "Copied"
              : copyState === "error"
                ? "Manual Copy Required"
                : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
}
