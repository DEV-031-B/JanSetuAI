/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1e3a5f',
          dark: '#152d4d',
          light: '#2a4f82'
        },
        saffron: '#FF9933',
        india: {
          green: '#138808',
          saffron: '#FF9933',
          blue: '#000080'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
