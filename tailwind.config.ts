import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0F172A",
          light: "#E2E8F0",
          dark: "#020617",
        },
        secondary: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
          dark: "#047857",
        },
        accent: {
          DEFAULT: "#14B8A6",
          light: "#CCFBF1",
          dark: "#0F766E",
        },
        success: {
          DEFAULT: "#059669",
          light: "#ECFDF5",
          dark: "#065F46",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FFFBEB",
          dark: "#92400E",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
          dark: "#991B1B",
        },
      },
    },
  },
  plugins: [],
};
export default config;
