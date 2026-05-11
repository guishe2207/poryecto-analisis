/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        diamond: '#e2e8f0',
        sapphire: '#3b82f6',
        emerald: '#10b981',
        ruby: '#ef4444',
        onyx: '#374151',
        gold: '#f59e0b',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 5px currentColor' },
          to: { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor' },
        }
      }
    },
  },
  plugins: [],
}
