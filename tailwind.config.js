/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          gold: '#f59e0b',
          accent: '#10b981'
        }
      }
    },
  },
  plugins: [],
}