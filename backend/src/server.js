const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const config = require('./core/config');
const HfInferenceService = require('./services/HfInferenceService');
const nlpRouter = require('./api/nlp');

const app = express();

// Global Middleware (Perlindungan dan pengaturan dasar aplikasi)
app.use(helmet()); // Mengamankan header HTTP (Keamanan)
app.use(cors({ origin: '*' })); // Mengizinkan frontend (di URL berbeda) untuk mengakses backend ini
app.use(express.json({ limit: '16kb' })); // Membaca data JSON dari frontend (dibatasi 16kb agar server tidak jebol)
app.use(cookieParser()); // Membaca data cookie (biasanya untuk sistem login/token)
app.use(rateLimit({ windowMs: 60000, max: 100 })); // Batas maksimal 100 request/menit untuk seluruh server (Anti-DDoS ringan)

// Routes (Jalur lalu lintas)
// Semua permintaan (request) yang URL-nya diawali dengan '/api' akan diarahkan ke file nlpRouter (api/nlp.js)
app.use('/api', nlpRouter);

// Global Error Handler (Penangkap Error Terakhir)
// Jika ada error/kerusakan kode yang lolos dan tidak tertangani di atas, tangkap di sini agar server tidak mati (crash)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
});

// Hanya jalankan server jika TIDAK sedang di-deploy ke Vercel (karena Vercel memakai sistem Serverless, bukan server jalan terus)
if (!process.env.VERCEL) {
  const server = app.listen(config.PORT, () => {
    console.log(`ask-scitutor backend running on port ${config.PORT}`);
  });

  // Skrip untuk mematikan server dengan aman (Graceful Shutdown) tanpa memutus paksa koneksi user yang sedang berjalan
  const shutdownSequence = async () => {
    console.log('Shutdown signal received. Executing graceful shutdown sequence...');
    server.close(async () => {
      console.log('HTTP connections closed.');
      try {
        // Matikan juga mesin AI dengan rapi
        if (HfInferenceService._instance) {
          await HfInferenceService._instance.destroy();
          console.log('HfInferenceService cleaned up.');
        }
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown sequence:', err);
        process.exit(1);
      }
    });

    // Jika lebih dari 10 detik proses mematikan belum selesai, matikan paksa
    setTimeout(() => {
      console.error('In-flight requests drain timeout. Force quitting.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdownSequence); // Menangkap sinyal matikan (seperti ketika ditutup oleh sistem server)
  process.on('SIGINT', shutdownSequence); // Menangkap tombol CTRL+C di terminal Anda

  // Menangkap error (kegagalan sistem) yang tidak sengaja lupa ditangkap oleh try-catch
  process.on('unhandledRejection', async (reason) => {
    console.error('Unhandled Promise Rejection:', reason);
    try {
      if (HfInferenceService._instance) {
        await HfInferenceService._instance.destroy();
      }
    } catch (e) {
      console.error('Failed to cleanup HfInferenceService instance on unhandled rejection:', e);
    }
    process.exit(1);
  });
}

// Mengekspor app (Dibutuhkan oleh Vercel agar bisa dibaca sebagai fungsi Serverless)
module.exports = app;
