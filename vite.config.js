import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
   plugins: [
      (async () => {
         const { default: glsl } = await import("vite-plugin-glsl");
         return glsl();
      })(),
   ]
});