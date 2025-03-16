

// const Translation = require('../models/Translation');
// const Glossary = require('../models/Glossary');
// const mongoose = require('mongoose');
// const Subscription = require('../models/Subscription');
// const { generateTranslation } = require('../utils/geminiAPI'); // Importer la fonction depuis geminiAPI.js
// const { generateClaudeTranslation } = require('../utils/claudeAPI');
// const { generateOpenAITranslation } = require('../utils/openaiAPI');
// const { generateDeepSeekTranslation } = require('../utils/deepseekAPI');

// // Fonction auxiliaire pour extraire les termes pertinents du glossaire
// function extractRelevantTerms(text, terms) {
//   const relevantTerms = {};

//   // Convertir le texte en minuscules pour une correspondance insensible à la casse
//   const textLower = text.toLowerCase();

//   terms.forEach(term => {
//     // term.source est le terme dans la langue source
//     const termSource = term.source.toLowerCase();
//     if (textLower.includes(termSource)) {
//       relevantTerms[term.source] = term.target;
//     }
//   });

//   return relevantTerms;
// }

// // Fonction auxiliaire pour créer le prompt pour l'API
// function createPrompt(text, relevantTerms, sourceLanguage, targetLanguage) {
//   let prompt = `Veuillez traduire le texte suivant de ${sourceLanguage} vers ${targetLanguage}`;

//   if (Object.keys(relevantTerms).length > 0) {
//     let glossaryText = ' en respectant les traductions spécifiques du glossaire fourni.\n\nGlossaire :\n';
//     for (let [termSource, termTarget] of Object.entries(relevantTerms)) {
//       glossaryText += `- "${termSource}" : "${termTarget}"\n`;
//     }
//     prompt += glossaryText;
//   } else {
//     prompt += '.';
//   }

//   prompt += `\n\nTexte à traduire :\n"${text}"`;

//   return prompt;
// }
// // Définir les limites de chaque plan
// const PLAN_LIMITS = {
//   free: {
//     characters: 50000,
//     translations: 50
//   },
//   starter: {
//     characters: 300000,
//     translations: 300,
//     price_id: process.env.STRIPE_STARTER_PRICE_ID
//   },
//   pro: {
//     characters: 1000000,
//     translations: 1000,
//     price_id: process.env.STRIPE_PRO_PRICE_ID
//   },
//   enterprise: { // Ajouter le plan enterprise
//     characters: 5000000,
//     translations: 5000,
//     price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID
//   }
// };
// // Fonction pour traduire le texte



// // Helper pour obtenir le mois courant au format "YYYY-MM"
// function getCurrentMonthString() {
//   const now = new Date();
//   const year = now.getFullYear();
//   // On ajoute +1 à getMonth() car janvier = 0
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   return `${year}-${month}`; // ex: "2023-07"
// }

// /**
//  * Controller : Traduire du texte et mettre à jour l'usage de l'utilisateur.
//  */
// // controllers/translationController.js

// exports.translateText = async (req, res) => {
//   try {
//     const { text, glossaryId, sourceLanguage, targetLanguage, model } = req.body;

//     // 1) Vérifier les paramètres requis
//     if (!text || !sourceLanguage || !targetLanguage || !model) {
//       return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
//     }

//     // Vérifier le modèle
//     if (!['claude', 'gemini', 'gpt'].includes(model)) {
//       return res.status(400).json({ message: 'Modèle de traduction invalide.' });
//     }

//     // 2) Gérer le glossaire (si glossaryId est présent)
//     let relevantTerms = {};
//     if (glossaryId) {
//       if (!mongoose.Types.ObjectId.isValid(glossaryId)) {
//         return res.status(400).json({ message: 'ID de glossaire invalide.' });
//       }

//       const glossary = await Glossary.findById(glossaryId);
//       if (!glossary) {
//         return res.status(404).json({ message: 'Glossaire non trouvé.' });
//       }

//       // Vérifier que l'utilisateur possède bien ce glossaire
//       if (glossary.user.toString() !== req.user.id) {
//         return res.status(403).json({ message: 'Accès non autorisé.' });
//       }

//       // Vérifier la cohérence des langues
//       if (glossary.sourceLanguage !== sourceLanguage || glossary.targetLanguage !== targetLanguage) {
//         return res.status(400).json({ message: 'Les langues du glossaire ne correspondent pas.' });
//       }

//       // Extraire les termes pertinents
//       relevantTerms = extractRelevantTerms(text, glossary.terms);
//     }

//     // 3) Créer le prompt et appeler l’API de traduction
//     const prompt = createPrompt(text, relevantTerms, sourceLanguage, targetLanguage);
//     let translatedText;
//     switch (model) {
//       case 'claude':
//         translatedText = await generateClaudeTranslation(prompt);
//         break;
//       case 'gpt':
//         translatedText = await generateOpenAITranslation(prompt);
//         break;
//       default:
//         translatedText = await generateTranslation(prompt);
//     }

//     // 4) Enregistrer la traduction
//     const newTranslation = new Translation({
//       user: req.user.id,
//       sourceLanguage,
//       targetLanguage,
//       sourceText: text,
//       translatedText,
//       glossary: glossaryId || null,
//       model,
//     });
//     await newTranslation.save();

//     // 5) Mettre à jour l'usage dans la subscription
//     //    => calculer le nombre de mots (ou de caractères) à partir du 'text'
//     const wordsCount = text.trim().split(/\s+/).length; // ou text.length pour caractères
//     const currentMonth = getCurrentMonthString();

//     const subscription = await Subscription.findOne({
//       user: req.user.id,
//       status: 'active',
//     });

//     if (subscription) {
//       // Vérifier que currentPeriodEnd est défini et valide
//       if (!subscription.currentPeriodEnd || isNaN(new Date(subscription.currentPeriodEnd))) {
//         console.warn(`currentPeriodEnd invalid or missing for subscription ${subscription._id}`);
//         subscription.daysUntilRenewal = null; // ou une valeur par défaut appropriée
//       } else {
//         // Calculer les jours jusqu'au renouvellement
//         const now = new Date();
//         const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
//         const diffTime = currentPeriodEnd - now;
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//         subscription.daysUntilRenewal = diffDays;
//         console.log(`daysUntilRenewal for subscription ${subscription._id}: ${diffDays}`);
//       }

//       // Initialiser usageThisMonth si undefined
//       if (!subscription.usageThisMonth) {
//         console.log(`Initializing usageThisMonth for subscription ${subscription._id}`);
//         subscription.usageThisMonth = { characters: 0, translations: 0 };
//       }

//       // Chercher s'il existe déjà une entrée dans usageHistory pour le mois courant
//       const monthEntry = subscription.usageHistory.find(
//         (entry) => entry.month === currentMonth
//       );

//       if (monthEntry) {
//         monthEntry.words += wordsCount;
//         monthEntry.requests += 1;
//       } else {
//         // Créer une nouvelle entrée pour ce mois
//         subscription.usageHistory.push({
//           month: currentMonth,
//           words: wordsCount,
//           requests: 1,
//         });
//       }

//       // Mettre à jour également usageThisMonth (si vous gérez toujours une limite mensuelle)
//       subscription.usageThisMonth.characters += wordsCount; // ou .words
//       subscription.usageThisMonth.translations += 1;

//       // Définir isApproachingLimit en fonction des seuils (ex : 80%)
//       const CHARACTER_THRESHOLD = 0.8; // 80%
//       const TRANSLATION_THRESHOLD = 0.8; // 80%

//       const currentPlanLimits = PLAN_LIMITS[subscription.plan];
//       if (!currentPlanLimits) {
//         console.warn(`Limits not defined for plan: ${subscription.plan}`);
//       }

//       const characterUsageRatio = currentPlanLimits
//         ? subscription.usageThisMonth.characters / currentPlanLimits.characters
//         : 0;
//       const translationUsageRatio = currentPlanLimits
//         ? subscription.usageThisMonth.translations / currentPlanLimits.translations
//         : 0;

//       subscription.isApproachingLimit =
//         characterUsageRatio >= CHARACTER_THRESHOLD ||
//         translationUsageRatio >= TRANSLATION_THRESHOLD;

//       console.log(`isApproachingLimit for subscription ${subscription._id}: ${subscription.isApproachingLimit}`);

//       await subscription.save();
//     }

//     // 6) Réponse finale
//     return res.status(200).json({ translatedText });
//   } catch (error) {
//     console.error('Erreur lors de la traduction :', error.message);
//     return res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };





// exports.getUserTranslations = async (req, res) => {
//   try {
//     const translations = await Translation.find({ user: req.user.id }).sort({ createdAt: -1 });
//     res.status(200).json(translations);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des traductions:', error.message);
//     res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };



const Translation = require('../models/Translation');
const Glossary = require('../models/Glossary');
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');

const { generateTranslation } = require('../utils/geminiAPI'); 
const { generateClaudeTranslation } = require('../utils/claudeAPI');
const { generateOpenAITranslation } = require('../utils/openaiAPI');
const { generateDeepSeekTranslation } = require('../utils/deepseekAPI'); // <-- INTÉGRATION DE DEEPSEEK

// Fonction auxiliaire pour extraire les termes pertinents du glossaire
function extractRelevantTerms(text, terms) {
  const relevantTerms = {};
  const textLower = text.toLowerCase();

  terms.forEach(term => {
    const termSource = term.source.toLowerCase();
    if (textLower.includes(termSource)) {
      relevantTerms[term.source] = term.target;
    }
  });

  return relevantTerms;
}

// Fonction auxiliaire pour créer le prompt pour l'API
function createPrompt(text, relevantTerms, sourceLanguage, targetLanguage) {
  let prompt = `Veuillez traduire le texte suivant de ${sourceLanguage} vers ${targetLanguage}`;

  if (Object.keys(relevantTerms).length > 0) {
    let glossaryText = ' en respectant les traductions spécifiques du glossaire fourni.\n\nGlossaire :\n';
    for (let [termSource, termTarget] of Object.entries(relevantTerms)) {
      glossaryText += `- "${termSource}" : "${termTarget}"\n`;
    }
    prompt += glossaryText;
  } else {
    prompt += '.';
  }

  prompt += `\n\nTexte à traduire :\n"${text}"`;

  return prompt;
}

// Définir les limites de chaque plan
const PLAN_LIMITS = {
  free: {
    characters: 50000,
    translations: 50
  },
  starter: {
    characters: 300000,
    translations: 300,
    price_id: process.env.STRIPE_STARTER_PRICE_ID
  },
  pro: {
    characters: 1000000,
    translations: 1000,
    price_id: process.env.STRIPE_PRO_PRICE_ID
  },
  enterprise: {
    characters: 5000000,
    translations: 5000,
    price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID
  }
};

// Définir quels modèles sont autorisés pour chaque plan
const PLAN_MODELS = {
  free:        ['gemini'],
  starter:     ['gemini', 'gpt', 'deepseek'],
  pro:         ['gemini', 'gpt', 'claude', 'deepseek'],
  enterprise:  ['gemini', 'gpt', 'claude', 'deepseek']
};

// Helper pour obtenir le mois courant au format "YYYY-MM"
function getCurrentMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Controller : Traduire du texte et mettre à jour l'usage de l'utilisateur.
 */
exports.translateText = async (req, res) => {
  try {
    const { text, glossaryId, sourceLanguage, targetLanguage, model } = req.body;

    // 1) Vérifier les paramètres requis
    if (!text || !sourceLanguage || !targetLanguage || !model) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
    }

    // Vérifier que le modèle fait partie des modèles existants
    // Ajoutez "deepseek" ici
    if (!['claude', 'gemini', 'gpt', 'deepseek'].includes(model)) {
      return res.status(400).json({ message: 'Modèle de traduction invalide.' });
    }

    // 2) Récupérer la subscription de l’utilisateur
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active',
    });
    if (!subscription) {
      return res.status(403).json({ message: 'Aucun abonnement actif.' });
    }

    // Vérifier si le plan actuel autorise l’utilisation de ce modèle
    const allowedModels = PLAN_MODELS[subscription.plan];
    if (!allowedModels || !allowedModels.includes(model)) {
      return res.status(403).json({
        message: `Le modèle '${model}' n'est pas disponible dans votre plan.`,
        availableModels: allowedModels
      });
    }

    // 3) Gérer le glossaire (si glossaryId est présent)
    let relevantTerms = {};
    if (glossaryId) {
      if (!mongoose.Types.ObjectId.isValid(glossaryId)) {
        return res.status(400).json({ message: 'ID de glossaire invalide.' });
      }

      const glossary = await Glossary.findById(glossaryId);
      if (!glossary) {
        return res.status(404).json({ message: 'Glossaire non trouvé.' });
      }

      if (glossary.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Accès non autorisé.' });
      }

      if (glossary.sourceLanguage !== sourceLanguage || glossary.targetLanguage !== targetLanguage) {
        return res.status(400).json({ message: 'Les langues du glossaire ne correspondent pas.' });
      }

      relevantTerms = extractRelevantTerms(text, glossary.terms);
    }

    // 4) Créer le prompt et appeler l’API de traduction
    const prompt = createPrompt(text, relevantTerms, sourceLanguage, targetLanguage);
    let translatedText;

    switch (model) {
      case 'claude':
        translatedText = await generateClaudeTranslation(prompt);
        break;
      case 'gpt':
        translatedText = await generateOpenAITranslation(prompt);
        break;
      case 'deepseek':
        translatedText = await generateDeepSeekTranslation(prompt);
        break;
      default:  // gemini
        translatedText = await generateTranslation(prompt);
    }

    // 5) Enregistrer la traduction
    const newTranslation = new Translation({
      user: req.user.id,
      sourceLanguage,
      targetLanguage,
      sourceText: text,
      translatedText,
      glossary: glossaryId || null,
      model,
    });
    await newTranslation.save();

    // 6) Mettre à jour l'usage dans la subscription
    const wordsCount = text.trim().split(/\s+/).length; 
    const currentMonth = getCurrentMonthString();

    if (subscription) {
      // Vérifier la validité de currentPeriodEnd
      if (!subscription.currentPeriodEnd || isNaN(new Date(subscription.currentPeriodEnd))) {
        console.warn(`currentPeriodEnd invalid or missing for subscription ${subscription._id}`);
        subscription.daysUntilRenewal = null;
      } else {
        // Calculer les jours restants avant le renouvellement
        const now = new Date();
        const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
        const diffTime = currentPeriodEnd - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        subscription.daysUntilRenewal = diffDays;
      }

      // Initialiser usageThisMonth si nécessaire
      if (!subscription.usageThisMonth) {
        subscription.usageThisMonth = { characters: 0, translations: 0 };
      }

      // Mettre à jour usageHistory pour le mois courant
      const monthEntry = subscription.usageHistory.find(
        (entry) => entry.month === currentMonth
      );

      if (monthEntry) {
        monthEntry.words += wordsCount;
        monthEntry.requests += 1;
      } else {
        // Créer une nouvelle entrée pour ce mois
        subscription.usageHistory.push({
          month: currentMonth,
          words: wordsCount,
          requests: 1,
        });
      }

      // Mettre à jour usageThisMonth
      subscription.usageThisMonth.characters += wordsCount;
      subscription.usageThisMonth.translations += 1;

      // Vérifier si on approche des limites (seuil 80%)
      const CHARACTER_THRESHOLD = 0.8;
      const TRANSLATION_THRESHOLD = 0.8;

      const currentPlanLimits = PLAN_LIMITS[subscription.plan];
      if (!currentPlanLimits) {
        console.warn(`Limits not defined for plan: ${subscription.plan}`);
      }

      const characterUsageRatio = currentPlanLimits
        ? subscription.usageThisMonth.characters / currentPlanLimits.characters
        : 0;
      const translationUsageRatio = currentPlanLimits
        ? subscription.usageThisMonth.translations / currentPlanLimits.translations
        : 0;

      subscription.isApproachingLimit =
        characterUsageRatio >= CHARACTER_THRESHOLD ||
        translationUsageRatio >= TRANSLATION_THRESHOLD;

      await subscription.save();
    }

    // 7) Réponse finale
    return res.status(200).json({ translatedText });
  } catch (error) {
    console.error('Erreur lors de la traduction :', error.message);
    return res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Récupérer les traductions d’un utilisateur
exports.getUserTranslations = async (req, res) => {
  try {
    const translations = await Translation.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(translations);
  } catch (error) {
    console.error('Erreur lors de la récupération des traductions:', error.message);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};
