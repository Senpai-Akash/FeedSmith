/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,tsx,jsx}",
    "./app/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep cobalt accent – primary brand color for FeedSmith
        accent: "#0047AB",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};