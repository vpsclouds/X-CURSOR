import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // VS Code / Cursor-like dark theme palette
        editor: {
          bg: "#1e1e1e",
          sidebar: "#252526",
          tab: "#2d2d2d",
          "tab-active": "#1e1e1e",
          border: "#3e3e42",
          hover: "#2a2d2e",
          selection: "#264f78",
        },
        accent: {
          DEFAULT: "#007acc",
          hover: "#1e8fde",
          muted: "#0e4d7e",
        },
        xcursor: {
          bg: "#1e1e1e",
          sidebar: "#252526",
          panel: "#252526",
          border: "#3e3e42",
          text: "#cccccc",
          "text-muted": "#858585",
          "text-bright": "#ffffff",
          accent: "#007acc",
          "accent-hover": "#1e8fde",
          hover: "#2a2d2e",
          selected: "#37373d",
          input: "#3c3c3c",
          success: "#4ec9b0",
          warning: "#dcdcaa",
          error: "#f48771",
          info: "#4fc1ff",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Cascadia Code",
          "Consolas",
          "monospace",
        ],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "editor-xs": "11px",
        "editor-sm": "12px",
        "editor-base": "13px",
        "editor-md": "14px",
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-in-out",
        "slide-in-right": "slideInRight 0.2s ease-out",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
