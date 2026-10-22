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
          DEFAULT: '#1677FF',
          dark: '#0e5ad1',
          light: '#4096ff',
          hover: '#0958d9'
        },
        secondary: {
          DEFAULT: '#2D8CFF',
          dark: '#1a75e8',
          light: '#69b1ff'
        },
        deepNavy: {
          DEFAULT: '#0F1F3D',
          light: '#1a2e54',
          dark: '#0a1529'
        },
        lightBlue: {
          DEFAULT: '#EAF4FF',
          hover: '#dcebff',
          50: '#F4F9FF',
          100: '#EAF4FF',
          200: '#D5EBFF'
        },
        bgLight: '#F7FAFF',
        customGray: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
          dark: '#475569',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(22, 119, 255, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -5px rgba(15, 31, 61, 0.06), 0 4px 12px -2px rgba(22, 119, 255, 0.04)',
        'card-hover': '0 20px 40px -8px rgba(22, 119, 255, 0.12), 0 8px 16px -4px rgba(15, 31, 61, 0.06)',
        'mockup': '0 25px 50px -12px rgba(15, 31, 61, 0.12), 0 0 0 1px rgba(22, 119, 255, 0.06)',
        'floating': '0 15px 35px -5px rgba(22, 119, 255, 0.12), 0 6px 12px -2px rgba(15, 31, 61, 0.04)',
        'button': '0 4px 14px 0 rgba(22, 119, 255, 0.35)',
      }
    },
  },
  plugins: [],
}
