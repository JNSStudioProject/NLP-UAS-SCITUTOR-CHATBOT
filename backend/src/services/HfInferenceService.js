const { MODEL_ID, HF_TOKEN } = require('../core/config');

class HfInferenceService {
  static _instance = null;

  constructor() {
    // Mencegah pembuatan instance baru secara langsung. Gunakan getInstance()
    if (HfInferenceService._instance) {
      throw new Error("PRIVATE — throws if called directly. Use HfInferenceService.getInstance()");
    }
    this._state = 'READY'; // Status awal mesin
    this._requestCount = 0; // Menghitung sudah berapa kali AI ditanya
  }

  // Fungsi untuk mendapatkan mesin AI (memastikan hanya ada 1 mesin yang menyala di server)
  static async getInstance() {
    if (!HfInferenceService._instance) {
      HfInferenceService._instance = new HfInferenceService();
    }
    return HfInferenceService._instance;
  }

  // Fungsi inti untuk mengirim teks ke AI dan mendapatkan jawaban
  async infer(sanitizedPrompt, inferOptions = {}) {
    this._state = 'BUSY'; // Ubah status jadi sibuk agar tidak ditabrak request lain
    const start = Date.now(); // Catat waktu mulai
    
    try {
      // Menggunakan URL dari Server Mini HF Space yang baru dibuat
      const url = `https://jessica2121-nlp-uas-final-science.hf.space/models/${MODEL_ID}`;
      
      // Pengaturan bawaan AI (batas kata 325, suhu/kreativitas 1.0)
      const defaultOptions = { max_new_tokens: 325, temperature: 1.0 };
      const options = { ...defaultOptions, ...inferOptions };

      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Jika ada token (password), masukkan ke header
      if (HF_TOKEN) {
        headers['Authorization'] = `Bearer ${HF_TOKEN}`;
      }

      // Kirim pertanyaan ke URL Hugging Face
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          // Tambahkan "question: " di awal teks jika belum ada
          inputs: sanitizedPrompt.toLowerCase().startsWith('question:') 
            ? sanitizedPrompt 
            : `question: ${sanitizedPrompt}`,
          parameters: options
        })
      });

      // Jika server Hugging Face error
      if (!response.ok) {
        const errText = await response.text();
        console.error('Hugging Face API Error:', errText);
        throw new Error(`HF API Error: ${response.status}`);
      }

      // Ambil jawaban sukses dari Hugging Face
      const result = await response.json();
      
      let outputText = '';
      
      // Membersihkan dan merapikan teks balasan AI yang kadang formatnya beda-beda
      if (Array.isArray(result) && result.length > 0) {
        outputText = result[0].generated_text || result[0].summary_text || result[0].answer || '';
      } else if (result.generated_text) {
        outputText = result.generated_text;
      } else if (result.error) {
        throw new Error(`Model Error: ${result.error}`);
      } else {
        outputText = JSON.stringify(result);
      }

      this._requestCount++; // Tambah statistik penggunaan

      // Kembalikan hasil yang rapi beserta data analitiknya
      return {
        output: outputText,
        tokensUsed: Math.ceil(outputText.trim().split(/\s+/).length * 1.35),
        latencyMs: Date.now() - start, // Hitung lama waktu proses (milidetik)
        memoryMB: 0
      };
    } finally {
      this._state = 'READY'; // Kembalikan status jadi siap setelah selesai
    }
  }

  // Fungsi untuk melihat status mesin (dipakai untuk monitoring)
  getStatus() {
    return {
      state: this._state,
      modelId: MODEL_ID,
      requestCount: this._requestCount,
      memoryUsageMB: 0,
      uptime: process.uptime()
    };
  }

  // Fungsi untuk mematikan mesin (saat server dimatikan)
  async destroy() {
    HfInferenceService._instance = null;
    this._state = 'UNINITIALIZED';
  }
}

module.exports = HfInferenceService;
