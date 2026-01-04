// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linear: {
          primary: '#5E6AD2',
          secondary: '#67657F',
          background: '#FAFAFC',
          surface: '#FFFFFF',
          border: '#E6E7E8',
          text: {
            primary: '#1D1D20',
            secondary: '#67657F',
            muted: '#9593A3'
          }
        }
      }
    },
  },
  plugins: [],
}