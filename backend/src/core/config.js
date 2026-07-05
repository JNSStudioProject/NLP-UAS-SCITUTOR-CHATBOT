require('dotenv/config');

const config = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-production',
  MODEL_ID: process.env.MODEL_ID || 'Xenova/flan-t5-base',
  MEM_ABORT_THRESHOLD_MB: 400,
  MEM_WARN_THRESHOLD_MB: 450,
  MAX_INPUT_TOKENS: 42
};

module.exports = config;
