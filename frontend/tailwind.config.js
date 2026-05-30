/** @type {import('tailwindcss').Config} */
const isFamily = process.env.VITE_APP_THEME === 'family';

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: isFamily
          ? { DEFAULT: '#0d1b38', light: '#162d6b', dark: '#070f22' }
          : { DEFAULT: '#0d1b10', light: '#1a3320', dark: '#060e09' },
        gold: {
          DEFAULT: '#f5c518',
          light: '#ffd700',
          dark: '#d4a500',
        },
        // "hikma" is reused as the brand accent colour for both themes
        hikma: isFamily
          ? { DEFAULT: '#0ea5e9', light: '#38bdf8', dark: '#0284c7' }  // sky blue
          : { DEFAULT: '#e63329', light: '#ff4f45', dark: '#b52520' }, // hikma red
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
