import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        primary: 'hsl(var(--primary) / <alpha-value>)',
        'primary-glow': 'hsl(var(--primary-glow) / <alpha-value>)',
        'gradient-primary': 'linear-gradient(var(--gradient-primary))',
        'gradient-surface': 'linear-gradient(var(--gradient-surface))',
      },
      boxShadow: {
        elev: 'var(--shadow-elev)',
        glow: 'var(--shadow-glow)',
      },
      transitionTimingFunction: {
        smooth: 'var(--transition-smooth)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s var(--transition-smooth)',
        'slide-up': 'slide-up 0.5s var(--transition-smooth)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
  // shadcn/ui friendly class names
  safelist: [
    'data-[state=open]:animate-fade-in',
    'data-[state=closed]:animate-fade-out',
    'dark',
  ],
};

export default config;
