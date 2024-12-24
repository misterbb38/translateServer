const OpenAI = require('openai');

const generateOpenAITranslation = async (prompt) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content;
};

module.exports = { generateOpenAITranslation };