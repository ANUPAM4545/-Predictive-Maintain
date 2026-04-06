/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19', // very dark blue
        surface: '#1A2235', // dark blue/gray
        primary: '#3B82F6', // vibrant blue
        danger: '#EF4444', // vibrant red
        warning: '#F59E0B', // vibrant amber
        success: '#10B981', // vibrant green
        neon: '#06B6D4' // cyan outglow
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
