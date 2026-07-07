const express = require('express');
const rateLimit = require('express-rate-limit');
const HfInferenceService = require('../services/HfInferenceService');
const tokenGuard = require('../services/tokenGuard');
const { verifyAccessToken } = require('../middleware/authMiddleware');
const { MAX_INPUT_TOKENS } = require('../core/config');

// Membuat aturan anti-spam: maksimal 10 request per menit per user/IP
const predictRateLimit = rateLimit({ 
  windowMs: 60000, 
  max: 10, 
  keyGenerator: (req) => req.user?.id || req.ip,
  validate: { xForwardedForHeader: false, default: false } // Menghindari pesan error validasi IPv6
});

const router = express.Router();

// Membuat pintu masuk API di rute '/predict' dengan penjaga token (login) dan anti-spam
router.post('/predict', verifyAccessToken, predictRateLimit, async (req, res) => {
  const { input } = req.body;

  // Cek apakah ada teks pertanyaan yang dikirim. Jika kosong, tolak.
  if (!input) {
    return res.status(400).json({ error: { code: 'MISSING_INPUT', message: 'Input is required' } });
  }

  // Menghitung panjang teks (token) agar tidak kepanjangan
  const { isValid, estimatedTokens, sanitized } = tokenGuard.enforceInputLimit(input);
  
  // Jika teks kepanjangan dari batas maksimal, tolak dan kembalikan pesan error
  if (!isValid) {
    return res.status(422).json({
      error: {
        code: 'INPUT_TOKEN_LIMIT_EXCEEDED',
        message: `Input exceeds ${MAX_INPUT_TOKENS}-token limit`,
        meta: { estimatedTokens, maxAllowed: MAX_INPUT_TOKENS }
      }
    });
  }

  try {
    // Memanggil mesin AI (Hugging Face Service)
    const singleton = await HfInferenceService.getInstance();
    
    // Cek status mesin. Jika sedang repot atau belum siap, suruh user menunggu (Status 503)
    if (singleton._state !== 'READY') {
      return res.status(503).json({ error: { code: 'MODEL_NOT_READY', message: 'Model initializing' } });
    }

    // Mengirim pertanyaan ke AI dan menunggu jawabannya
    const result = await singleton.infer(sanitized);

    // Membungkus dan mengirim kembali jawaban AI tersebut ke Frontend dengan sukses (Status 200)
    res.status(200).json({
      answer: result.output,
      tokenCount: result.tokensUsed,
      latencyMs: result.latencyMs,
      modelState: singleton._state
    });
  } catch (err) {
    // Jika ada error/masalah saat nanya ke AI, tangkap error-nya agar server tidak mati (crash)
    if (err.message === 'MODEL_NOT_READY') {
      return res.status(503).json({ error: { code: 'MODEL_NOT_READY', message: 'Model is currently busy or offline' } });
    }
    console.error('Inference pipeline error:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Inference failure' } });
  }
});

module.exports = router;
