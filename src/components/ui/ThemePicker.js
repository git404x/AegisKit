"use client";

import { useTheme } from "./ThemeProvider";
import { Palette } from "lucide-react";

export default function ThemePicker() {
  const { theme, changeTheme } = useTheme();

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        backgroundColor: "var(--color-overlay-heavy)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: "0.5rem 1rem",
        borderRadius: "50px",
        border: "1px solid var(--border-color)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        transition: "all 0.3s ease",
      }}
    >
      <Palette size={18} color="var(--accent)" />
      <select
        value={theme}
        onChange={(e) => changeTheme(e.target.value)}
        style={{
          background: "transparent",
          color: "var(--text-main)",
          border: "none",
          outline: "none",
          fontSize: "0.9rem",
          fontWeight: "500",
          cursor: "pointer",
        }}
      >
        <option value="oled-crimson">OLED Crimson</option>
        <option value="gruvbox-dark">Gruvbox Dark</option>
        <option value="catppuccin-mocha">Catppuccin Mocha</option>
        <option value="light-paper">Light Paper</option>
      </select>
    </div>
  );
}
