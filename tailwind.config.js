/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1b8a36',
          yellow: '#f8b803',
          red: '#dc2626',
          dark: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
