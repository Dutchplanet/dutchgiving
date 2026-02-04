/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B2635',
          light: '#A13547',
          dark: '#6B1E29',
        },
        cream: {
          DEFAULT: '#FDF8F3',
          dark: '#FAF5EF',
        },
        gold: {
          DEFAULT: '#D4A853',
          light: '#E5C175',
          dark: '#B8923F',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'twinkle-delay': 'twinkle 2s ease-in-out 0.5s infinite',
        'twinkle-slow': 'twinkle 3s ease-in-out 1s infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
