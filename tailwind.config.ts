export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        beige: '#FBF4EB',
        sage: '#727E74',
        olive: '#44564C',
        gold: '#B08D57',
        rose: '#D6B1A3',
        champagne: '#E6D3A3',
        taupe: '#9A8F87',
      },
      fontFamily: {
        arabic: ['Alexandria', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
}