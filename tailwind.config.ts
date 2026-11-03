import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#101014",
        surface: "#18181F",
        "surface-2": "#202029",
        primary: "#A78BFA",
        "text-primary": "#F5F5F7",
        "text-secondary": "#A1A1AA",
        border: "#30303A",
        success: "#34D399",
        error: "#F87171",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Segoe UI", "system-ui", "sans-serif"],
        display: ["var(--font-instrument)", "Georgia", "serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseBar: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "pulse-bar": "pulseBar 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
