import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

// Nama kunci tempat menyimpan data di dalam memori Browser (Local Storage)
const STORAGE_KEY = 'scitutor_history'

// Membuat "Gudang Data" khusus untuk menyimpan Riwayat Tanya Jawab
export const useHistoryStore = defineStore('history', {
  // state: Variabel yang menampung daftar riwayat saat web dibuka
  state: () => {
    let saved = []
    try {
      // Saat web pertama kali dibuka, coba baca data riwayat lama yang tersimpan di memori browser
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        saved = JSON.parse(stored) // Ubah teks menjadi bentuk objek JS
      }
    } catch (e) {
      console.error('Error reading history from localStorage', e)
    }
    
    return {
      questions: saved, // Daftar lengkap riwayat
      loading: false, // Penanda animasi loading
      error: null, // Pesan error jika gagal baca/tulis
    }
  },
  
  // getters: Fungsi cepat untuk mengambil info dari state (misalnya, total jumlah riwayat)
  getters: {
    historyCount: (state) => state.questions.length,
  },
  
  // actions: Fungsi-fungsi yang mengubah data (Menambah/Menghapus riwayat)
  actions: {
    // Membaca ulang memori browser secara manual jika diperlukan
    async fetchHistory() {
      this.loading = true
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          this.questions = JSON.parse(stored)
        }
      } catch (err) {
        this.error = 'Failed to parse history'
      } finally {
        this.loading = false
      }
    },
    
    // Menyimpan pertanyaan dan jawaban AI yang baru selesai diproses
    async saveQuestion(questionData) {
      try {
        const authStore = useAuthStore();
        
        // Membungkus pertanyaan, jawaban, nama user, dan jam penulisan menjadi 1 objek utuh
        const newEntry = {
          id: Date.now().toString() + Math.random().toString(36).substring(7), // Buat ID unik acak
          ...questionData,
          userEmail: authStore.user?.email || 'Guest', // Ambil email user yang login
          user: authStore.user?.user_metadata?.full_name || 'Anonymous User', // Ambil nama user
          createdAt: new Date().toISOString() // Waktu saat ini
        }
        
        // Masukkan data baru ke urutan paling atas daftar riwayat
        this.questions.unshift(newEntry)
        
        // Simpan daftar terbaru ini ke dalam memori fisik Browser (agar tidak hilang saat refresh)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.questions))
        return newEntry
      } catch (err) {
        console.error('Failed to save question to history', err)
        throw err
      }
    },

    // Menghapus seluruh riwayat
    async clearHistory() {
      try {
        // Hapus data fisik dari Browser
        localStorage.removeItem(STORAGE_KEY)
        // Kosongkan dari layar
        this.questions = []
      } catch (err) {
        this.error = 'Failed to clear history'
        throw err
      }
    }
  }
})
