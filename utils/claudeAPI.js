

// const Anthropic = require('@anthropic-ai/sdk');

// const generateClaudeTranslation = async (prompt) => {
//   const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  
//   const response = await client.messages.create({
//     model: "claude-3-sonnet-20240229",
//     max_tokens: 1000,
//     messages: [{ role: "user", content: prompt }]
//   });

//   return response.content[0].text;
// };

// module.exports = { generateClaudeTranslation };

const Anthropic = require('@anthropic-ai/sdk');

const generateClaudeTranslation = async (prompt) => {
  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // rapide et économique pour traductions
    // model: "claude-sonnet-4-5",       // meilleure qualité si besoin
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }]
  });

  return response.content[0].text;
};

module.exports = { generateClaudeTranslation };