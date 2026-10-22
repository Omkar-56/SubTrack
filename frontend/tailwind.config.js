/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fcf7ed',
        ink: '#353535',
        line: '#e8e2d5',
        ledger: {
          DEFAULT: '#064e3b',
          dark: '#043c2e',
          light: '#e2ebe5',
        },
        amber: {
          DEFAULT: '#C77D2B',
          light: '#F6E9D8',
        },
        rust: {
          DEFAULT: '#B4462F',
          light: '#F5E3DE',
        },
      },
      fontFamily: {
        primary: ['"General Sans"', 'sans-serif'],
        secondary: ['Quicksand', 'sans-serif'],
        display: ['"General Sans"', 'sans-serif'],
        sans: ['"General Sans"', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
