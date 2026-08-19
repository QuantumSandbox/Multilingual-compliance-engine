/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0f172a", // slate-900
          secondary: "#1e293b", // slate-800
          tertiary: "#334155", // slate-700
          hover: "#475569", // slate-600
        },
        text: {
          primary: "#f8fafc", // slate-50
          secondary: "#cbd5e1", // slate-300
          muted: "#94a3b8", // slate-400
          disabled: "#64748b", // slate-500
        },
        accent: {
          primary: "#6366f1", // indigo-500
          "primary-hover": "#818cf8", // indigo-400
          "primary-muted": "#4f46e5", // indigo-600
          success: "#22c55e", // green-500
          "success-muted": "#16a34a", // green-600
          warning: "#f59e0b", // amber-500
          "warning-muted": "#d97706", // amber-600
          danger: "#ef4444", // red-500
          "danger-muted": "#dc2626", // red-600
          info: "#06b6d4", // cyan-500
          "info-muted": "#0891b2", // cyan-600
        },
        border: {
          primary: "#334155", // slate-700
          secondary: "#1e293b", // slate-800
          hover: "#475569", // slate-600
          focus: "#6366f1", // indigo-500
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(99,102,241,0.15)",
        "glow-success": "0 0 20px rgba(34,197,94,0.15)",
        "glow-danger": "0 0 20px rgba(239,68,68,0.15)",
        sm: "0 1px 2px rgba(0,0,0,0.3)",
        md: "0 4px 6px rgba(0,0,0,0.4)",
        lg: "0 10px 15px rgba(0,0,0,0.5)",
        xl: "0 20px 25px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "stagger-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-in-out",
        "slide-in-right": "slide-in-right 300ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
        "slide-down": "slide-down 200ms ease-out",
        "stagger-up": "stagger-up 400ms ease-out both",
        spin: "spin 0.8s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
