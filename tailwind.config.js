/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./*.html",
    "./dist/**/*.{html,js}"
  ],
  safelist: [
    'max-h-96',
    'opacity-100',
    'max-h-0',
    'opacity-0'
  ],
  theme: {
    extend: {
      spacing: {
        '15': '60px'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}