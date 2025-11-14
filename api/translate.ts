import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Initialize OpenRouter client for translation using Claude Haiku 3
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'https://captur.academy',
    'X-Title': 'Daily Notes Writer',
  }
});

const handler = async (
  req: VercelRequest,
  res: VercelResponse
) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const { content, targetLanguage, model } = req.body;

    console.log('🌐 [TRANSLATE API] Received request');
    console.log('📝 [TRANSLATE API] Content length:', content?.length);
    console.log('🗣️ [TRANSLATE API] Target language code:', targetLanguage);
    console.log('🤖 [TRANSLATE API] Model:', model);

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: content is required and must be a string'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        error: 'Content cannot be empty'
      });
    }

    const languageMap: Record<string, string> = {
      'zh-CN': 'Simplified Chinese',
      'zh-TW': 'Traditional Chinese',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'ja': 'Japanese',
      'ko': 'Korean',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'it': 'Italian',
      'nl': 'Dutch',
      'pl': 'Polish',
      'tr': 'Turkish',
      'vi': 'Vietnamese',
      'th': 'Thai',
      'id': 'Indonesian',
    };

    const targetLang = languageMap[targetLanguage] || 'Simplified Chinese';

    // Use GLM-4.5 Air for Chinese translations, Claude 3 Haiku for all other languages
    const isChineseTranslation = targetLanguage === 'zh-CN' || targetLanguage === 'zh-TW';
    const defaultModel = isChineseTranslation ? 'z-ai/glm-4.5-air' : 'anthropic/claude-3-haiku';
    const translationModel = model || defaultModel;

    console.log('✅ [TRANSLATE API] Mapped language:', targetLang);
    console.log('✅ [TRANSLATE API] Is Chinese translation:', isChineseTranslation);
    console.log('✅ [TRANSLATE API] Default model selected:', defaultModel);
    console.log('✅ [TRANSLATE API] Using model:', translationModel);

    // Call OpenRouter with selected model for translation
    const completion = await openai.chat.completions.create({
      model: translationModel,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Return the original text with ${targetLang} translations added inline for ONLY 1-3 key complex words/phrases.

CRITICAL RULES:
- Return the EXACT original text, word-for-word
- Add ${targetLang} translation ONLY immediately after the 1-3 difficult words/phrases you select
- Use EXACTLY this format: word (translation) or phrase (translation)
- Put the ${targetLang} translation inside parentheses immediately after the English word
- Do NOT add any extra words, explanations, or modifications
- Do NOT translate the entire sentence
- Select only the MOST difficult or important vocabulary (1-3 words/phrases maximum)
- YOU MUST add at least 1 translation - do not return the text unchanged

Example for Simplified Chinese:
Input: "Insiders say Warner's studio and streaming assets have also attracted interest from multiple parties."
Output: "Insiders say Warner's studio and streaming assets (流媒体资产) have also attracted interest from multiple parties."

Example for Spanish:
Input: "The airline will cancel more flights to ensure efficiency."
Output: "The airline will cancel more flights (vuelos) to ensure efficiency."

Example for French:
Input: "The government announced new regulations for businesses."
Output: "The government (gouvernement) announced new regulations for businesses."`
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.3,
    });

    const translated = completion.choices[0]?.message?.content?.trim() || '';

    if (!translated) {
      throw new Error('No translation returned from model');
    }

    console.log('✅ [TRANSLATE API] Translation completed');
    console.log('📄 [TRANSLATE API] Result preview:', translated.substring(0, 100) + '...');

    // Return only translation (no audio)
    res.status(200).json({
      translated
    });
  } catch (error) {
    console.error('Translate endpoint error:', error);

    // Return appropriate error message
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      error: errorMessage,
      message: 'Failed to process translation request'
    });
  }
};

export default handler;
