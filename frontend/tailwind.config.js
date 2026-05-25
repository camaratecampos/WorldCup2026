/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a472a',
          light: '#2d6a4f',
          dark: '#0d2b19',
        },
        gold: {
          DEFAULT: '#ffd700',
          light: '#ffe566',
          dark: '#c8a800',
        },
      },
    },
  },
  plugins: [],
};
