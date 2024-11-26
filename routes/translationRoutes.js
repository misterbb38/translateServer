// // routes/translationRoutes.js
// const express = require('express');
// const router = express.Router();
// const {translateText} = require('../controllers/translationController');
// const authMiddleware = require('../middleware/authMiddleware');

// // Route pour traduire du texte
// router.post('/translate', authMiddleware, translateText);

// module.exports = router;


// routes/translationRoutes.js

const express = require('express');
const router = express.Router();
const { translateText, getUserTranslations } = require('../controllers/translationController');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour traduire du texte
router.post('/translate', authMiddleware, translateText);

// Nouvelle route pour récupérer les traductions de l'utilisateur
router.get('/', authMiddleware, getUserTranslations);

module.exports = router;
