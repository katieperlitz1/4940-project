/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        espn: {
          red: '#cc0000',
          navy: '#013369',
          dark: '#1a1a1a',
          darker: '#111111',
          gray: '#2a2a2a',
          lightgray: '#3a3a3a',
          text: '#d4d4d4',
          muted: '#8a8a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

