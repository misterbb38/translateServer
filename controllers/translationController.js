


// const Translation = require('../models/Translation');
// const Glossary = require('../models/Glossary');
// const mongoose = require('mongoose');
// const Subscription = require('../models/Subscription');

// const { generateTranslation } = require('../utils/geminiAPI'); 
// const { generateClaudeTranslation } = require('../utils/claudeAPI');
// const { generateOpenAITranslation } = require('../utils/openaiAPI');
// const { generateDeepSeekTranslation } = require('../utils/deepseekAPI'); // <-- INTÉGRATION DE DEEPSEEK

// // Fonction auxiliaire pour extraire les termes pertinents du glossaire
// function extractRelevantTerms(text, terms) {
//   const relevantTerms = {};
//   const textLower = text.toLowerCase();

//   terms.forEach(term => {
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
//   enterprise: {
//     characters: 5000000,
//     translations: 5000,
//     price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID
//   }
// };

// // Définir quels modèles sont autorisés pour chaque plan
// const PLAN_MODELS = {
//   free:        ['gemini'],
//   starter:     ['gemini', 'gpt', 'deepseek'],
//   pro:         ['gemini', 'gpt', 'claude', 'deepseek'],
//   enterprise:  ['gemini', 'gpt', 'claude', 'deepseek']
// };

// // Helper pour obtenir le mois courant au format "YYYY-MM"
// function getCurrentMonthString() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   return `${year}-${month}`;
// }

// /**
//  * Controller : Traduire du texte et mettre à jour l'usage de l'utilisateur.
//  */
// exports.translateText = async (req, res) => {
//   try {
//     const { text, glossaryId, sourceLanguage, targetLanguage, model } = req.body;

//     // 1) Vérifier les paramètres requis
//     if (!text || !sourceLanguage || !targetLanguage || !model) {
//       return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
//     }

//     // Vérifier que le modèle fait partie des modèles existants
//     // Ajoutez "deepseek" ici
//     if (!['claude', 'gemini', 'gpt', 'deepseek'].includes(model)) {
//       return res.status(400).json({ message: 'Modèle de traduction invalide.' });
//     }

//     // 2) Récupérer la subscription de l’utilisateur
//     const subscription = await Subscription.findOne({
//       user: req.user.id,
//       status: 'active',
//     });
//     if (!subscription) {
//       return res.status(403).json({ message: 'Aucun abonnement actif.' });
//     }

//     // Vérifier si le plan actuel autorise l’utilisation de ce modèle
//     const allowedModels = PLAN_MODELS[subscription.plan];
//     if (!allowedModels || !allowedModels.includes(model)) {
//       return res.status(403).json({
//         message: `Le modèle '${model}' n'est pas disponible dans votre plan.`,
//         availableModels: allowedModels
//       });
//     }

//     // 3) Gérer le glossaire (si glossaryId est présent)
//     let relevantTerms = {};
//     if (glossaryId) {
//       if (!mongoose.Types.ObjectId.isValid(glossaryId)) {
//         return res.status(400).json({ message: 'ID de glossaire invalide.' });
//       }

//       const glossary = await Glossary.findById(glossaryId);
//       if (!glossary) {
//         return res.status(404).json({ message: 'Glossaire non trouvé.' });
//       }

//       if (glossary.user.toString() !== req.user.id) {
//         return res.status(403).json({ message: 'Accès non autorisé.' });
//       }

//       if (glossary.sourceLanguage !== sourceLanguage || glossary.targetLanguage !== targetLanguage) {
//         return res.status(400).json({ message: 'Les langues du glossaire ne correspondent pas.' });
//       }

//       relevantTerms = extractRelevantTerms(text, glossary.terms);
//     }

//     // 4) Créer le prompt et appeler l’API de traduction
//     const prompt = createPrompt(text, relevantTerms, sourceLanguage, targetLanguage);
//     let translatedText;

//     switch (model) {
//       case 'claude':
//         translatedText = await generateClaudeTranslation(prompt);
//         break;
//       case 'gpt':
//         translatedText = await generateOpenAITranslation(prompt);
//         break;
//       case 'deepseek':
//         translatedText = await generateDeepSeekTranslation(prompt);
//         break;
//       default:  // gemini
//         translatedText = await generateTranslation(prompt);
//     }

//     // 5) Enregistrer la traduction
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

//     // 6) Mettre à jour l'usage dans la subscription
//     const wordsCount = text.trim().split(/\s+/).length; 
//     const currentMonth = getCurrentMonthString();

//     if (subscription) {
//       // Vérifier la validité de currentPeriodEnd
//       if (!subscription.currentPeriodEnd || isNaN(new Date(subscription.currentPeriodEnd))) {
//         console.warn(`currentPeriodEnd invalid or missing for subscription ${subscription._id}`);
//         subscription.daysUntilRenewal = null;
//       } else {
//         // Calculer les jours restants avant le renouvellement
//         const now = new Date();
//         const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
//         const diffTime = currentPeriodEnd - now;
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//         subscription.daysUntilRenewal = diffDays;
//       }

//       // Initialiser usageThisMonth si nécessaire
//       if (!subscription.usageThisMonth) {
//         subscription.usageThisMonth = { characters: 0, translations: 0 };
//       }

//       // Mettre à jour usageHistory pour le mois courant
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

//       // Mettre à jour usageThisMonth
//       subscription.usageThisMonth.characters += wordsCount;
//       subscription.usageThisMonth.translations += 1;

//       // Vérifier si on approche des limites (seuil 80%)
//       const CHARACTER_THRESHOLD = 0.8;
//       const TRANSLATION_THRESHOLD = 0.8;

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

//       await subscription.save();
//     }

//     // 7) Réponse finale
//     return res.status(200).json({ translatedText });
//   } catch (error) {
//     console.error('Erreur lors de la traduction :', error.message);
//     return res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };

// // Récupérer les traductions d’un utilisateur
// exports.getUserTranslations = async (req, res) => {
//   try {
//     const translations = await Translation.find({ user: req.user.id }).sort({ createdAt: -1 });
//     res.status(200).json(translations);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des traductions:', error.message);
//     res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };



// controllers/translationController.js
const Translation = require('../models/Translation');
const Glossary = require('../models/Glossary');
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');

const { generateTranslation }        = require('../utils/geminiAPI');
const { generateClaudeTranslation }  = require('../utils/claudeAPI');
const { generateOpenAITranslation }  = require('../utils/openaiAPI');
const { generateDeepSeekTranslation} = require('../utils/deepseekAPI');

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────
const PLAN_LIMITS = {
  free:       { characters: 50000,   translations: 50   },
  starter:    { characters: 300000,  translations: 300  },
  pro:        { characters: 1000000, translations: 1000 },
  enterprise: { characters: 5000000, translations: 5000 }
};

const PLAN_MODELS = {
  free:       ['gemini'],
  starter:    ['gemini', 'gpt', 'deepseek'],
  pro:        ['gemini', 'gpt', 'claude', 'deepseek'],
  enterprise: ['gemini', 'gpt', 'claude', 'deepseek']
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function extractRelevantTerms(text, terms) {
  const relevantTerms = {};
  const textLower = text.toLowerCase();
  terms.forEach(term => {
    if (textLower.includes(term.source.toLowerCase())) {
      relevantTerms[term.source] = term.target;
    }
  });
  return relevantTerms;
}

function createPrompt(text, relevantTerms, sourceLanguage, targetLanguage) {
  let prompt = `Veuillez traduire le texte suivant de ${sourceLanguage} vers ${targetLanguage}`;

  if (Object.keys(relevantTerms).length > 0) {
    prompt += ' en respectant les traductions spécifiques du glossaire fourni.\n\nGlossaire :\n';
    for (const [src, tgt] of Object.entries(relevantTerms)) {
      prompt += `- "${src}" : "${tgt}"\n`;
    }
  } else {
    prompt += '.';
  }

  prompt += `\n\nTexte à traduire :\n"${text}"`;
  return prompt;
}

function getCurrentMonthString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ─────────────────────────────────────────
// TRADUIRE
// ─────────────────────────────────────────
exports.translateText = async (req, res) => {
  try {
    const { text, glossaryId, sourceLanguage, targetLanguage, model } = req.body;

    // 1) Validation des paramètres
    if (!text || !sourceLanguage || !targetLanguage || !model) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
    }

    if (!['claude', 'gemini', 'gpt', 'deepseek'].includes(model)) {
      return res.status(400).json({ message: 'Modèle de traduction invalide.' });
    }

    // 2) Récupérer la subscription
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(403).json({ message: 'Aucun abonnement actif.' });
    }

    // 3) Vérifier que le modèle est autorisé pour ce plan
    const allowedModels = PLAN_MODELS[subscription.plan] || [];
    if (!allowedModels.includes(model)) {
      return res.status(403).json({
        message: `Le modèle '${model}' n'est pas disponible dans votre plan '${subscription.plan}'.`,
        availableModels: allowedModels
      });
    }

    // 4) Vérifier les limites mensuelles
    const planLimits = PLAN_LIMITS[subscription.plan];
    const usage = subscription.usageThisMonth || { characters: 0, translations: 0 };

    if (planLimits) {
      if (usage.characters + text.length > planLimits.characters) {
        return res.status(403).json({ message: 'Limite mensuelle de caractères atteinte.' });
      }
      if (usage.translations >= planLimits.translations) {
        return res.status(403).json({ message: 'Limite mensuelle de traductions atteinte.' });
      }
    }

    // 5) Gérer le glossaire (optionnel)
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
        return res.status(403).json({ message: 'Accès non autorisé au glossaire.' });
      }
      if (glossary.sourceLanguage !== sourceLanguage || glossary.targetLanguage !== targetLanguage) {
        return res.status(400).json({ message: 'Les langues du glossaire ne correspondent pas.' });
      }
      relevantTerms = extractRelevantTerms(text, glossary.terms);
    }

    // 6) Appeler l'API de traduction
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
      default: // gemini
        translatedText = await generateTranslation(prompt);
    }

    // 7) Enregistrer la traduction
    const newTranslation = new Translation({
      user: req.user.id,
      sourceLanguage,
      targetLanguage,
      sourceText: text,
      translatedText,
      glossary: glossaryId || null,
      model
    });
    await newTranslation.save();

    // 8) Mettre à jour l'usage
    const currentMonth = getCurrentMonthString();

    // ✅ Fix : initialiser usageHistory si absent
    if (!subscription.usageHistory) {
      subscription.usageHistory = [];
    }

    // ✅ Fix : initialiser usageThisMonth si absent
    if (!subscription.usageThisMonth) {
      subscription.usageThisMonth = { characters: 0, translations: 0 };
    }

    // Mettre à jour usageHistory
    const monthEntry = subscription.usageHistory.find(e => e.month === currentMonth);
    if (monthEntry) {
      monthEntry.words    += text.trim().split(/\s+/).length;
      monthEntry.requests += 1;
    } else {
      subscription.usageHistory.push({
        month:    currentMonth,
        words:    text.trim().split(/\s+/).length,
        requests: 1
      });
    }

    // Mettre à jour usageThisMonth (en caractères)
    subscription.usageThisMonth.characters   += text.length; // ✅ Fix : était wordsCount, doit être caractères
    subscription.usageThisMonth.translations += 1;

    // Calculer daysUntilRenewal
    if (subscription.currentPeriodEnd && !isNaN(new Date(subscription.currentPeriodEnd))) {
      const diffTime = new Date(subscription.currentPeriodEnd) - new Date();
      subscription.daysUntilRenewal = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Vérifier si on approche des limites (seuil 80%)
    if (planLimits) {
      const charRatio  = subscription.usageThisMonth.characters   / planLimits.characters;
      const transRatio = subscription.usageThisMonth.translations / planLimits.translations;
      subscription.isApproachingLimit = charRatio >= 0.8 || transRatio >= 0.8;
    }

    await subscription.save();

    // 9) Réponse
    return res.status(200).json({ translatedText });

  } catch (error) {
    // ✅ Fix : log complet pour debug
    console.error('Erreur lors de la traduction :', error);
    return res.status(500).json({
      message: 'Erreur du serveur.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ─────────────────────────────────────────
// HISTORIQUE
// ─────────────────────────────────────────
exports.getUserTranslations = async (req, res) => {
  try {
    const translations = await Translation.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(translations);
  } catch (error) {
    console.error('Erreur récupération traductions :', error.message);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};