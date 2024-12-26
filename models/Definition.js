// models/Definition.js
const mongoose = require('mongoose');

const DefinitionSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  definitions: [{
    meaning: String,
    partOfSpeech: String,
    examples: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Definition', DefinitionSchema);

