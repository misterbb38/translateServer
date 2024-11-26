// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Vérifier le token JWT dans les en-têtes
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Aucun token, autorisation refusée.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Assurez-vous que le payload du token contient l'ID de l'utilisateur
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide.' });
  }
};
