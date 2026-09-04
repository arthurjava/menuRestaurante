/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
    "./src/**/*.component.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad9ad',
          300: '#f6bf77',
          400: '#f1a042',
          500: '#ed8218',
          600: '#de6710',
          700: '#b84c0f',
          800: '#923d12',
          900: '#763212',
          950: '#3e1507',
        },
      },
    },
  },
  plugins: [],
}