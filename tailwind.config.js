/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0E47',
        surface: '#272757',
        primary: '#505081',
        accent: '#8686AC',
        'text-primary': '#FFFFFF',
        'text-secondary': '#8686AC',
      },
    },
  },
  plugins: [],
}
