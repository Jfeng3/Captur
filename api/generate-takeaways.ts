import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Initialize OpenRouter client
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'https://captur.academy',
    'X-Title': 'Daily Notes Writer',
  }
});

// Map of language codes to their full names
const LANGUAGE_NAMES: Record<string, string> = {
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, pageType = 'article', targetLanguage = 'zh-CN' } = req.body;
    const languageName = LANGUAGE_NAMES[targetLanguage] || 'Chinese (Simplified)';

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Limit content length to avoid excessive token usage
    const limitedContent = content.slice(0, 10000);

    // Different system prompts based on page type
    let systemPrompt: string;
    let userPrompt: string;

    if (pageType === 'x_post') {
      // X/Twitter post - analyze post content and reader reactions
      systemPrompt = `You summarize X posts like you're telling a friend what you just read—casual, simple, conversational.

IMPORTANT: For each takeaway, identify 2-4 words that would be difficult for a high school student and add ${languageName} translations in parentheses immediately after those words.

Extract 3 takeaways in this order:
1. What the author is saying (1-2 sentences, simple words, like you're telling a friend)
2. What most-liked replies say (1-2 sentences, casual tone)
3. What other people think (1-2 sentences, conversational)

Writing style:
- Use simple, everyday words—avoid formal or academic language
- Write like you're talking to a friend: "They think...", "People are saying...", "Basically..."
- NO labels or prefixes like "Writer's Message:", "Top Reactions:", "Other Reactions:"—go straight to the opinion
- Keep it short: 1-2 sentences per section
- Add ${languageName} translation after difficult words in parentheses

Example of conversational tone:
GOOD: "They think AI will replace (替代) most jobs in 5 years, especially (尤其) creative work."
BAD: "**Writer's Message**: The author articulates the perspective that artificial intelligence will substitute the majority of employment..."`;
      userPrompt = `Summarize this X post like you're telling a friend. Keep it simple and conversational (1-2 sentences each).

DO NOT use labels like "Writer's Message:" or "Top Reactions:"—just give me the opinions directly:
1. What the author is saying
2. What top-liked replies think
3. What other people are saying

Use simple words. Add ${languageName} translation for 2-4 difficult words in EACH takeaway:\n\n${limitedContent}`;
    } else if (pageType === 'youtube_video') {
      // YouTube video - focus on main topics, key learnings, action items
      systemPrompt = `You are a helpful assistant that summarizes YouTube video content.

IMPORTANT: For each takeaway, you MUST identify 2-4 words that would be difficult for a high school student and add ${languageName} translations in parentheses immediately after those words.

Extract 3 key takeaways focusing on:
1. Main topic or theme
2. Key learning points or insights
3. Practical applications or action items

Format: word (translation)
- Keep the sentence in English
- Add ${languageName} translation right after the difficult word
- Use parentheses: word (translation)
- Translate 2-4 difficult words per takeaway`;
      userPrompt = `Summarize this YouTube video content and extract 3 key takeaways. Remember to add ${languageName} translations for 2-4 difficult words in EACH takeaway:\n\n${limitedContent}`;
    } else {
      // Article (default) - comprehensive analysis
      systemPrompt = `You are a helpful assistant that extracts the top 3 key takeaways from articles and web content.

IMPORTANT: For each takeaway, you MUST identify 2-4 words that would be difficult for a high school student and add ${languageName} translations in parentheses immediately after those words.

Format: word (translation)
- Keep the sentence in English
- Add ${languageName} translation right after the difficult word
- Use parentheses: word (translation)
- Translate 2-4 difficult words per takeaway`;
      userPrompt = `Extract the top 3 key takeaways from this content. Remember to add ${languageName} translations for 2-4 difficult words in EACH takeaway:\n\n${limitedContent}`;
    }

    // Generate key takeaways using OpenRouter with vocabulary assistance
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Log the response for debugging
    console.log('OpenRouter Response:', responseText);

    // Parse the response to extract the 3 takeaways
    // Expecting format like "1. ...\n2. ...\n3. ..."
    const lines = responseText.split('\n').filter(line => line.trim());
    const takeaways: string[] = [];

    for (const line of lines) {
      // Match lines starting with numbers or bullet points
      const match = line.match(/^(?:\d+\.?|[-•*])\s*(.+)$/);
      if (match && takeaways.length < 3) {
        takeaways.push(match[1].trim());
      }
    }

    // If we couldn't parse properly, try splitting by common separators
    if (takeaways.length === 0) {
      const parts = responseText.split(/\n\n|\n-|\n\d+\./);
      takeaways.push(
        ...parts
          .filter(p => p.trim())
          .slice(0, 3)
          .map(p => p.trim())
      );
    }

    // Ensure we have exactly 3 takeaways
    const finalTakeaways = takeaways.slice(0, 3);

    if (finalTakeaways.length === 0) {
      return res.status(500).json({
        error: 'Could not generate takeaways from the content',
      });
    }

    // Log what we're sending back
    console.log('Final Takeaways:', finalTakeaways);

    return res.status(200).json({
      success: true,
      takeaways: finalTakeaways,
    });
  } catch (error: any) {
    console.error('Error generating takeaways:', error);
    return res.status(500).json({
      error: 'Failed to generate takeaways',
      message: error.message,
    });
  }
}
