// models/Glossary.js

const mongoose = require('mongoose');

const GlossarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  terms: [
    {
      source: {
        type: String,
        required: true,
      },
      target: {
        type: String,
        required: true,
      },
    },
  ],
  sourceLanguage: {
    type: String,
    required: true,
  },
  targetLanguage: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Glossary', GlossarySchema);
