import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useHistoryStore } from './historyStore'

// Membuat "Gudang Data" (Store) khusus untuk fitur tanya jawab (Predict)
export const usePredictStore = defineStore('predict', {
  // state: Tempat menyimpan variabel data sementara (akan hilang jika direfresh)
  state: () => ({
    lastInput: '', // Menyimpan pertanyaan terakhir
    lastResult: null, // Menyimpan jawaban terakhir dari AI
    error: null, // Menyimpan pesan error (jika ada masalah)
  }),
  
  // actions: Kumpulan fungsi/perintah yang bisa dilakukan oleh gudang ini
  actions: {
    // Fungsi utama untuk mengirim pertanyaan ke backend
    async submitQuestion(question) {
      try {
        const authStore = useAuthStore();
        const headers = { 'Content-Type': 'application/json' };
        
        // Jika user sudah login, sertakan "kartu identitas"-nya (token) di setiap request
        if (authStore.session?.access_token) {
          headers['Authorization'] = `Bearer ${authStore.session.access_token}`;
        }

        // Kirim (fetch) pertanyaan ke rute Backend (yang diarahkan oleh file vite.config.js)
        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ input: question.input }) // Ubah pertanyaan jadi teks JSON
        });
        
        let data;
        const contentType = response.headers.get('content-type');
        
        // Cek apakah balasan dari backend berbentuk JSON yang rapi
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Jika bukan JSON (misal error HTML dari Vercel/Internet), tangkap errornya
          const text = await response.text();
          throw new Error(`Proxy error or API unavailable (Status ${response.status}): ${text.substring(0, 50)}...`);
        }
        
        // Jika backend merespons gagal (misal kena batas 42 token / error 500)
        if (!response.ok) {
           throw new Error(data.error?.message || data.error || 'Error from Backend API');
        }
        
        // Simpan jawaban sukses ke dalam variabel agar otomatis muncul di layar web (UI)
        this.lastResult = {
          output: data.answer || 'No answer generated.',
          tokensUsed: data.tokenCount || 0,
          latencyMs: data.latencyMs || 0
        };
        this.lastInput = question.input;
        this.error = null;
        
        // Secara otomatis simpan pertanyaan dan jawaban ini ke halaman "History"
        try {
          const historyStore = useHistoryStore();
          historyStore.saveQuestion({
            input: question.input,
            output: this.lastResult.output,
            subject: question.subject || 'General' // Pilih 'General' jika tidak ada subjek
          });
        } catch (e) {
          console.error("Failed to auto-save to history", e); // Abaikan tanpa merusak sistem jika gagal simpan riwayat
        }
        
        return this.lastResult;
      } catch (err) {
        // Tangkap dan rapikan pesan error agar lebih mudah dibaca oleh pengguna biasa
        if (err.message === 'Failed to fetch') {
          this.error = 'Network Error. Ensure backend is running.';
        } else {
          this.error = err.message;
        }
        throw err;
      }
    },
    
    // Fungsi untuk menghapus/mereset hasil tanya jawab dari layar dan memori
    clearResult() {
      this.lastInput = '';
      this.lastResult = null;
      this.error = null;
    }
  }
})
