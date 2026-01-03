/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', // Indigo 500
        secondary: '#a855f7', // Purple 500
        accent: '#f43f5e', // Rose 500
        'modern-bg': '#f8fafc', // Slate 50
        'glass-border': 'rgba(255, 255, 255, 0.5)',
      },
    },
  },
  plugins: [],
}