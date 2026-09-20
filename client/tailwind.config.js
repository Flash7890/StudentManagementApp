/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          50:  '#fdfaf5',
          100: '#f7eedc',
          200: '#eedcb8',
          300: '#e0c28a',
          400: '#cfa05e',
          500: '#b8823a',
          600: '#9a6a2c',
          700: '#7c5222',
          800: '#5e3d1a',
          900: '#3b2610',
          950: '#1e1208',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle:  '#fdfaf5',
          muted:   '#f7eedc',
        },
      },
      borderRadius: {
        '2xl':  '1rem',
        '3xl':  '1.5rem',
        '4xl':  '2rem',
      },
      boxShadow: {
        soft:   '0 2px 16px 0 rgba(184, 130, 58, 0.08)',
        card:   '0 4px 24px 0 rgba(184, 130, 58, 0.10)',
        glow:   '0 0 0 3px rgba(184, 130, 58, 0.20)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};