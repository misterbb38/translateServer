// // utils/geminiAPI.js
// require('dotenv').config();
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// // Charger la clé API depuis les variables d'environnement
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Fonction pour générer du contenu à partir d'un prompt
// async function generateTranslation(prompt, options = {}) {
//   try {
//     // Vous pouvez permettre de passer le modèle en option
//     const modelName = options.model || "gemini-1.5-flash";

//     // Initialiser le modèle
//     const model = genAI.getGenerativeModel({ model: modelName });

//     // Vous pouvez également passer des configurations de génération
//     const generationConfig = options.generationConfig || {};

//     // Appeler l'API pour générer le contenu
//     const result = await model.generateContent(prompt, { generationConfig });
//     const response = await result.response;
//     const translatedText = response.text();
//     console.log(prompt)
//     console.log(translatedText)

//     return translatedText;
//   } catch (error) {
//     console.error('Erreur lors de l\'appel à l\'API Gemini:', error.message);
//     throw error;
//   }
// }

// module.exports = {
//   generateTranslation,
// };



require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateTranslation(prompt, options = {}) {
  try {
    const modelName = options.model || "gemini-2.5-flash"; // ✅ stable, recommandé production
    // alternatives :
    // "gemini-3-flash-preview"       → le plus récent, preview (gratuit sur AI Studio)
    // "gemini-3.1-flash-lite-preview" → le plus économique, preview
    // "gemini-3.1-pro-preview"        → le plus puissant (payant uniquement)

    const model = genAI.getGenerativeModel({ model: modelName });
    const generationConfig = options.generationConfig || {};

    const result = await model.generateContent(prompt, { generationConfig });
    const response = await result.response;
    const translatedText = response.text();

    console.log(prompt);
    console.log(translatedText);

    return translatedText;
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API Gemini :", error.message);
    throw error;
  }
}

module.exports = { generateTranslation };