/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F6F5',
        ink: '#16231F',
        line: '#D9DEDA',
        ledger: {
          DEFAULT: '#1F6F54',
          dark: '#154F3C',
          light: '#E6F0EB',
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
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
