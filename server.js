// server.js
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const glossaryRoutes = require('./routes/glossaryRoutes');
const translationRoutes = require('./routes/translationRoutes');
const definitionRoutes = require('./routes/definitionRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

const cors = require('cors');
require('dotenv').config();

const app = express();

// Connexion à la base de données
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
// Correction pour définir une route racine
app.get('/', function (req, res) {
    return res.status(200).json({ message: 'Welcome to the API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/glossaries', glossaryRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/definitions', definitionRoutes);
app.use('/api/subscriptions', subscriptionRoutes); 

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
