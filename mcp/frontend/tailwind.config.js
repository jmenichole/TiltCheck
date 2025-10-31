/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'degen-purple': '#9333EA',
        'degen-blue': '#3B82F6',
        'degen-dark': '#111827',
      },
    },
  },
  plugins: [],
}
