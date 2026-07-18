/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#13131a',
          700: '#1c1c24',
          600: '#272732',
        },
        neon: {
          blue: '#00f0ff',
          green: '#39ff14',
          purple: '#b026ff',
          rose: '#ff007f',
          orange: '#ff5e00',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'bubble': 'bubble 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00f0ff, 0 0 10px #00f0ff' },
          '100%': { boxShadow: '0 0 20px #00f0ff, 0 0 30px #00f0ff' },
        },
        bubble: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        }
      }
    },
  },
  plugins: [],
}
