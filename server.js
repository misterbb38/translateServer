// // server.js
// const express = require('express');
// const connectDB = require('./config/db');
// const authRoutes = require('./routes/authRoutes');
// const glossaryRoutes = require('./routes/glossaryRoutes');
// const translationRoutes = require('./routes/translationRoutes');
// const definitionRoutes = require('./routes/definitionRoutes');
// const subscriptionRoutes = require('./routes/subscriptionRoutes');

// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Connexion à la base de données
// connectDB();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/glossaries', glossaryRoutes);
// app.use('/api/translations', translationRoutes);
// app.use('/api/definitions', definitionRoutes);
// app.use('/api/subscriptions', subscriptionRoutes); 

// // Démarrer le serveur
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));


// server.js
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const glossaryRoutes = require('./routes/glossaryRoutes');
const translationRoutes = require('./routes/translationRoutes');
const definitionRoutes = require('./routes/definitionRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connexion à la base de données
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'https://translate.palabresak2.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Route racine pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur l\'API de traduction', 
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      glossaries: '/api/glossaries',
      translations: '/api/translations',
      definitions: '/api/definitions',
      subscriptions: '/api/subscriptions'
    }
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/glossaries', glossaryRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/definitions', definitionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route non trouvée',
    requestedPath: req.path
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Une erreur est survenue' 
      : err.message,
    path: req.path
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database connected:', process.env.MONGODB_URI ? 'Yes' : 'No');
  console.log('Stripe configured:', process.env.STRIPE_SECRET_KEY ? 'Yes' : 'No');
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu. Arrêt gracieux...');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});

// Export pour les tests
module.exports = server;