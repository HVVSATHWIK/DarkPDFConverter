/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6200ea',
        secondary: '#3700b3',
        dark: '#121212',
        darker: '#0a0a0a',
        darkest: '#050505',
      },
    },
  },
  plugins: [],
}