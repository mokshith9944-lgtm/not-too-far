import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        netflix: {
          base: '#141414',
          dark: '#0b0b0b',
          surface: '#181818',
          card: '#222222',
          border: '#333333',
          red: '#E50914',
          redHover: '#f40612',
          redDark: '#B81D24',
          gray: '#AAAAAA',
          muted: '#757575',
          accent: '#0071EB',
          gold: '#FFD700',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Netflix Sans', 'Helvetica Neue', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'cinema-radial': 'radial-gradient(circle at center, rgba(229, 9, 20, 0.12) 0%, rgba(20, 20, 20, 0.95) 70%)',
        'netflix-gradient': 'linear-gradient(180deg, rgba(20, 20, 20, 0) 0%, rgba(20, 20, 20, 0.85) 60%, #141414 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)',
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'wave-bar': 'wave 1s ease-in-out infinite alternate',
      },
      keyframes: {
        wave: {
          '0%': { height: '20%' },
          '100%': { height: '100%' },
        },
      },
      boxShadow: {
        'glow-red': '0 0 35px -5px rgba(229, 9, 20, 0.45)',
        'glow-red-lg': '0 0 60px -10px rgba(229, 9, 20, 0.6)',
        'cinema': '0 20px 50px rgba(0, 0, 0, 0.85)',
      },
    },
  },
  plugins: [],
};

export default config;
