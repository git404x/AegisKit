"use client";

import { useState } from "react";
import { Link as LinkIcon, Copy, Check, AlertCircle } from "lucide-react";
import styles from "./ShortenerCore.module.css";

const WORKER_URL = process.env.NEXT_PUBLIC_CF_WORKER_URL?.replace(/\/$/, "");

const buf2hex = (buffer) => {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
};

const generatePasscode = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++)
    result += chars[randomValues[i] % chars.length];
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
      // 1. Generate keys
      const passcode = generatePasscode(10);
      const passBytes = new TextEncoder().encode(passcode);
      const keyHash = await window.crypto.subtle.digest("SHA-256", passBytes);
      const key = await window.crypto.subtle.importKey(
        "raw",
        keyHash,
        { name: "AES-GCM" },
        false,
        ["encrypt"],
      );

      // 2. Encrypt
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        new TextEncoder().encode(finalUrl),
      );

      // 3. Convert to clean Hex string separated by a colon
      const cipherPayload = buf2hex(iv) + ":" + buf2hex(encryptedBuffer);

      // 4. Generate perfectly safe 6-character hex ID
      const idBuffer = window.crypto.getRandomValues(new Uint8Array(3));
      const id = buf2hex(idBuffer);

      // 5. Fire to Vault
      const res = await fetch(`${WORKER_URL}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, cipherText: cipherPayload }),
      });

      // Pass the raw server error directly to the UI if it fails
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Vault rejected request: ${errText}`);
      }

      setShortUrl(`${WORKER_URL}/${id}#${passcode}`);
      setOriginalUrl("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Cryptographic operation failed.");
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
          <LinkIcon size={18} />{" "}
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
