/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'fp-orange': '#ff5a00',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
