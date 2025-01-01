// // controllers/definitionController.js
// const Definition = require('../models/Definition');
// const { generateOpenAITranslation } = require('../utils/openaiAPI');
// const { generateClaudeTranslation } = require('../utils/claudeAPI');
// const { generateTranslation } = require('../utils/geminiAPI');

// exports.getWordDefinition = async (req, res) => {
//     try {
//       const { word, language, model } = req.body;
  
//       if (!word || !language || !model) {
//         return res.status(400).json({ message: 'Veuillez fournir tous les paramètres requis.' });
//       }
  
//       let definition = await Definition.findOne({ word: word.toLowerCase(), language });
  
//       if (!definition) {
//         const prompt = `Donnez-moi la définition du mot "${word}" en ${language}. Répondez uniquement avec un objet JSON valide au format suivant, sans markdown ni texte supplémentaire: { "definitions": [{ "partOfSpeech": "type de mot", "meaning": "définition", "examples": ["exemple 1", "exemple 2"] }] }`;
  
//         let aiResponse;
//         switch(model) {
//           case 'claude':
//             aiResponse = await generateClaudeTranslation(prompt);
//             break;
//           case 'gpt':
//             aiResponse = await generateOpenAITranslation(prompt);
//             break;
//           default:
//             aiResponse = await generateTranslation(prompt);
//         }
  
//         // Nettoyer la réponse
//         const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
//         const definitionData = JSON.parse(cleanResponse);
  
//         definition = new Definition({
//           word: word.toLowerCase(),
//           language,
//           definitions: definitionData.definitions
//         });
  
//         await definition.save();
//       }
  
//       res.status(200).json(definition);
//       console.log(definition)
//       console.log(req.body)
//     } catch (error) {
//       console.error('Erreur lors de la récupération de la définition:', error);
//       res.status(500).json({ message: 'Erreur du serveur.' });
//     }
//   };



// controllers/definitionController.js
const Definition = require('../models/Definition');
const Subscription = require('../models/Subscription');
const { generateOpenAITranslation } = require('../utils/openaiAPI');
const { generateClaudeTranslation } = require('../utils/claudeAPI');
const { generateTranslation } = require('../utils/geminiAPI');

const PLAN_MODELS = {
  free: ['gemini'],
  starter: ['gemini', 'gpt'],
  pro: ['gemini', 'gpt', 'claude'],
  enterprise: ['gemini', 'gpt', 'claude']
};

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

exports.getWordDefinition = async (req, res) => {
  try {
    const { word, language, model } = req.body;

    if (!word || !language || !model) {
      return res.status(400).json({ message: 'Veuillez fournir tous les paramètres requis.' });
    }

    // Vérifier l'abonnement et les limites
    const subscription = await Subscription.findOne({ 
      user: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(403).json({ message: 'Aucun abonnement actif.' });
    }

    // Vérifier si le modèle est disponible pour ce plan
    if (!PLAN_MODELS[subscription.plan].includes(model)) {
      return res.status(403).json({ 
        message: 'Ce modèle n\'est pas disponible dans votre plan.',
        availableModels: PLAN_MODELS[subscription.plan]
      });
    }

    const planLimits = PLAN_LIMITS[subscription.plan];
    
    // Vérifier les limites de caractères
    if (subscription.plan !== 'enterprise' && 
        subscription.usageThisMonth?.characters >= planLimits.characters) {
      return res.status(429).json({ 
        message: 'Limite de caractères atteinte pour ce mois.',
        usage: subscription.usageThisMonth?.characters || 0,
        limit: planLimits.characters
      });
    }

    let definition = await Definition.findOne({ 
      word: word.toLowerCase(), 
      language 
    });

    if (!definition) {
      const prompt = `Donnez-moi la définition du mot "${word}" en ${language}. Répondez uniquement avec un objet JSON valide au format suivant, sans markdown ni texte supplémentaire: { "definitions": [{ "partOfSpeech": "type de mot", "meaning": "définition", "examples": ["exemple 1", "exemple 2"] }] }`;

      let aiResponse;
      switch(model) {
        case 'claude':
          aiResponse = await generateClaudeTranslation(prompt);
          break;
        case 'gpt':
          aiResponse = await generateOpenAITranslation(prompt);
          break;
        default:
          aiResponse = await generateTranslation(prompt);
      }

      const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
      const definitionData = JSON.parse(cleanResponse);

      definition = new Definition({
        word: word.toLowerCase(),
        language,
        definitions: definitionData.definitions
      });

      await definition.save();

      // Initialiser si nécessaire
      if (!subscription.usageThisMonth) {
        subscription.usageThisMonth = {
          characters: 0,
          translations: 0
        };
      }

      // Mettre à jour l'utilisation
      subscription.usageThisMonth.characters += word.length;
      await subscription.save();
    }

    res.status(200).json({
      definition,
      usage: {
        current: subscription.usageThisMonth?.characters || 0,
        limit: planLimits.characters
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la définition:', error);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};