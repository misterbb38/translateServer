  // models/Translation.js

  const mongoose = require('mongoose');

  const TranslationSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    model: {
      type: String,
      enum: ['claude', 'gemini', 'gpt'],
      required: true
    },
    sourceLanguage: {
      type: String,
      required: true,
    },
    targetLanguage: {
      type: String,
      required: true,
    },
    sourceText: {
      type: String,
      required: true,
    },
    translatedText: {
      type: String,
      required: true,
    },
    glossary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Glossary',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  module.exports = mongoose.model('Translation', TranslationSchema);
