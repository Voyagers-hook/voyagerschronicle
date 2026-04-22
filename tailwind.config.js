/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D6A4F',
          50: '#EAF4EE',
          100: '#C8E6D4',
          200: '#95CEB0',
          300: '#62B58C',
          400: '#3D9068',
          500: '#2D6A4F',
          600: '#235438',
          700: '#1A3D28',
          800: '#112718',
          900: '#091408',
        },
        orange: {
          DEFAULT: '#ff751f',
          50: '#fff4ed',
          100: '#ffe6d5',
          200: '#ffc9a8',
          300: '#ffa070',
          400: '#ff8a45',
          500: '#ff751f',
          600: '#e85a00',
          700: '#c24800',
          800: '#9a3a00',
          900: '#7a2e00',
        },
        accent: {
          DEFAULT: '#E9A23B',
          50: '#FEF7EB',
          100: '#FDE9C4',
          200: '#FAD08A',
          300: '#F5B84F',
          400: '#EFA830',
          500: '#E9A23B',
          600: '#C47A1A',
          700: '#9A5C0E',
          800: '#6F4008',
          900: '#452603',
        },
        forest: {
          50: '#EAF4EE',
          100: '#C8E6D4',
          500: '#2D6A4F',
          900: '#0D2118',
        },
        earth: {
          50: '#FDF6EC',
          100: '#F5E8D0',
          200: '#E8CFA8',
          300: '#D4AE7A',
          400: '#BC8D50',
          500: '#9A6E35',
        },
        adventure: {
          bg: '#FDF6EC',
          card: '#FFFFFF',
          border: '#E8DDD0',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['DM Serif Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(45,106,79,0.08), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(45,106,79,0.14), 0 2px 6px rgba(0,0,0,0.06)',
        badge: '0 0 12px rgba(233,162,59,0.4)',
        panel: '0 20px 60px rgba(0,0,0,0.15)',
      },
      backgroundImage: {
        'adventure-hero':
          "linear-gradient(135deg, #1A3D28 0%, #2D6A4F 50%, #3D9068 100%)",
        'amber-glow':
          "linear-gradient(135deg, #E9A23B 0%, #F5C842 100%)",
        'earth-warm':
          "linear-gradient(180deg, #FDF6EC 0%, #F5E8D0 100%)",
      },
      animation: {
        'slide-in-right': 'slideInRight 250ms ease forwards',
        'fade-in': 'fadeIn 200ms ease forwards',
        'badge-pop': 'badgePop 300ms cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
    },
  },
  plugins: [],
};