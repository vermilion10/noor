/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noor: {
          bg:       '#0f1710',
          surface:  '#1a2b1c',
          border:   '#2d4a30',
          primary:  '#4a7c59',
          accent:   '#6ba583',
          muted:    '#3a5c42',
          text:     '#e8f0ea',
          subtle:   '#a8c4ad',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arabic: ['Amiri', 'serif'],
        cairo: ['Cairo', 'sans-serif']
      }
    },
  },
  plugins: [],
}
