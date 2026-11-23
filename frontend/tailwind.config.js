/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#0F766E",
          dark: "#0B3B39",
          accent: "#F59E0B",
          bg: "#F8FAF9",
        },
      },
    },
  },
  plugins: [],
};
