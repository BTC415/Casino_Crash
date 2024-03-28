/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  // These paths are just examples, customize them to match your project structure
  purge: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1921px',
      },
      keyframes: {
        pinRight: {
          '0%': { marginLeft: "-50px" },
          '100%': { margin: 0 },
        }
      },
      animation: {
        pinRight: 'pinRight 1s ease-in-out',
      },
      fontFamily: {
        'roboto': ['Roboto'],
      },
    },
  },
  plugins: [],
}

