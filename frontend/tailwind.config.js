/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d1b10',
          light: '#1a3320',
          dark: '#060e09',
        },
        gold: {
          DEFAULT: '#f5c518',
          light: '#ffd700',
          dark: '#d4a500',
        },
        hikma: {
          DEFAULT: '#e63329',
          light: '#ff4f45',
          dark: '#b52520',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
