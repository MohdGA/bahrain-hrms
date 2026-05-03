/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#3B6FE8', 50: '#EEF2FD', 100: '#D5E0FA', 500: '#3B6FE8', 600: '#2557D6', 700: '#1A45C4' },
        surface:  '#F0F4FF',
        sidebar:  '#FFFFFF',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
};
