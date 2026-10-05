/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'max-lg': { max: '1079px' },
        'max-md': { max: '760px' },
        'max-sm': { max: '420px' },
      },
      colors: {
        zen: {
          canvas: '#f5f7f4',
          ink: '#182d29',
          forest: '#244a39',
          button: '#315e49',
          line: '#e9eeea',
          muted: '#85928d',
          mint: '#eaf2ed',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
