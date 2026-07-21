/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aviation: {
          dark: '#0B192C',
          navy: '#1E3E62',
          orange: '#FF6500',
          light: '#F1F6F9',
        }
      }
    },
  },
  plugins: [],
}
