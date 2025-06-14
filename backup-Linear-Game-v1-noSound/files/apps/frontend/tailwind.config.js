/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontSize: {
        'icon-sm': '1rem',    // 16px
        'icon-md': '1.5rem',  // 24px
        'icon-lg': '2rem',    // 32px
      },
      width: {
        'icon-sm': '1rem',    // 16px
        'icon-md': '1.5rem',  // 24px
        'icon-lg': '2rem',    // 32px
      },
      height: {
        'icon-sm': '1rem',    // 16px
        'icon-md': '1.5rem',  // 24px
        'icon-lg': '2rem',    // 32px
      },
      animation: {
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  safelist: [
    'h-4',
    'h-5',
    'h-6',
    'h-8',
    'h-10',
    'h-12',
    'w-4',
    'w-5',
    'w-6',
    'w-8',
    'w-10',
    'w-12',
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
  ],
}