/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#14241c',
          muted: '#4a5c52',
        },
        leaf: {
          DEFAULT: '#1b6b45',
          bright: '#2f8f5b',
          soft: '#d8ebe0',
          deep: '#0c2418',
        },
        gold: {
          DEFAULT: '#c48a1a',
          soft: '#f5e6c8',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
