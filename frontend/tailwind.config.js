/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact 10 swatch colors extracted directly from the user's uploaded palette image:
        patch: {
          dark: '#151717',        // Swatch 1: Charcoal Black
          tealOcean: '#125b63',   // Swatch 2: Deep Ocean Teal
          tealSea: '#238480',     // Swatch 3: Muted Jade / Sea Green
          tealPine: '#155a5a',    // Swatch 4: Forest Teal
          tealMarine: '#063f4a',  // Swatch 5: Deep Marine Teal
          tealSteel: '#317c82',   // Swatch 6: Steel Teal
          tealSage: '#34807f',    // Swatch 7: Sage Teal
          tealForest: '#074041',  // Swatch 8: Deep Forest Pine
          wood: '#8d5535',        // Swatch 9: Warm Chestnut Wood
          terracotta: '#ae5a34',  // Swatch 10: Burnt Terracotta
          orange: '#fd5800',      // Exact Button CTA Flame Orange from image header and hero
          avatar: '#f2521d',      // Exact Avatar Orange from image
          hero: '#065861',        // Exact Hero backdrop top gradient
          canvas: '#f4f6f8',      // Clean light canvas from the image
        },
        brand: {
          50: '#f0fdfc',
          100: '#ccfbf7',
          200: '#99f6f0',
          300: '#34807f', // Swatch 7
          400: '#238480', // Swatch 3
          500: '#125b63', // Swatch 2
          600: '#063f4a', // Swatch 5
          700: '#074041', // Swatch 8
          800: '#155a5a', // Swatch 4
          900: '#151717', // Swatch 1
          950: '#0a0d0d',
        },
        copper: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#fd5800', // Exact button color
          600: '#f2521d', // Avatar orange
          700: '#ae5a34', // Swatch 10
          800: '#8d5535', // Swatch 9
          900: '#7c2d12',
        },
        indigo: {
          50: '#f0fdfc',
          100: '#e0f2f1',
          200: '#b2dfdb',
          300: '#34807f', // Swatch 7
          400: '#317c82', // Swatch 6
          500: '#238480', // Swatch 3
          600: '#125b63', // Swatch 2 (Deep Ocean Teal)
          700: '#063f4a', // Swatch 5 (Deep Marine Teal)
          800: '#155a5a', // Swatch 4 (Forest Teal)
          900: '#151717', // Swatch 1 (Charcoal Black)
          950: '#074041', // Swatch 8 (Deep Forest Pine)
        },
      },
    },
  },
  plugins: [],
}
