import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: 'index.html',
        crearQuedada: 'crearQuedada.html',
        registro: 'registro.html',
        tablon: 'tablon.html',
        miActividad: 'miActividad.html',
        perfil: 'perfil.html'
      }
    }
  }
});
