/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#fa7eb0',
          DEFAULT: '#e94c89',
          dark: '#c9246e',
        },
        secondary: {
          light: '#a45deb',
          DEFAULT: '#8a2be2',
          dark: '#6a16b8',
        },
        accent: '#f3c1df',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
      },
    },
  },
  plugins: [],
};