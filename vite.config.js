import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
   server: {
      host: true,
   },
   plugins: [glsl()],
});