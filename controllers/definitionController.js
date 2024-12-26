// controllers/definitionController.js
const Definition = require('../models/Definition');
const { generateOpenAITranslation } = require('../utils/openaiAPI');
const { generateClaudeTranslation } = require('../utils/claudeAPI');
const { generateTranslation } = require('../utils/geminiAPI');

exports.getWordDefinition = async (req, res) => {
    try {
      const { word, language, model } = req.body;
  
      if (!word || !language || !model) {
        return res.status(400).json({ message: 'Veuillez fournir tous les paramètres requis.' });
      }
  
      let definition = await Definition.findOne({ word: word.toLowerCase(), language });
  
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
  
        // Nettoyer la réponse
        const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
        const definitionData = JSON.parse(cleanResponse);
  
        definition = new Definition({
          word: word.toLowerCase(),
          language,
          definitions: definitionData.definitions
        });
  
        await definition.save();
      }
  
      res.status(200).json(definition);
    } catch (error) {
      console.error('Erreur lors de la récupération de la définition:', error);
      res.status(500).json({ message: 'Erreur du serveur.' });
    }
  };