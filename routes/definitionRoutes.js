// routes/definitionRoutes.js
const express = require('express');
const router = express.Router();
const { getWordDefinition } = require('../controllers/definitionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/define', authMiddleware, getWordDefinition);

module.exports = router;