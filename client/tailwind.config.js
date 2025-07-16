/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Asegura que Tailwind escanee estos archivos
    "./public/index.html", // Opcional si usas clases en el HTML
    "./node_modules/tw-elements/dist/js/**/*.js", // Necesario para TW Elements
  ],
  theme: {
    extend: {
      colors: {
        neonYellow: "#FFD700",
        neonPink: "#FF1493",
        neonPurple: "#8A2BE2",
        marroncito: "#3d332a",
        marronclaro: "#e4d8c2",
        marronhover: "#685e53",
        violetita: "#cb6ce6",
      },
      fontFamily: {
        lucky: ["Luckiest Guy", "serif"],
      },
      screens: {
        // Los valores existentes se pueden sobrescribir o ampliar
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px", // modificamos el valor de xl
        "2xl": "1536px",
        "3xl": "1620px",
        "4xl": "1820px", // nuevo breakpoint
      },
    },
  },
  plugins: [],
};
