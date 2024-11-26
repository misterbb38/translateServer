// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Garantit que chaque email est unique
    lowercase: true, // Convertit l'email en minuscules
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Vous pouvez ajouter d'autres champs si nécessaire
});

module.exports = mongoose.model('User', UserSchema);
