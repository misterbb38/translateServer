require('dotenv').config();
const OpenAI = require('openai');

/**
 * Exemple de fonction pour générer une traduction (ou un texte)
 * en utilisant la compatibilité DeepSeek (baseURL et clé API DeepSeek).
 */
async function generateDeepSeekTranslation(prompt) {
  try {
    // Récupérer votre clé d’API DeepSeek depuis les variables d’environnement
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    // Initialiser le client OpenAI, mais en spécifiant baseURL = https://api.deepseek.com
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com/v1',  // vous pouvez aussi mettre '/v1'
      apiKey, // DeepSeek API Key
    });

    // Exemple : utiliser le modèle deepseek-chat 
    // (vous pouvez aussi choisir deepseek-reasoner selon vos besoins)
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    // Renvoyer le texte produit par DeepSeek
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API DeepSeek :", error.message);
    throw error;
  }
}

module.exports = { generateDeepSeekTranslation };
