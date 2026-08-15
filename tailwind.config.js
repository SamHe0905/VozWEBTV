/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        bg: '#F5F2EA',
        paper: '#FFFFFF',
        // #007A33 e' o verde institucional ajustado para acessibilidade:
        // com texto branco da 5.48:1, passando em WCAG AA tambem para texto
        // pequeno. O #00913F original so passava em titulos grandes (4.10:1).
        verde: { DEFAULT: '#007A33', dark: '#00541F' },
        azul: { DEFAULT: '#0B2E5C', mid: '#1B4E9B' },
        amarelo: { DEFAULT: '#FFC72C', dark: '#E0A800' },
        tinta: '#0E1116',
        // #6B7280 dava 4.32:1 sobre o off-white — abaixo do minimo AA.
        cinza: '#5C6470',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'Impact', 'system-ui', 'sans-serif'],
        sans: ['Archivo', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderWidth: { 3: '3px', 6: '6px', 10: '10px' },
      // A espessura de sublinhado tem escala propria no Tailwind; sem isto,
      // `decoration-3` nao existe.
      textDecorationThickness: { 3: '3px', 6: '6px' },
      boxShadow: {
        hard: '6px 6px 0 0 #0B2E5C',
        'hard-sm': '3px 3px 0 0 #0B2E5C',
        'hard-lg': '10px 10px 0 0 #0B2E5C',
        'hard-verde': '6px 6px 0 0 #007A33',
        'hard-amarelo': '6px 6px 0 0 #FFC72C',
        'hard-bg': '6px 6px 0 0 #F5F2EA',
      },
      maxWidth: { site: '1400px' },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseLive: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '.2' },
        },
        eq: {
          '0%,100%': { transform: 'scaleY(.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'marquee-slow': 'marquee 44s linear infinite',
        live: 'pulseLive 1.4s ease-in-out infinite',
        eq: 'eq .9s ease-in-out infinite',
      },
    },
  },
  corePlugins: {
    // O projeto e' 100% de cantos retos. Desliga a utility na raiz.
    borderRadius: false,
  },
  plugins: [],
};
