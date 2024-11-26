const express = require('express');
const router = express.Router();
const glossaryController = require('../controllers/glossaryController');
const authMiddleware = require('../middleware/authMiddleware');

// Créer un glossaire
router.post('/', authMiddleware, glossaryController.createGlossary);

// Obtenir les glossaires de l'utilisateur
router.get('/', authMiddleware, glossaryController.getUserGlossaries);

// Obtenir un glossaire spécifique
router.get('/:id', authMiddleware, glossaryController.getGlossaryById);

// Mettre à jour un glossaire
router.put('/:id', authMiddleware, glossaryController.updateGlossary);

// Supprimer un glossaire
router.delete('/:id', authMiddleware, glossaryController.deleteGlossary);

module.exports = router;
