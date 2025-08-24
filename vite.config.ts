import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Adjust `base` if deploying to GitHub Pages subpath, e.g. "/PocketCalisthenics/"
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist"
  }
});
