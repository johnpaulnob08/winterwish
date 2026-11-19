/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#102A56',
        winter: '#173B70',
        royal: '#2563EB',
        icy: '#BFDBFE',
        ice: '#DBEAFE',
        frost: '#F0F7FF',
        silver: '#CBD5E1',
        gold: '#F5D76E',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        twinkle: { '0%,100%': { opacity: '.25', transform: 'scale(.8)' }, '50%': { opacity: '1', transform: 'scale(1.15)' } },
        sway: { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        glow: { '0%,100%': { opacity: '.55' }, '50%': { opacity: '1' } },
      },
      animation: {
        twinkle: 'twinkle 3.2s ease-in-out infinite',
        sway: 'sway 5s ease-in-out infinite',
        glow: 'glow 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
