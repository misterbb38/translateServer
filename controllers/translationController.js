// // // // controllers/translationController.js

// // // const { GoogleGenerativeAI } = require("@google/generative-ai");
// // // const Translation = require('../models/Translation');
// // // const Glossary = require('../models/Glossary');
// // // const mongoose = require('mongoose');

// // // // Charger la clé API depuis les variables d'environnement
// // // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // // // Fonction pour traduire le texte
// // // exports.translateText = async (req, res) => {
// // //   try {
// // //     const { text, glossaryId, sourceLanguage, targetLanguage } = req.body;

// // //     // Validation des entrées
// // //     if (!text || !glossaryId || !sourceLanguage || !targetLanguage) {
// // //       return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
// // //     }

// // //     // Vérifier que l'ID du glossaire est valide
// // //     if (!mongoose.Types.ObjectId.isValid(glossaryId)) {
// // //       return res.status(400).json({ message: 'ID de glossaire invalide.' });
// // //     }

// // //     // Récupérer le glossaire sélectionné
// // //     const glossary = await Glossary.findById(glossaryId);

// // //     if (!glossary) {
// // //       return res.status(404).json({ message: 'Glossaire non trouvé.' });
// // //     }

// // //     // Vérifier si l'utilisateur est le propriétaire du glossaire
// // //     if (glossary.user.toString() !== req.user.id) {
// // //       return res.status(403).json({ message: 'Accès non autorisé.' });
// // //     }

// // //     // Extraire les termes pertinents du glossaire
// // //     const relevantTerms = extractRelevantTerms(text, glossary.terms);

// // //     // Préparer le prompt pour l'API
// // //     const prompt = createPrompt(text, relevantTerms, sourceLanguage, targetLanguage);

// // //     // Initialiser le modèle
// // //     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// // //     // Appeler l'API pour générer le contenu
// // //     const result = await model.generateContent(prompt);
// // //     const response = await result.response;
// // //     const translatedText = response.text();

// // //     // Optionnel : Enregistrer la traduction en base de données
// // //     const newTranslation = new Translation({
// // //       user: req.user.id,
// // //       sourceText: text,
// // //       translatedText: translatedText,
// // //       glossary: glossaryId,
// // //     });

// // //     await newTranslation.save();

// // //     // Renvoyer la traduction à l'utilisateur
// // //     res.status(200).json({ translatedText });
// // //   } catch (error) {
// // //     console.error('Erreur lors de la traduction:', error.message);
// // //     res.status(500).json({ message: 'Erreur du serveur.' });
// // //   }
// // // };

// // // // Fonction auxiliaire pour extraire les termes pertinents du glossaire
// // // function extractRelevantTerms(text, terms) {
// // //   const relevantTerms = {};

// // //   // Convertir le texte en minuscules pour une correspondance insensible à la casse
// // //   const textLower = text.toLowerCase();

// // //   terms.forEach(term => {
// // //     // term.source est le terme dans la langue source
// // //     const termSource = term.source.toLowerCase();
// // //     if (textLower.includes(termSource)) {
// // //       relevantTerms[term.source] = term.target;
// // //     }
// // //   });

// // //   return relevantTerms;
// // // }

// // // // Fonction auxiliaire pour créer le prompt pour l'API
// // // function createPrompt(text, relevantTerms, sourceLanguage, targetLanguage) {
// // //   let glossaryText = 'Glossaire :\n';
// // //   for (let [termSource, termTarget] of Object.entries(relevantTerms)) {
// // //     glossaryText += `- "${termSource}" : "${termTarget}"\n`;
// // //   }

// // //   const prompt = `Veuillez traduire le texte suivant de ${sourceLanguage} vers ${targetLanguage} en respectant les traductions spécifiques du glossaire fourni.

// // // ${glossaryText}

// // // Texte à traduire :
// // // "${text}"`;

// // //   return prompt;
// // // }


// // // controllers/translationController.js

// // const Translation = require('../models/Translation');
// // const Glossary = require('../models/Glossary');
// // const mongoose = require('mongoose');
// // const { generateTranslation } = require('../utils/geminiAPI'); // Importer la fonction depuis geminiAPI.js

// // // Fonction pour traduire le texte
// // exports.translateText = async (req, res) => {
// //   try {
// //     const { text, glossaryId, sourceLanguage, targetLanguage } = req.body;

// //     // Validation des entrées
// //     if (!text || !glossaryId || !sourceLanguage || !targetLanguage) {
// //       return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
// //     }

// //     // Vérifier que l'ID du glossaire est valide
// //     if (!mongoose.Types.ObjectId.isValid(glossaryId)) {
// //       return res.status(400).json({ message: 'ID de glossaire invalide.' });
// //     }

// //     // Récupérer le glossaire sélectionné
// //     const glossary = await Glossary.findById(glossaryId);

// //     if (!glossary) {
// //       return res.status(404).json({ message: 'Glossaire non trouvé.' });
// //     }

// //     // Vérifier si l'utilisateur est le propriétaire du glossaire
// //     if (glossary.user.toString() !== req.user.id) {
// //       return res.status(403).json({ message: 'Accès non autorisé.' });
// //     }

// //     // Vérifier que les langues du glossaire correspondent aux langues demandées
// //     if (
// //       glossary.sourceLanguage !== sourceLanguage ||
// //       glossary.targetLanguage !== targetLanguage
// //     ) {
// //       return res.status(400).json({ message: 'Les langues du glossaire ne correspondent pas aux langues sélectionnées.' });
// //     }

// //     // Extraire les termes pertinents du glossaire
// //     const relevantTerms = extractRelevantTerms(text, glossary.terms);

// //     // Préparer le prompt pour l'API
// //     const prompt = createPrompt(text, relevantTerms, sourceLanguage, targetLanguage);

// //     // Appeler la fonction pour générer la traduction
// //     const translatedText = await generateTranslation(prompt);

// //     // Optionnel : Enregistrer la traduction en base de données
// //     const newTranslation = new Translation({
// //       user: req.user.id,
// //       sourceLanguage,
// //       targetLanguage,
// //       sourceText: text,
// //       translatedText: translatedText,
// //       glossary: glossaryId,
// //     });

// //     await newTranslation.save();

// //     // Renvoyer la traduction à l'utilisateur
// //     res.status(200).json({ translatedText });
// //   } catch (error) {
// //     console.error('Erreur lors de la traduction:', error.message);
// //     res.status(500).json({ message: 'Erreur du serveur.' });
// //   }
// // };

// // // Fonction auxiliaire pour extraire les termes pertinents du glossaire
// // function extractRelevantTerms(text, terms) {
// //   const relevantTerms = {};

// //   // Convertir le texte en minuscules pour une correspondance insensible à la casse
// //   const textLower = text.toLowerCase();

// //   terms.forEach(term => {
// //     // term.source est le terme dans la langue source
// //     const termSource = term.source.toLowerCase();
// //     if (textLower.includes(termSource)) {
// //       relevantTerms[term.source] = term.target;
// //     }
// //   });

// //   return relevantTerms;
// // }

// // // Fonction auxiliaire pour créer le prompt pour l'API
// // // function createPrompt(text, relevantTerms, sourceLanguage, targetLanguage) {
// // //   let glossaryText = 'Glossaire :\n';
// // //   for (let [termSource, termTarget] of Object.entries(relevantTerms)) {
// // //     glossaryText += `- "${termSource}" : "${termTarget}"\n`;
// // //   }

// // //   const prompt = `Veuillez traduire le texte suivant de ${sourceLanguage} vers ${targetLanguage} en respectant les traductions spécifiques du glossaire fourni.

// // // ${glossaryText}

// // // Texte à traduire :
// // // "${text}"`;

// // //   return prompt;
// // // }

// // function createPrompt(text, relevantTerms, sourceLanguage, targetLanguage) {
// //   let prompt = `Veuillez traduire le texte suivant de ${sourceLanguage} vers ${targetLanguage}`;

// //   if (Object.keys(relevantTerms).length > 0) {
// //     let glossaryText = ' en respectant les traductions spécifiques du glossaire fourni.\n\nGlossaire :\n';
// //     for (let [termSource, termTarget] of Object.entries(relevantTerms)) {
// //       glossaryText += `- "${termSource}" : "${termTarget}"\n`;
// //     }
// //     prompt += glossaryText;
// //   } else {
// //     prompt += '.';
// //   }

// //   prompt += `\n\nTexte à traduire :\n"${text}"`;

// //   return prompt;
// // }


// // controllers/translationController.js

// const Translation = require('../models/Translation');
// const Glossary = require('../models/Glossary');
// const mongoose = require('mongoose');
// const { generateTranslation } = require('../utils/geminiAPI');

// exports.translateText = async (req, res) => {
//   try {
//     const { text, glossaryId, sourceLanguage, targetLanguage } = req.body;

//     if (!text || !sourceLanguage || !targetLanguage) {
//       return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
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

//       if (
//         glossary.sourceLanguage !== sourceLanguage ||
//         glossary.targetLanguage !== targetLanguage
//       ) {
//         return res.status(400).json({ message: 'Les langues du glossaire ne correspondent pas aux langues sélectionnées.' });
//       }

//       relevantTerms = extractRelevantTerms(text, glossary.terms);
//     }

//     const prompt = createPrompt(text, relevantTerms, sourceLanguage, targetLanguage);

//     const translatedText = await generateTranslation(prompt);

//     const newTranslation = new Translation({
//       user: req.user.id,
//       sourceLanguage,
//       targetLanguage,
//       sourceText: text,
//       translatedText: translatedText,
//       glossary: glossaryId || null,
//     });

//     await newTranslation.save();

//     res.status(200).json({ translatedText });
//   } catch (error) {
//     console.error('Erreur lors de la traduction:', error.message);
//     res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };
// function createPrompt(text, relevantTerms, sourceLanguage, targetLanguage) {
//     let prompt = `Veuillez traduire le texte suivant de ${sourceLanguage} vers ${targetLanguage}`;
  
//     if (Object.keys(relevantTerms).length > 0) {
//       let glossaryText = ' en respectant les traductions spécifiques du glossaire fourni.\n\nGlossaire :\n';
//       for (let [termSource, termTarget] of Object.entries(relevantTerms)) {
//         glossaryText += `- "${termSource}" : "${termTarget}"\n`;
//       }
//       prompt += glossaryText;
//     } else {
//       prompt += '.';
//     }
  
//     prompt += `\n\nTexte à traduire :\n"${text}"`;
  
//     return prompt;
//   }
  


// controllers/translationController.js

const Translation = require('../models/Translation');
const Glossary = require('../models/Glossary');
const mongoose = require('mongoose');
const { generateTranslation } = require('../utils/geminiAPI'); // Importer la fonction depuis geminiAPI.js

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
exports.translateText = async (req, res) => {
  try {
    const { text, glossaryId, sourceLanguage, targetLanguage } = req.body;

    // Validation des entrées
    if (!text || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
    }

    let relevantTerms = {};

    if (glossaryId) {
      // Vérifier que l'ID du glossaire est valide
      if (!mongoose.Types.ObjectId.isValid(glossaryId)) {
        return res.status(400).json({ message: 'ID de glossaire invalide.' });
      }

      // Récupérer le glossaire sélectionné
      const glossary = await Glossary.findById(glossaryId);

      if (!glossary) {
        return res.status(404).json({ message: 'Glossaire non trouvé.' });
      }

      // Vérifier si l'utilisateur est le propriétaire du glossaire
      if (glossary.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Accès non autorisé.' });
      }

      // Vérifier que les langues du glossaire correspondent aux langues demandées
      if (
        glossary.sourceLanguage !== sourceLanguage ||
        glossary.targetLanguage !== targetLanguage
      ) {
        return res.status(400).json({ message: 'Les langues du glossaire ne correspondent pas aux langues sélectionnées.' });
      }

      // Extraire les termes pertinents du glossaire
      relevantTerms = extractRelevantTerms(text, glossary.terms);
    }

    // Préparer le prompt pour l'API
    const prompt = createPrompt(text, relevantTerms, sourceLanguage, targetLanguage);

    // Appeler la fonction pour générer la traduction
    const translatedText = await generateTranslation(prompt);

    // Enregistrer la traduction en base de données
    const newTranslation = new Translation({
      user: req.user.id,
      sourceLanguage,
      targetLanguage,
      sourceText: text,
      translatedText: translatedText,
      glossary: glossaryId || null,
    });

    await newTranslation.save();

    // Renvoyer la traduction à l'utilisateur
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