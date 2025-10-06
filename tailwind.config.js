/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./*.html",
    "./dist/**/*.{html,js}"
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