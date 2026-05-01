/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
      },
      colors: {
        primary: '#007AFF',
        'primary-hover': '#0056b3',
        accent: '#34C759',
        danger: '#FF3B30',
        warning: '#FF9500',
        oda: {
          red: '#dc2626',
          amber: '#f59e0b',
        },
      },
      animation: {
        'swipe-hint': 'swipeHint 2s infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.4s ease',
      },
      keyframes: {
        swipeHint: {
          '0%, 100%': { transform: 'translateX(0)', opacity: '0.5' },
          '50%': { transform: 'translateX(10px)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
