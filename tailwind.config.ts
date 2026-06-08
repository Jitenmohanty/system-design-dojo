import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          elevated: "var(--bg-elevated)",
        },
        neon: {
          blue: "var(--neon-blue)",
          green: "var(--neon-green)",
          red: "var(--neon-red)",
          yellow: "var(--neon-yellow)",
          purple: "var(--neon-purple)",
          orange: "var(--neon-orange)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
      },
      fontFamily: {
        display: ["var(--font-chakra)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "neon-blue": "0 0 20px -4px rgba(0,212,255,0.6)",
        "neon-green": "0 0 20px -4px rgba(0,255,136,0.6)",
        "neon-red": "0 0 20px -4px rgba(255,51,102,0.6)",
        "neon-purple": "0 0 20px -4px rgba(168,85,247,0.6)",
      },
      animation: {
        "flow-dash": "flow-dash 1s linear infinite",
        "pulse-glow": "pulse-glow 1.6s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
