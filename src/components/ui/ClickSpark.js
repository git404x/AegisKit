"use client";

import { useRef, useEffect, useCallback } from "react";

const ClickSpark = ({
  sparkColor = "var(--accent)",
  sparkSize = 10,
  sparkRadius = 24,
  sparkCount = 8,
  duration = 500,
  easing = "ease-out",
  extraScale = 1.0,
  children,
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);

  // Forces the canvas to match the exact window dimensions without breaking scroll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const easeFunc = useCallback(
    (t) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t); // ease-out (smooth deceleration)
      }
    },
    [easing],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;

    const draw = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

        // Physics: The spark stretches out, then shrinks as it reaches the edge
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        // Subtlety: Round the edges and fade opacity smoothly based on progress
        ctx.globalAlpha = 1 - Math.pow(progress, 1.5); // Fades faster near the end
        ctx.lineCap = "round";
        ctx.strokeStyle = spark.color;
        ctx.lineWidth = 2.5; // Slightly thicker for visibility

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      // Reset global alpha so we don't accidentally affect future renders
      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationId);
  }, [sparkSize, sparkRadius, duration, easeFunc, extraScale]);

  const handleClick = (e) => {
    const now = performance.now();

    // Dynamically resolve CSS variables into a raw color for the Canvas API
    let activeColor = sparkColor;
    if (sparkColor.startsWith("var(")) {
      const varName = sparkColor.match(/var\(([^)]+)\)/)[1];
      activeColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim() || "#ffffff";
    }

    const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
      x: e.clientX,
      y: e.clientY,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now,
      color: activeColor,
    }));

    sparksRef.current.push(...newSparks);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh", // Ensures clicking anywhere on the page triggers it
      }}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed", // Floats above everything
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none", // CRITICAL: Allows you to click the buttons underneath!
          zIndex: 99999,
        }}
      />
      {children}
    </div>
  );
};

export default ClickSpark;
