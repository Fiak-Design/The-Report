import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Report brand colors
        background: "#050B19",
        surface: "#0D1526",
        "surface-2": "#131E30",
        accent: {
          green: "#34C759",
          yellow: "#FFD60A",
          red: "#FF3B30",
          blue: "#0A84FF",
        },
      },
      fontFamily: {
        sans: ["SF Pro Rounded", "SF Pro Display", "-apple-system", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4": "4px",
        "6": "6px",
        "8": "8px",
        "12": "12px",
        "16": "16px",
        "20": "20px",
        "36": "36px",
      },
    },
  },
  plugins: [],
};

export default config;
