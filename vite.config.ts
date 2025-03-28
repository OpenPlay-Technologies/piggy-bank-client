// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  const input: Record<string, string> = {
    game: resolve(__dirname, 'index.html'),
  };

  if (command === 'serve') {
    input.host = resolve(__dirname, 'host.html');
    input['host-mobile'] = resolve(__dirname, 'host-mobile.html');
    input.dashboard = resolve(__dirname, 'dev-index.html');
  }

  return {
    server: {
      // You can change this to '/host-mobile.html' if you want the mobile version to open by default.
      open: '/host.html',
    },
    build: {
      rollupOptions: {
        input,
      },
    },
  };
});
