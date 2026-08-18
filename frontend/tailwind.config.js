/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        primaryHover: "var(--color-primary-hover)",
        secondary: "var(--color-secondary)",
        secondaryLight: "var(--color-secondary-light)",
        mint: "#B8D9C1",
        mintLight: "#CBEBC5",
        ink: "#303259",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        surfaceHover: "var(--color-surface-hover)",
        danger: "var(--color-danger)",
        border: "var(--color-border)"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
