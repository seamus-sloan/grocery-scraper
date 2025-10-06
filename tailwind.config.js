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
    'opacity-0',
    'bg-primary',
    'bg-secondary', 
    'bg-accent',
    'bg-background',
    'bg-background-light',
    'bg-background-card',
    'text-primary',
    'text-secondary',
    'text-text',
    'text-text-secondary',
    'text-text-light',
    'border-primary',
    'border-border',
    'from-primary',
    'to-secondary'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B69EFF',  // Main primary color ***
          dark: '#9B7EE6',      // Darker shade for hover states
          light: '#C8B3FF'     // Lighter shade for backgrounds
        },
        secondary: {
          DEFAULT: '#AC9BF3',  // Secondary purple ***
          dark: '#9B88E6',     // Darker secondary
          light: '#BFAFF7'     // Lighter secondary
        },
        accent: {
          DEFAULT: '#DCCCFA',  // Light purple accent
          light: '#F4EDFB'     // Very light purple for backgrounds ***
        },
        background: {
          DEFAULT: '#F4EDFB',  // Very light purple background ***
          light: '#FFFFFF',    // Pure white
          card: '#DCCCFA'      // Light purple for cards
        },
        text: {
          DEFAULT: '#4A5568',  // Dark gray for primary text
          secondary: '#718096', // Medium gray for secondary text
          light: '#A0AEC0'     // Light gray for muted text
        },
        border: '#E2E8F0'      // Light gray for borders
      },
      spacing: {
        '15': '60px'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}