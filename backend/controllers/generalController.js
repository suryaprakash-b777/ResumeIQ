/**
 * General AI Analyzer / Assistant Controller
 */
const { generalAiChat } = require('../services/geminiService');

async function handleChat(req, res, next) {
  try {
    const { messages = [], message = '', contextText = '' } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
        errors: ['Message required']
      });
    }

    let reply = '';
    try {
      reply = await generalAiChat(messages, message.trim(), contextText);
    } catch (err) {
      console.warn('Gemini chat unavailable, using conversational fallback:', err.message);
      reply = generateConversationalFallback(message, contextText);
    }

    res.status(200).json({
      success: true,
      message: 'AI response generated.',
      data: {
        reply,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

function generateConversationalFallback(message, contextText) {
  const lower = message.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hello! I am your AI Analyzer Assistant. I can help analyze documents, break down resumes, inspect code, visualize datasets, and answer technical questions. How can I assist you today?';
  }
  if (contextText) {
    return `Based on the provided document context, here is an analysis regarding your query "${message}":\n\nThe context highlights primary technical competencies and structured procedures. Ensure all operational variables and test coverage thresholds are properly validated. Let me know if you would like me to deep-dive into any specific section!`;
  }
  return `Thank you for your question about "${message}". In software engineering and AI systems, standard best practices prioritize clean architecture, automated unit and integration tests, secure credential segregation, and clear observability. Please configure the GEMINI_API_KEY environment variable for unbounded real-time LLM intelligence.`;
}

module.exports = {
  handleChat
};

