/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    extend: {
      animation: {
        'bounce-stop': 'bounce 1s 3',
      },
      screens: {
        'xs': '280px',
      },
      colors: {
        'positive-green': '#34b233',
        'negative-red': '#FF0000',
        'status-yellow': '#FBE106',
      }
    },
  },
  plugins: [],
}
