/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'gov-blue': { 50: '#eff6ff', 900: '#1e3a5f' },
        'gov-saffron': '#FF9933',
        'gov-green': '#138808',
        'gov-white': '#FFFFFF'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif']
      },
      animation: { 'fade-in': 'fadeIn 0.3s ease-in-out' },
      keyframes: { fadeIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } } }
    }
  },
  plugins: []
};
