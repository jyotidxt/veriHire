import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          light: "#FAFAFA",
          dark: "#0B0F19",
        },
        card: {
          light: "rgba(255, 255, 255, 0.7)",
          dark: "rgba(17, 24, 39, 0.7)",
        },
        border: {
          light: "rgba(0, 0, 0, 0.08)",
          dark: "rgba(255, 255, 255, 0.08)",
        },
        brand: {
          emerald: "#10B981",
          amber: "#F59E0B",
          coral: "#EF4444",
          violet: "#6366F1",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0, 0, 0, 0.03)",
        "glass-dark": "0 4px 30px rgba(0, 0, 0, 0.2)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
