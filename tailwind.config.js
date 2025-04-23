// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui"],
        mono: ["Geist Mono", "monospace"],
      },
      colors: {
        foreground: "#2a3b47", // a bolder dark blue-gray
        calm: "#5c6b76",       // darker lavender gray
        stone: "#8c8c8c",      // slightly deeper stone for meta
      }
      ,
      backgroundImage: {
        noise: "url('/textures/noise.png')",
        space: "url('/textures/starfield.jpg')",
        "pastel-noise":
          "linear-gradient(to bottom right, #fdf6f0, #e8f0ff), url('/textures/noise.png')",
        "sunset-overlay":
          "linear-gradient(145deg, rgba(255, 128, 128, 0.2), rgba(128, 128, 255, 0.2)), url('/textures/noise.png')",
      },
      boxShadow: {
        glow: "0 0 12px rgba(227, 100, 100, 0.4)",
      },
    },
  },
  plugins: [],
};
