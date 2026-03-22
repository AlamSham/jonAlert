import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        paper: '#FAFAF8',
        accent: '#D97706',
        'accent-dark': '#B45309',
        muted: '#57534E',
        surface: '#FFFFFF',
        'surface-alt': '#F5F5F0',
      },
      boxShadow: {
        card: '0 4px 20px rgba(10,10,10,0.06)',
        'card-hover': '0 12px 40px rgba(10,10,10,0.1)',
        glow: '0 0 30px rgba(217,119,6,0.15)',
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
