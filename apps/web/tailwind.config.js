/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Outfit for titles and figures, Plus Jakarta Sans for text; Cairo takes over in Arabic (see index.css).
        display: ['Outfit', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        // The logo letters only (same font as the mobile app's wordmark).
        wordmark: ['"Barlow Condensed"', 'Outfit', 'sans-serif'],
        brand: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        // Neutrals are green-tinted (same as the mobile app) so greys never fight the brand green.
        slate: {
          50: '#F4F6F4',
          100: '#E9EEEA',
          200: '#D3DCD5',
          300: '#B7C3BB',
          400: '#8FA094',
          500: '#56665C',
          600: '#3D4B43',
          700: '#2E3C34',
          800: '#1B2921',
          900: '#0F1A14',
          950: '#0B1410',
        },
        // The one place the brand colours live. Use these names in the code, never raw hex values.
        brand: {
          50: '#E6F4ED',
          100: '#C2E4D4',
          500: '#0D5C3A', // primary green
          600: '#0A4A2E', // hover / pressed
          700: '#083923',
          deep: '#042416', // darkest panels (welcome screen, artisan banner)
          panel: '#073823', // cards sitting on a deep panel
          bright: '#22C55E', // active / online green, also the green used on dark backgrounds
          accent: { DEFAULT: '#A3E635', hover: '#8ECE28' }, // lime call-to-action
          'on-accent': '#12260A', // text on lime
        },
        dark: {
          bg: '#0C1612',
          card: '#132019',
          surface: '#162A20',
          border: '#23352B',
        },
        // "Paper" look: a warm grey-green page, white flat cards, hairline borders, tinted tiles.
        light: {
          bg: '#F2F4EE',
          card: '#FFFFFF',
          surface: '#FFFFFF',
          tile: '#E8EEE1',
          border: '#D9E0D2',
        },
      },
      borderRadius: { tile: '18px', field: '16px' },
      boxShadow: {
        glow: '0 8px 20px rgba(163, 230, 53, 0.35)',
        soft: '0 8px 16px rgba(13, 92, 58, 0.25)',
      },
    },
  },
  plugins: [],
};
