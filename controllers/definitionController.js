
// const Definition = require('../models/Definition');
// const Subscription = require('../models/Subscription');
// const { generateOpenAITranslation } = require('../utils/openaiAPI');
// const { generateClaudeTranslation } = require('../utils/claudeAPI');
// const { generateTranslation } = require('../utils/geminiAPI');
// const { generateDeepSeekTranslation } = require('../utils/deepseekAPI');

// const PLAN_MODELS = {
//   free: ['gemini'],
//   starter:     ['gemini', 'gpt', 'deepseek'],
//   pro:         ['gemini', 'gpt', 'claude', 'deepseek'],
//   enterprise:  ['gemini', 'gpt', 'claude', 'deepseek']
// };

// const PLAN_LIMITS = {
//   free: {
//     characters: 50000,
//     translations: 50
//   },
//   starter: {
//     characters: 300000,
//     translations: 300
//   },
//   pro: {
//     characters: 1000000,
//     translations: 1000
//   },
//   enterprise: {
//     characters: Infinity,
//     translations: Infinity
//   }
// };

// exports.getWordDefinition = async (req, res) => {
//   try {
//     const { word, language, model } = req.body;

//     if (!word || !language || !model) {
//       return res.status(400).json({ message: 'Veuillez fournir tous les paramètres requis.' });
//     }

//     // Vérifier l'abonnement et les limites
//     const subscription = await Subscription.findOne({ 
//       user: req.user.id,
//       status: 'active'
//     });

//     if (!subscription) {
//       return res.status(403).json({ message: 'Aucun abonnement actif.' });
//     }

//     // Vérifier si le modèle est disponible pour ce plan
//     if (!PLAN_MODELS[subscription.plan].includes(model)) {
//       return res.status(403).json({ 
//         message: 'Ce modèle n\'est pas disponible dans votre plan.',
//         availableModels: PLAN_MODELS[subscription.plan]
//       });
//     }

//     const planLimits = PLAN_LIMITS[subscription.plan];
    
//     // Vérifier les limites de caractères
//     if (subscription.plan !== 'enterprise' && 
//         subscription.usageThisMonth?.characters >= planLimits.characters) {
//       return res.status(429).json({ 
//         message: 'Limite de caractères atteinte pour ce mois.',
//         usage: subscription.usageThisMonth?.characters || 0,
//         limit: planLimits.characters
//       });
//     }

//     let definition = await Definition.findOne({ 
//       word: word.toLowerCase(), 
//       language 
//     });

//     if (!definition) {
//       const prompt = `Donnez-moi la définition du mot "${word}" en ${language}. Répondez uniquement avec un objet JSON valide au format suivant, sans markdown ni texte supplémentaire: { "definitions": [{ "partOfSpeech": "type de mot", "meaning": "définition", "examples": ["exemple 1", "exemple 2"] }] }`;

//       let aiResponse;
//       switch(model) {
//         case 'claude':
//           aiResponse = await generateClaudeTranslation(prompt);
//           break;
//         case 'gpt':
//           aiResponse = await generateOpenAITranslation(prompt);
//           break;
//         default:
//           aiResponse = await generateTranslation(prompt);
//       }

//       const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
//       const definitionData = JSON.parse(cleanResponse);

//       definition = new Definition({
//         word: word.toLowerCase(),
//         language,
//         definitions: definitionData.definitions
//       });

//       await definition.save();

//       // Initialiser si nécessaire
//       if (!subscription.usageThisMonth) {
//         subscription.usageThisMonth = {
//           characters: 0,
//           translations: 0
//         };
//       }

//       // Mettre à jour l'utilisation
//       subscription.usageThisMonth.characters += word.length;
//       await subscription.save();
//     }

//     res.status(200).json({
//       definition,
//       usage: {
//         current: subscription.usageThisMonth?.characters || 0,
//         limit: planLimits.characters
//       }
//     });
//   } catch (error) {
//     console.error('Erreur lors de la récupération de la définition:', error);
//     res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };



const Definition = require('../models/Definition');
const Subscription = require('../models/Subscription');

const { generateOpenAITranslation } = require('../utils/openaiAPI');
const { generateClaudeTranslation } = require('../utils/claudeAPI');
const { generateTranslation } = require('../utils/geminiAPI');
const { generateDeepSeekTranslation } = require('../utils/deepseekAPI'); // <-- Import DeepSeek

// Liste des modèles autorisés par plan
const PLAN_MODELS = {
  free:        ['gemini'],
  starter:     ['gemini', 'gpt', 'deepseek'],
  pro:         ['gemini', 'gpt', 'claude', 'deepseek'],
  enterprise:  ['gemini', 'gpt', 'claude', 'deepseek']
};

// Limites de chaque plan (caractères/traductions)
const PLAN_LIMITS = {
  free: {
    characters: 50000,
    translations: 50
  },
  starter: {
    characters: 300000,
    translations: 300
  },
  pro: {
    characters: 1000000,
    translations: 1000
  },
  enterprise: {
    characters: Infinity,
    translations: Infinity
  }
};

/**
 * Controller : Récupérer la définition d’un mot.
 */
exports.getWordDefinition = async (req, res) => {
  try {
    const { word, language, model } = req.body;

    // 1) Vérifier les paramètres d’entrée
    if (!word || !language || !model) {
      return res.status(400).json({ message: 'Veuillez fournir tous les paramètres requis.' });
    }

    // 2) Vérifier la subscription et le plan de l’utilisateur
    const subscription = await Subscription.findOne({ 
      user: req.user.id,
      status: 'active'
    });
    if (!subscription) {
      return res.status(403).json({ message: 'Aucun abonnement actif.' });
    }

    // Vérifier si le modèle est autorisé pour ce plan
    if (!PLAN_MODELS[subscription.plan].includes(model)) {
      return res.status(403).json({ 
        message: `Le modèle '${model}' n'est pas disponible dans votre plan.`,
        availableModels: PLAN_MODELS[subscription.plan]
      });
    }

    // 3) Vérifier les limites de caractères (sauf plan enterprise = illimité)
    const planLimits = PLAN_LIMITS[subscription.plan];
    if (
      subscription.plan !== 'enterprise' &&
      subscription.usageThisMonth?.characters >= planLimits.characters
    ) {
      return res.status(429).json({
        message: 'Limite de caractères atteinte pour ce mois.',
        usage: subscription.usageThisMonth?.characters || 0,
        limit: planLimits.characters
      });
    }

    // 4) Chercher une définition déjà existante en BDD
    let definition = await Definition.findOne({
      word: word.toLowerCase(),
      language
    });

    // 5) Si on n’a pas encore de définition, on appelle l’IA pour la générer
    if (!definition) {
      const prompt = `Donnez-moi la définition du mot "${word}" en ${language}. Répondez uniquement avec un objet JSON valide au format suivant, sans markdown ni texte supplémentaire: { "definitions": [{ "partOfSpeech": "type de mot", "meaning": "définition", "examples": ["exemple 1", "exemple 2"] }] }`;

      let aiResponse;
      switch (model) {
        case 'claude':
          aiResponse = await generateClaudeTranslation(prompt);
          break;
        case 'gpt':
          aiResponse = await generateOpenAITranslation(prompt);
          break;
        case 'deepseek': // <-- Intégration de DeepSeek
          aiResponse = await generateDeepSeekTranslation(prompt);
          break;
        default: // 'gemini'
          aiResponse = await generateTranslation(prompt);
      }

      // Nettoyer la réponse pour enlever les éventuels "```json" ou "```"
      const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
      const definitionData = JSON.parse(cleanResponse);

      // Enregistrer la nouvelle définition
      definition = new Definition({
        word: word.toLowerCase(),
        language,
        definitions: definitionData.definitions
      });
      await definition.save();

      // 6) Mettre à jour l’utilisation de l’utilisateur
      if (!subscription.usageThisMonth) {
        subscription.usageThisMonth = { characters: 0, translations: 0 };
      }

      subscription.usageThisMonth.characters += word.length;
      await subscription.save();
    }

    // 7) Répondre avec la définition
    return res.status(200).json({
      definition,
      usage: {
        current: subscription.usageThisMonth?.characters || 0,
        limit: planLimits.characters
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la définition:', error);
    return res.status(500).json({ message: 'Erreur du serveur.' });
  }
};
