import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e6ebff',
          500: '#5b7cff',
          600: '#445ee6',
          700: '#3046b8',
        },
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(91, 124, 255, 0.45)',
      },
    },
  },
  plugins: [],
} satisfies Config;
