const express = require('express');
const rateLimit = require('express-rate-limit');
const OnnxSingleton = require('../services/OnnxSingleton');
const tokenGuard = require('../services/tokenGuard');
const { verifyAccessToken } = require('../middleware/authMiddleware');
const { MAX_INPUT_TOKENS } = require('../core/config');

const predictRateLimit = rateLimit({ 
  windowMs: 60000, 
  max: 10, 
  keyGenerator: (req) => req.user?.id || req.ip 
});

const router = express.Router();

router.post('/predict', verifyAccessToken, predictRateLimit, async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: { code: 'MISSING_INPUT', message: 'Input is required' } });
  }

  const { isValid, estimatedTokens, sanitized } = tokenGuard.enforceInputLimit(input);
  
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
    const singleton = await OnnxSingleton.getInstance();
    
    if (singleton._state !== 'READY') {
      return res.status(503).json({ error: { code: 'MODEL_NOT_READY', message: 'Model initializing' } });
    }

    const result = await singleton.infer(sanitized);

    res.status(200).json({
      answer: result.output,
      tokenCount: result.tokensUsed,
      latencyMs: result.latencyMs,
      modelState: singleton._state
    });
  } catch (err) {
    if (err.message === 'MODEL_NOT_READY') {
      return res.status(503).json({ error: { code: 'MODEL_NOT_READY', message: 'Model is currently busy or offline' } });
    }
    console.error('Inference pipeline error:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Inference failure' } });
  }
});

module.exports = router;
