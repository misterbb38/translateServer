// middleware/usageLimits.js
const User = require('../models/User');

const PLAN_LIMITS = {
  free: {
    characterLimit: 50000,
    translationLimit: 50
  },
  starter: {
    characterLimit: 300000,
    translationLimit: 300
  },
  pro: {
    characterLimit: 1000000,
    translationLimit: 1000
  },
  enterprise: {
    characterLimit: Infinity,
    translationLimit: Infinity
  }
};

exports.checkUsageLimits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const planLimits = PLAN_LIMITS[user.subscriptionPlan];
    
    // Vérifier les limites
    if (user.monthlyUsage.characters >= planLimits.characterLimit ||
        user.monthlyUsage.translations >= planLimits.translationLimit) {
      return res.status(429).json({
        message: 'Limite d\'utilisation atteinte pour votre plan',
        currentUsage: user.monthlyUsage,
        limits: planLimits
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};