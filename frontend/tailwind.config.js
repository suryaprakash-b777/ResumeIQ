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
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          500: '#3867F5',
          600: '#2B52D9',
          700: '#1D3FA8',
        },
        navy: {
          800: '#17243D',
          900: '#0F1A2D',
        },
        muted: {
          gray: '#7C879B',
          light: '#94A3B8'
        },
        surface: {
          bg: '#F5F7FC',
          card: '#FFFFFF',
          border: '#E8ECF4',
          darkBg: '#0F172A',
          darkCard: '#1E293B',
          darkBorder: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(23, 36, 61, 0.05)',
        'card': '0 2px 12px -1px rgba(23, 36, 61, 0.06)',
        'elevated': '0 10px 30px -4px rgba(23, 36, 61, 0.08)'
      }
    },
  },
  plugins: [],
}

