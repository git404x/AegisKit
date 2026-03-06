"use client";

import { useEffect, useRef } from "react";
import styles from "./HexaPlasma.module.css";

// Helper to convert theme hex variables into RGB for canvas opacity manipulation
const getAccentRgb = () => {
  if (typeof window === "undefined") return { r: 255, g: 51, b: 51 }; // Fallback Crimson
  const root = document.documentElement;
  const color = getComputedStyle(root).getPropertyValue("--accent").trim();
  if (color.startsWith("#") && color.length === 7) {
    return {
      r: parseInt(color.slice(1, 3), 16),
      g: parseInt(color.slice(3, 5), 16),
      b: parseInt(color.slice(5, 7), 16),
    };
  }
  return { r: 150, g: 150, b: 150 }; // Safe fallback
};

export default function HexaPlasmaBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];
    const particleCount = 25; // Keeps it subtle and performant

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // Initialize Hexagons
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 40 + 10, // Mix of small to large
        speedY: (Math.random() * 0.5 + 0.2) * -1, // Flow upwards
        speedX: (Math.random() - 0.5) * 0.2, // Slight horizontal drift
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        opacity: Math.random() * 0.4 + 0.1, // Glassmorphism varying opacities
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rgb = getAccentRgb();

      particles.forEach((p) => {
        // Update physics
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        // Wrap around screen
        if (p.y + p.size < 0) {
          p.y = canvas.height + p.size;
          p.x = Math.random() * canvas.width;
        }

        // Draw Hexagon with a 3D tilt (Squishing the Y axis)
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 + p.rotation;
          const px = p.x + p.size * Math.cos(angle);
          const py = p.y + p.size * Math.sin(angle) * 0.85; // 0.85 applies the 3D perspective

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Glass outline
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Very subtle fill for depth
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity * 0.15})`;
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
      {/* 1. Volumetric Plasma */}
      <div className={`${styles.plasmaBlob} ${styles.blobPrimary}`} />
      <div className={`${styles.plasmaBlob} ${styles.blobSecondary}`} />

      {/* 2. 3D Floating Hexagons */}
      <canvas ref={canvasRef} className={styles.hexCanvas} />

      {/* 3. Cryptographic Noise Texture */}
      <div className={styles.noise} />
    </div>
  );
}
