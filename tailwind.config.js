/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

/**
 * Migrated from the Tailwind Play CDN config in index.html.
 * This repo has no src/ folder — content globs cover the real source trees.
 *
 * CDN used single-hex `amber`, `teal`, and `neutral`, which would replace
 * Tailwind's shade scales. Keep those hex values as DEFAULT so `text-neutral`
 * / `bg-amber` still work, and spread the default palettes so shade classes
 * such as `bg-amber-50` and `text-teal-600` still compile.
 */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#fbcb05',
        charcoal: '#222222',
        dash: '#eef2f3',
        amber: { DEFAULT: '#f59e0b', ...colors.amber },
        teal: { DEFAULT: '#4a6b7a', ...colors.teal },
        neutral: { DEFAULT: '#808080', ...colors.neutral },
      },
      fontFamily: {
        serif: ['"Kaushan Script"', 'cursive'],
        sans: ['"Open Sans"', 'sans-serif'],
      },
      animation: {
        blob: 'blob 10s infinite',
        'blob-reverse': 'blobReverse 12s infinite',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-left': 'fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in-bounce': 'scaleInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        shimmer: 'shimmer 2s linear infinite',
        'falling-heart': 'fallingHeart 3s ease-in forwards',
        'ping-pong': 'pingPong 1.25s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        blobReverse: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-30px, 50px) scale(0.9)' },
          '66%': { transform: 'translate(20px, -20px) scale(1.1)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fallingHeart: {
          '0%': {
            opacity: '1',
            transform: 'translateY(0) translateX(0) rotate(0deg) scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'translateY(50vh) translateX(20px) rotate(180deg) scale(0.8)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(100vh) translateX(-20px) rotate(360deg) scale(0.5)',
          },
        },
        scaleInBounce: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(251, 203, 5, 0.2), 0 0 10px rgba(251, 203, 5, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(251, 203, 5, 0.4), 0 0 30px rgba(251, 203, 5, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pingPong: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
