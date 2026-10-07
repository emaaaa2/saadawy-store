export default {
  content: [
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/app.vue",
  ],
  // The store's dark mode: a "dark" class on <html> (see app/plugins/theme.ts).
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        beige: "#FBF4EB",
        sage: "#727E74",
        olive: "#44564C",
        gold: "#B08D57",
        rose: "#D6B1A3",
        champagne: "#E6D3A3",
        taupe: "#9A8F87",
        // Theme colors that flip in dark mode (values in app/assets/css/main.css).
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        page: "rgb(var(--color-page) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        tint: "rgb(var(--color-tint) / <alpha-value>)",
        // The dashboard's grays; the scale flips in dark mode (only the dashboard uses stone).
        stone: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => [
            shade,
            `rgb(var(--stone-${shade}) / <alpha-value>)`,
          ])
        ),
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
      },
      // Golden ratio scale (φ = 1.618)
      spacing: {
        "phi-1": "1rem", // 16px
        "phi-2": "1.618rem", // ~26px
        "phi-3": "2.618rem", // ~42px
        "phi-4": "4.236rem", // ~68px
        "phi-5": "6.854rem", // ~110px
      },
      fontSize: {
        "phi-body": "1rem", // 16px
        "phi-lead": "1.166rem", // ~18.6px
        "phi-h3": "1.618rem", // ~26px
        "phi-h2": "2.267rem", // ~36px
        "phi-h1": "3.176rem", // ~51px
      },
    },
  },

  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
      });
    },
  ],
};
