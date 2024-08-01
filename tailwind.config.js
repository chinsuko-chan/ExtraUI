/** @type {import("tailwindcss").Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,svg}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}
