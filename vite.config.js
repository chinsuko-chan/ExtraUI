import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"

import svelteConfig from "./svelte.config"

export default defineConfig({
  plugins: [svelte(svelteConfig)]
})
