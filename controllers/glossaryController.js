// // controllers/glossaryController.js

// const Glossary = require('../models/Glossary');


// exports.addTermToGlossary = async (req, res) => {
//   try {
//     const glossaryId = req.params.id;
//     const { source, target } = req.body;

//     // Vérifier que source et target ne sont pas vides
//     if (!source || !target) {
//       return res.status(400).json({
//         message: 'Veuillez fournir le terme source et le terme cible.',
//       });
//     }

//     // Récupérer le glossaire
//     const glossary = await Glossary.findById(glossaryId);

//     // Vérifier l’existence du glossaire
//     if (!glossary) {
//       return res.status(404).json({ message: 'Glossaire non trouvé.' });
//     }

//     // Vérifier que l'utilisateur est propriétaire du glossaire
//     if (glossary.user.toString() !== req.user.id) {
//       return res.status(403).json({ message: 'Accès non autorisé.' });
//     }

//     // Ajouter le nouveau terme dans le tableau terms
//     glossary.terms.push({ source, target });

//     // Sauvegarder le glossaire mis à jour
//     const updatedGlossary = await glossary.save();

//     return res.status(200).json(updatedGlossary);
//   } catch (error) {
//     console.error('Erreur lors de l\'ajout du terme au glossaire:', error.message);
//     return res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };


// // Fonction pour créer un glossaire
// exports.createGlossary = async (req, res) => {
//   try {
//     const { name, terms, sourceLanguage, targetLanguage } = req.body;

//     // Validation des entrées
//     if (!name || !terms || !sourceLanguage || !targetLanguage) {
//       return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
//     }

//     // Création du glossaire
//     const newGlossary = new Glossary({
//       user: req.user.id, // L'ID de l'utilisateur est disponible grâce au middleware d'authentification
//       name,
//       terms,
//       sourceLanguage,
//       targetLanguage,
//     });

//     const savedGlossary = await newGlossary.save();

//     res.status(201).json(savedGlossary);
//   } catch (error) {
//     console.error('Erreur lors de la création du glossaire:', error.message);
//     res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };

// // Fonction pour obtenir les glossaires de l'utilisateur
// exports.getUserGlossaries = async (req, res) => {
//   try {
//     const glossaries = await Glossary.find({ user: req.user.id });

//     res.status(200).json(glossaries);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des glossaires:', error.message);
//     res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };


// controllers/glossaryController.js
const Glossary = require('../models/Glossary');
const Subscription = require('../models/Subscription');

const PLAN_LIMITS = {
  free: {
    glossariesCount: 1,
    termsPerGlossary: 50
  },
  starter: {
    glossariesCount: 5,
    termsPerGlossary: 200
  },
  pro: {
    glossariesCount: 20,
    termsPerGlossary: 1000
  },
  enterprise: {
    glossariesCount: Infinity,
    termsPerGlossary: Infinity
  }
};

exports.addTermToGlossary = async (req, res) => {
  try {
    const glossaryId = req.params.id;
    const { source, target } = req.body;

    if (!source || !target) {
      return res.status(400).json({
        message: 'Veuillez fournir le terme source et le terme cible.',
      });
    }

    const glossary = await Glossary.findById(glossaryId);
    if (!glossary) {
      return res.status(404).json({ message: 'Glossaire non trouvé.' });
    }

    if (glossary.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    // Vérifier les limites du plan
    const subscription = await Subscription.findOne({ 
      user: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(403).json({ message: 'Aucun abonnement actif.' });
    }

    const planLimits = PLAN_LIMITS[subscription.plan];
    if (glossary.terms.length >= planLimits.termsPerGlossary) {
      return res.status(429).json({
        message: 'Limite de termes atteinte pour ce glossaire.',
        currentCount: glossary.terms.length,
        limit: planLimits.termsPerGlossary
      });
    }

    glossary.terms.push({ source, target });
    const updatedGlossary = await glossary.save();

    return res.status(200).json({
      glossary: updatedGlossary,
      usage: {
        currentTerms: updatedGlossary.terms.length,
        limit: planLimits.termsPerGlossary
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du terme au glossaire:', error.message);
    return res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

exports.createGlossary = async (req, res) => {
  try {
    const { name, terms, sourceLanguage, targetLanguage } = req.body;

    if (!name || !terms || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
    }

    // Vérifier les limites du plan
    const subscription = await Subscription.findOne({ 
      user: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(403).json({ message: 'Aucun abonnement actif.' });
    }

    const existingGlossaries = await Glossary.countDocuments({ user: req.user.id });
    const planLimits = PLAN_LIMITS[subscription.plan];

    if (existingGlossaries >= planLimits.glossariesCount) {
      return res.status(429).json({
        message: 'Limite de glossaires atteinte pour votre plan.',
        currentCount: existingGlossaries,
        limit: planLimits.glossariesCount
      });
    }

    if (terms.length > planLimits.termsPerGlossary) {
      return res.status(429).json({
        message: 'Nombre de termes supérieur à la limite autorisée.',
        currentCount: terms.length,
        limit: planLimits.termsPerGlossary
      });
    }

    const newGlossary = new Glossary({
      user: req.user.id,
      name,
      terms,
      sourceLanguage,
      targetLanguage,
    });

    const savedGlossary = await newGlossary.save();

    res.status(201).json({
      glossary: savedGlossary,
      usage: {
        glossariesCount: existingGlossaries + 1,
        glossariesLimit: planLimits.glossariesCount,
        termsCount: terms.length,
        termsLimit: planLimits.termsPerGlossary
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du glossaire:', error.message);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Les autres méthodes restent similaires mais avec l'ajout des informations d'utilisation
// exports.getUserGlossaries = async (req, res) => {
//   try {
//     const glossaries = await Glossary.find({ user: req.user.id });
//     const subscription = await Subscription.findOne({ 
//       user: req.user.id,
//       status: 'active'
//     });

//     const planLimits = PLAN_LIMITS[subscription.plan];

//     res.status(200).json({
//       glossaries,
//       usage: {
//         glossariesCount: glossaries.length,
//         glossariesLimit: planLimits.glossariesCount,
//         termsPerGlossary: planLimits.termsPerGlossary
//       }
//     });
//   } catch (error) {
//     console.error('Erreur lors de la récupération des glossaires:', error.message);
//     res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };

// controllers/glossaryController.js
exports.getUserGlossaries = async (req, res) => {
  try {
    console.log('User ID from token:', req.user.id); // Vérifier l'ID utilisateur
    
    const glossaries = await Glossary.find({ user: req.user.id });
    console.log('Found glossaries:', glossaries); // Vérifier les glossaires trouvés
    
    res.status(200).json(glossaries || []);
  } catch (error) {
    console.error('Error in getUserGlossaries:', error);
    res.status(500).json({ 
      message: 'Erreur du serveur.',
      error: error.message 
    });
  }
};


// Dans glossaryController.js

exports.getGlossaryById = async (req, res) => {
  try {
    const glossaryId = req.params.id;

    const glossary = await Glossary.findById(glossaryId);
    if (!glossary) {
      return res.status(404).json({ message: 'Glossaire non trouvé.' });
    }

    // Vérifier si l'utilisateur est le propriétaire du glossaire
    if (glossary.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    // Récupérer les informations d'abonnement
    const subscription = await Subscription.findOne({ 
      user: req.user.id,
      status: 'active'
    });

    const planLimits = PLAN_LIMITS[subscription.plan];

    res.status(200).json({
      glossary,
      usage: {
        termsCount: glossary.terms.length,
        termsLimit: planLimits.termsPerGlossary
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du glossaire:', error.message);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Fonction pour obtenir un glossaire spécifique
// exports.getGlossaryById = async (req, res) => {
//   try {
//     const glossaryId = req.params.id;

//     const glossary = await Glossary.findById(glossaryId);

//     if (!glossary) {
//       return res.status(404).json({ message: 'Glossaire non trouvé.' });
//     }

//     // Vérifier si l'utilisateur est le propriétaire du glossaire
//     if (glossary.user.toString() !== req.user.id) {
//       return res.status(403).json({ message: 'Accès non autorisé.' });
//     }

//     res.status(200).json(glossary);
//   } catch (error) {
//     console.error('Erreur lors de la récupération du glossaire:', error.message);
//     res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };

// Fonction pour mettre à jour un glossaire
exports.updateGlossary = async (req, res) => {
  try {
    const glossaryId = req.params.id;
    const { name, terms, sourceLanguage, targetLanguage } = req.body;

    let glossary = await Glossary.findById(glossaryId);

    if (!glossary) {
      return res.status(404).json({ message: 'Glossaire non trouvé.' });
    }

    // Vérifier si l'utilisateur est le propriétaire du glossaire
    if (glossary.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    // Mise à jour du glossaire
    glossary.name = name || glossary.name;
    glossary.terms = terms || glossary.terms;
    glossary.sourceLanguage = sourceLanguage || glossary.sourceLanguage;
    glossary.targetLanguage = targetLanguage || glossary.targetLanguage;

    const updatedGlossary = await glossary.save();

    res.status(200).json(updatedGlossary);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du glossaire:', error.message);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Fonction pour supprimer un glossaire
exports.deleteGlossary = async (req, res) => {
  try {
    const glossaryId = req.params.id;

    const glossary = await Glossary.findById(glossaryId);

    if (!glossary) {
      return res.status(404).json({ message: 'Glossaire non trouvé.' });
    }

    // Vérifier si l'utilisateur est le propriétaire du glossaire
    if (glossary.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    await glossary.remove();

    res.status(200).json({ message: 'Glossaire supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du glossaire:', error.message);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};
