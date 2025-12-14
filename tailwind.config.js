/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx}', './components/**/*.{js,jsx}', './screens/**/*.{js,jsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular', 'system-ui', 'sans-serif'],
        semibold: ['Inter_600SemiBold', 'system-ui', 'sans-serif'],
        bold: ['Inter_700Bold', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
