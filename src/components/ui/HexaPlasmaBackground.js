"use client";

import { useEffect, useRef } from "react";
import styles from "./HexaPlasma.module.css";

// Helper to extract the exact RGB value from the active theme
const getAccentRgb = () => {
  if (typeof window === "undefined") return { r: 255, g: 51, b: 51 };
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent")
    .trim();
  if (color.startsWith("#") && color.length === 7) {
    return {
      r: parseInt(color.slice(1, 3), 16),
      g: parseInt(color.slice(3, 5), 16),
      b: parseInt(color.slice(5, 7), 16),
    };
  }
  return { r: 150, g: 150, b: 150 };
};

export default function HexaPlasmaBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    // Optimal count for distribution without bloating
    const particleCount = 35;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // Uniform Spawning: Divide screen into grid sections to prevent clumping
    const initParticles = () => {
      particles = [];
      const columns = Math.ceil(
        Math.sqrt(particleCount * (canvas.width / canvas.height)),
      );
      const rows = Math.ceil(particleCount / columns);
      const colWidth = canvas.width / columns;
      const rowHeight = canvas.height / rows;

      let count = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          if (count >= particleCount) break;

          particles.push({
            // Base X/Y strictly within their grid cell to ensure uniform spread
            baseX: c * colWidth + Math.random() * colWidth,
            y: r * rowHeight + Math.random() * rowHeight,
            size: Math.random() * 35 + 15,

            // Flow speed (Upwards)
            speedY: Math.random() * 0.4 + 0.15,

            // Fluid "Bouncing/Drifting" physics
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.015 + 0.005,
            wobbleAmplitude: Math.random() * 40 + 20,

            // Independent 3D Tumbling
            rotationZ: Math.random() * Math.PI * 2,
            rotSpeedZ: (Math.random() - 0.5) * 0.008,
            flipPhase: Math.random() * Math.PI * 2,
            flipSpeed: Math.random() * 0.02 + 0.01,

            opacity: Math.random() * 0.25 + 0.05,
          });
          count++;
        }
      }
    };

    initParticles();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rgb = getAccentRgb();

      particles.forEach((p) => {
        // 1. Flow Upwards
        p.y -= p.speedY;

        // 2. Fluid Wobble (Left/Right drift using Sine waves)
        p.wobble += p.wobbleSpeed;
        const currentX = p.baseX + Math.sin(p.wobble) * p.wobbleAmplitude;

        // 3. 3D Tumbling
        p.rotationZ += p.rotSpeedZ;
        p.flipPhase += p.flipSpeed;
        // Simulates a 3D flip by squishing the Y axis continuously
        const flipScaleY = Math.abs(Math.cos(p.flipPhase)) * 0.7 + 0.3;

        // Wrap around seamlessly
        if (p.y + p.size < 0) {
          p.y = canvas.height + p.size;
          // Assign a random baseX across the whole screen when it respawns
          p.baseX = Math.random() * canvas.width;
        }

        // Draw the Tumbling Hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 + p.rotationZ;
          const px = currentX + p.size * Math.cos(angle);
          const py = p.y + p.size * Math.sin(angle) * flipScaleY;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Sleek Glass Stroke
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = "round";
        ctx.stroke();

        // Deep Glass Fill
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity * 0.12})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Three-Layer Aurora Engine */}
      <div className={`${styles.plasmaBlob} ${styles.blobPrimary}`} />
      <div className={`${styles.plasmaBlob} ${styles.blobSecondary}`} />
      <div className={`${styles.plasmaBlob} ${styles.blobTertiary}`} />

      {/* Fluid 3D Hexagon Physics */}
      <canvas ref={canvasRef} className={styles.hexCanvas} />

      {/* Cryptographic Grain Overlay */}
      <div className={styles.noise} />
    </div>
  );
}
