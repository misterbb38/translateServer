

const Translation = require('../models/Translation');
const Glossary = require('../models/Glossary');
const mongoose = require('mongoose');
const { generateTranslation } = require('../utils/geminiAPI'); // Importer la fonction depuis geminiAPI.js
const { generateClaudeTranslation } = require('../utils/claudeAPI');
const { generateOpenAITranslation } = require('../utils/openaiAPI');

// Fonction auxiliaire pour extraire les termes pertinents du glossaire
function extractRelevantTerms(text, terms) {
  const relevantTerms = {};

  // Convertir le texte en minuscules pour une correspondance insensible à la casse
  const textLower = text.toLowerCase();

  terms.forEach(term => {
    // term.source est le terme dans la langue source
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

// Fonction pour traduire le texte

// exports.translateText = async (req, res) => {
//   try {
//     const { text, glossaryId, sourceLanguage, targetLanguage, model } = req.body;

//     if (!text || !sourceLanguage || !targetLanguage || !model) {
//       return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
//     }

//     if (!['claude', 'gemini'].includes(model)) {
//       return res.status(400).json({ message: 'Modèle de traduction invalide.' });
//     }

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

//     const prompt = createPrompt(text, relevantTerms, sourceLanguage, targetLanguage);
    
//     let translatedText;
//     if (model === 'claude') {
//       translatedText = await generateClaudeTranslation(prompt);
//     } else {
//       translatedText = await generateTranslation(prompt);
//     }

//     const newTranslation = new Translation({
//       user: req.user.id,
//       sourceLanguage,
//       targetLanguage,
//       sourceText: text,
//       translatedText,
//       glossary: glossaryId || null,
//       model
//     });

//     await newTranslation.save();
//     res.status(200).json({ translatedText });
    
//   } catch (error) {
//     console.error('Erreur lors de la traduction:', error.message);
//     res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };


exports.translateText = async (req, res) => {
  try {
    const { text, glossaryId, sourceLanguage, targetLanguage, model } = req.body;

    if (!text || !sourceLanguage || !targetLanguage || !model) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
    }

    if (!['claude', 'gemini', 'gpt'].includes(model)) {
      return res.status(400).json({ message: 'Modèle de traduction invalide.' });
    }

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

    const prompt = createPrompt(text, relevantTerms, sourceLanguage, targetLanguage);
    
    let translatedText;
    switch(model) {
      case 'claude':
        translatedText = await generateClaudeTranslation(prompt);
        break;
      case 'gpt':
        translatedText = await generateOpenAITranslation(prompt);
        break;
      default:
        translatedText = await generateTranslation(prompt);
    }

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
    res.status(200).json({ translatedText });
    
  } catch (error) {
    console.error('Erreur lors de la traduction:', error.message);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Fonction pour récupérer les traductions de l'utilisateur
exports.getUserTranslations = async (req, res) => {
  try {
    const translations = await Translation.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(translations);
  } catch (error) {
    console.error('Erreur lors de la récupération des traductions:', error.message);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};