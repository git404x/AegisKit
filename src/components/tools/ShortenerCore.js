"use client";

import { useState } from "react";
import { Link as LinkIcon, Copy, Check, AlertCircle } from "lucide-react";
import styles from "./ShortenerCore.module.css";

const WORKER_URL = process.env.NEXT_PUBLIC_CF_WORKER_URL?.replace(/\/$/, "");

// Base64 Encoder: Prevents "Maximum call stack size" errors on older browsers
const bufferToBase64UrlSafe = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const generatePasscode = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
};

export default function ShortenerCore() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copyState, setCopyState] = useState("idle");

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShortUrl(null);

    if (!WORKER_URL) {
      setError("System Error: Missing NEXT_PUBLIC_CF_WORKER_URL in .env.local");
      setLoading(false);
      return;
    }

    let finalUrl = originalUrl.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    try {
      // 1. Generate 10-char passcode & derive AES key via SHA-256
      const passcode = generatePasscode(10);
      const encoder = new TextEncoder();
      const passBytes = encoder.encode(passcode);
      const keyHash = await window.crypto.subtle.digest("SHA-256", passBytes);

      const key = await window.crypto.subtle.importKey(
        "raw",
        keyHash,
        { name: "AES-GCM" },
        false,
        ["encrypt"],
      );

      // 2. Encrypt URL
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoder.encode(finalUrl),
      );

      const cipherPayload =
        bufferToBase64UrlSafe(iv) +
        "." +
        bufferToBase64UrlSafe(encryptedBuffer);

      // 3. CRITICAL FIX: Guarantee exactly 6 hex characters for the Vault Firewall
      const idBuffer = window.crypto.getRandomValues(new Uint8Array(3));
      const id = Array.from(idBuffer)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // 4. Send to Vault
      const res = await fetch(`${WORKER_URL}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, cipherText: cipherPayload }),
      });

      if (!res.ok)
        throw new Error(
          "Vault rejected request. Check Cloudflare Worker logs.",
        );

      // 5. Success
      setShortUrl(`${WORKER_URL}/${id}#${passcode}`);
      setOriginalUrl("");
    } catch (err) {
      console.error(err);
      setError("Cryptographic operation failed or Vault is unreachable.");
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
