import { defineConfig } from 'vite';
import vue from "@vitejs/plugin-vue"
import hooks from '@midwayjs/vite-plugin-hooks';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/ws': {
        target: 'ws://192.168.1.81:7001',
        /* ws: true,
        changeOrigin: true */
      }
    },
    open: true
  },
  plugins: [hooks(), vue()],
});
