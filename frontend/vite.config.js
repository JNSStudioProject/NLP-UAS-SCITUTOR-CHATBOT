import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  // Plugin yang dipakai oleh Vite
  plugins: [
    vue(), // Agar Vite mengerti kode Vue (.vue)
    tailwindcss(), // Mengaktifkan TailwindCSS untuk styling
  ],
  resolve: {
    // Membuat alias jalan pintas (contoh: import dari '@/components' akan otomatis mengarah ke folder './src/components')
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // Port standar tempat berjalannya web Frontend ini di komputer lokal Anda
    
    // Konfigurasi Proxy (Jembatan rahasia) agar Frontend bisa ngobrol dengan Backend/API luar tanpa diblokir oleh error CORS browser
    proxy: {
      // Jika kode Vue memanggil fetch('/api/...')
      '/api': {
        target: 'http://127.0.0.1:3000', // Diam-diam arahkan ke Backend lokal kita
        changeOrigin: true
      },
      // Jika kode Vue memanggil fetch('/hf-api/...')
      '/hf-api': {
        target: 'https://api-inference.huggingface.co', // Arahkan ke server Hugging Face
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hf-api/, '') // Hapus tulisan '/hf-api' sebelum dikirim, agar server sana tidak bingung
      }
    }
  }
})
