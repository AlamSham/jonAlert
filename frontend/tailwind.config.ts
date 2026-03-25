import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#09090b',  // zinc-950
        paper: '#ffffff', // clean white
        accent: '#2563eb', // blue-600
        'accent-dark': '#1d4ed8', // blue-700
        muted: '#71717a', // zinc-500
        surface: '#ffffff',
        'surface-alt': '#f4f4f5', // zinc-100
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.03)',
        'card-hover': '0 10px 30px rgba(0,0,0,0.06)',
        glow: '0 0 20px rgba(37,99,235,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'count-up': 'countUp 1s ease-out',
        pulse_slow: 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
