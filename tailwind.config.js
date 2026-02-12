
module.exports = {
  content: [
    './src*.{js,ts,jsx,tsx}',
    './src/app*.{js,ts,jsx,tsx}',
    './src/components*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        green: '#83FF88',
        blue: '#83B4FF',
        yellow: '#FFEB83',
        red: '#FF8383',
        black: '#000000',
        'black-light': '#0F1011',
        dark: '#1A1A1A',
        'dark-light': '#262626',
        'dark-soft': '#3B3B3B',
        gray: '#A1A1A1',
        'gray-light': '#CCCCCC',
      },
      transitionDuration: {
        '300': '300ms',
      },
      transitionTimingFunction: {
        'cubic-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    },
  },
  plugins: [],
}