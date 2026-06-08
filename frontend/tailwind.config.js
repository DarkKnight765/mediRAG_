module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#7C5CFF",
          hover:   "#6B4EE8",
          light:   "rgba(124,92,255,0.15)",
        },
        bg: {
          primary:   "#0F0F12",
          secondary: "#16161C",
          card:      "#1A1A24",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        "purple-radial": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,92,255,0.12) 0%, transparent 60%)",
      },
    },
  },
  plugins: [],
}