/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-600': 'var(--color-primary-600)',
        accent: 'var(--color-accent)'
      },
      borderRadius: {
        md: 'var(--radius-md)'
      }
    }
  },
  plugins: []
}
