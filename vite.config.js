import path from "path"
import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"

import svelteConfig from "./svelte.config"

export default defineConfig({
  plugins: [svelte(svelteConfig)],
  resolve: {
    alias: {
      lib: path.resolve(__dirname, "./lib"),
      assets: path.resolve(__dirname, "./src/assets"),
      stores: path.resolve(__dirname, "./src/stores"),
      components: path.resolve(__dirname, "./src/components"),
    },
  },
})
