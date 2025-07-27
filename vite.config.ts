import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Load env file based on mode (.env, .env.local, .env.production, etc)
    const env = loadEnv(mode, '.', 'VITE_');
    
    console.log(`Building in ${mode} mode`);
    
    return {
      // Make all environment variables available via process.env
      // This is important for compatibility with some libraries
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        // Make sure environment is defined to help with debugging
        'process.env.NODE_ENV': JSON.stringify(mode)
      },
      // Properly report build errors
      build: {
        reportCompressedSize: true,
        sourcemap: mode !== 'production',
        // Improve error messages
        rollupOptions: {
          onwarn(warning, defaultHandler) {
            // Suppress some common warnings
            if (warning.code === 'CIRCULAR_DEPENDENCY') return;
            defaultHandler(warning);
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
