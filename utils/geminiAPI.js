// utils/geminiAPI.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Charger la clé API depuis les variables d'environnement
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fonction pour générer du contenu à partir d'un prompt
async function generateTranslation(prompt, options = {}) {
  try {
    // Vous pouvez permettre de passer le modèle en option
    const modelName = options.model || "gemini-1.5-flash";

    // Initialiser le modèle
    const model = genAI.getGenerativeModel({ model: modelName });

    // Vous pouvez également passer des configurations de génération
    const generationConfig = options.generationConfig || {};

    // Appeler l'API pour générer le contenu
    const result = await model.generateContent(prompt, { generationConfig });
    const response = await result.response;
    const translatedText = response.text();
    console.log(prompt)
    console.log(translatedText)

    return translatedText;
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API Gemini:', error.message);
    throw error;
  }
}

module.exports = {
  generateTranslation,
};
