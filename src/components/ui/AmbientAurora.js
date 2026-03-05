"use client";

import styles from "./AmbientAurora.module.css";

export default function AmbientAurora() {
  return (
    <div className={styles.auroraWrapper}>
      {/* SVG Noise Filter: Generates algorithmic fractal noise.
        This provides that premium "grainy/tactile" aesthetic without needing an image asset.
      */}
      <svg className={styles.noiseOverlay} xmlns="http://www.w3.org/2000/svg">
        <filter id="aegis-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#aegis-noise)" />
      </svg>

      {/* The drifting volumetric light fields */}
      <div className={styles.lightChamber}>
        <div className={styles.blobMain}></div>
        <div className={styles.blobSecondary}></div>
      </div>
    </div>
  );
}
