/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066FF',
        secondary: '#f5f5f5',
        accent: '#ff6b6b',
      },
    },
  },
  plugins: [],
}
