/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs", // Ensure your EJS files are in the correct folder
    "./views/**/**/*.ejs", // Ensure your EJS files are in the correct folder
    "./views/**/*/*.ejs", // Ensure your EJS files are in the correct folder
    "./views/**/**/**.ejs", // Ensure your EJS files are in the correct folder
    "./public/**/*.{js,css}", // Ensure your public folder contains JS or CSS files with Tailwind classes
    "./src/**/*.{js,ts,jsx,tsx}" // Ensure your source folder structure matches
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};