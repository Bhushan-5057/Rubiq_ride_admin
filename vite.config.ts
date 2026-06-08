import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  
  server: {
    host: "0.0.0.0", 
    port: 5173, 
    open: true, 
    proxy: {
      '/api': {
        target: 'http://13.201.44.13:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
});
