/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/popup/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
        brand: {
          emerald: "#10B981",
          amber: "#F59E0B",
          coral: "#EF4444",
          violet: "#6366F1",
        }
      },
    },
  },
  plugins: [],
}
