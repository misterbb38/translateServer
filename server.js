// server.js
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const glossaryRoutes = require('./routes/glossaryRoutes');
const translationRoutes = require('./routes/translationRoutes');
const definitionRoutes = require('./routes/definitionRoutes');

const cors = require('cors');
require('dotenv').config();

const app = express();

// Connexion à la base de données
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/glossaries', glossaryRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/definitions', definitionRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
