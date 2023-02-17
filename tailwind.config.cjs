/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors : {
        primary : "#e7cd86",
        background: "#262626",
        hover: "#646464"
      }
    },
  },
  plugins: [],
}
