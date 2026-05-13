import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    './src/views/**/*.{js,ts,jsx,tsx,mdx}',
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#DBAC34', // Gold from logo figure
        secondary: '#76A13D', // Leaf green from logo
        dark: '#2B4448', // Dark teal background from logo
        darker: '#1E3236', // Darker teal
        sand: '#F4F1ED',
        forest: '#2d4a36',
        sage:  '#8aa68f',
        gold:  '#c9a96a',
        cream: '#f5efe4',
        bg:    '#fbf9f3',
        muted: '#7a8478',
        line:  '#e6dfcf',
        emerald: {
          50: '#f4f6f5',
          100: '#e9eeec',
          200: '#d2ddd9',
          300: '#bbccc6',
          400: '#8da9a1',
          500: '#3d6b5f',
          600: '#376056',
          700: '#2e5047',
          800: '#254039',
          900: '#1e352f',
        }
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px -20px rgba(45,74,54,0.18)',
        lift: '0 30px 80px -30px rgba(45,74,54,0.30)',
      },
      animation: {
        'subtle-zoom': 'subtle-zoom 20s infinite alternate',
        'soft-float': 'soft-float 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.8s ease-out forwards',
      },
      keyframes: {
        'subtle-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
        'soft-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
