/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617', // Main BG
        sidebar: '#050814',   // Sidebar BG
        surface: '#060b1b',   // Card BG
        border: '#111827',    // Soft border
        primary: {
          DEFAULT: '#7C3AED', // Violet glow
          hover: '#6D28D9',
        },
        secondary: {
          DEFAULT: '#06B6D4', // Cyan glow
          hover: '#0891B2',
        },
        accent: {
          DEFAULT: '#EC4899', // Magenta badge
        },
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#EF4444',
        text: {
          primary: '#F9FAFB',
          secondary: '#9CA3AF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px -5px rgba(124, 58, 237, 0.3)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.3)',
      }
    },
  },
  plugins: [],
}
