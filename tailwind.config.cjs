/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: "#2563eb" },
      borderRadius: { "2xl": "1rem" },
      boxShadow: { card: "0 8px 24px rgba(0,0,0,0.08)" },
    },
  },
  plugins: [],
};
