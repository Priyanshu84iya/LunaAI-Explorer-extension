/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        luna: {
          bg: '#f4f0e6',
          surface: '#ffffff',
          panel: '#ffffff',
          accent: '#ffd400',
          accent2: '#9b6cff',
          accent3: '#66a3ff',
          accent4: '#7ee0a1',
          accent5: '#ff8fb1',
          error: '#ff5c5c',
          text: '#111111',
          muted: '#5b564a',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Archivo"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl2: '0px',
      },
      boxShadow: {
        glow: '6px 6px 0 #111111',
        'glow-soft': '8px 8px 0 #111111',
        brutal: '6px 6px 0 #111111',
        'brutal-lg': '8px 8px 0 #111111',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.35)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 2.4s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
