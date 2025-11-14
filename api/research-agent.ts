import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ResearchResult {
  topic: string;
  insights: string[];
  postIdeas: string[];
  sources: string[];
  timestamp: string;
}

/**
 * Daily Research Agent
 * Searches the web for trending topics related to ESL/vocabulary learning
 * and generates X post ideas based on findings
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    console.log('🔍 Starting daily research agent...');

    // Step 1: Generate research queries based on Captur's focus areas
    const queries = generateResearchQueries();
    console.log('📝 Research queries:', queries);

    // Step 2: Research trending topics using OpenAI (can be enhanced with web search)
    const researchResults: ResearchResult[] = [];

    for (const query of queries) {
      const result = await researchTopic(query);
      researchResults.push(result);
    }

    // Step 3: Generate X post ideas from research
    const postIdeas = await generateXPostIdeas(researchResults);

    // Step 4: Store results (could save to database)
    const output = {
      date: new Date().toISOString().split('T')[0],
      researchResults,
      postIdeas,
      totalTopics: researchResults.length,
      totalPosts: postIdeas.length,
    };

    console.log('✅ Research complete:', {
      topics: output.totalTopics,
      posts: output.totalPosts,
    });

    return res.status(200).json(output);

  } catch (error) {
    console.error('❌ Research agent error:', error);
    return res.status(500).json({
      error: 'Research agent failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Generate diverse research queries for Captur's target audience
 */
function generateResearchQueries(): string[] {
  return [
    'Latest ESL learning trends 2025',
    'Professional English vocabulary challenges',
    'AI tools for language learning news',
    'Career advancement English tips',
    'Interview preparation English expressions',
    'Business English communication trends',
    'LinkedIn professional writing tips',
    'Non-native English speaker career stories',
  ];
}

/**
 * Research a single topic using OpenAI
 * In production, enhance this with actual web search API (Tavily, Perplexity, etc.)
 */
async function researchTopic(query: string): Promise<ResearchResult> {
  console.log(`🔎 Researching: ${query}`);

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a research assistant for Captur, a vocabulary building tool for ESL professionals.
Your job is to research trending topics, insights, and pain points related to: ${query}

Focus on:
- Current trends and news (imagine today is ${new Date().toISOString().split('T')[0]})
- Pain points ESL professionals face
- Opportunities for vocabulary learning
- Real-world career/interview scenarios
- Professional communication challenges

Return JSON format:
{
  "topic": "main topic name",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "sources": ["source 1", "source 2"]
}`,
      },
      {
        role: 'user',
        content: `Research: ${query}`,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content || '{}';
  const data = JSON.parse(content);

  return {
    topic: data.topic || query,
    insights: data.insights || [],
    postIdeas: [], // Will be generated in next step
    sources: data.sources || [],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate X post ideas from research results
 */
async function generateXPostIdeas(
  researchResults: ResearchResult[],
): Promise<string[]> {
  console.log('💡 Generating X post ideas from research...');

  // Combine all insights
  const allInsights = researchResults
    .flatMap((r) => r.insights)
    .join('\n- ');

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a social media expert creating engaging X (Twitter) posts for Captur.

Captur helps ESL professionals build vocabulary in their work context. Target audience:
- Non-native professionals working in English environments
- People preparing for interviews, meetings, presentations
- Anyone who understands English but sounds "simple" when speaking

Writing style:
- Direct, punchy, relatable
- Focus on pain points → solution
- Use contrast/before-after
- Include practical examples
- Keep posts under 280 characters
- No hashtags (they look spammy)
- No emojis unless specifically requested

Generate 10 X post ideas based on the research insights provided.
Return as JSON array of strings.`,
      },
      {
        role: 'user',
        content: `Based on these research insights, create 10 engaging X posts:

${allInsights}

Return JSON format: { "posts": ["post 1", "post 2", ...] }`,
      },
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content || '{"posts": []}';
  const data = JSON.parse(content);

  return data.posts || [];
}
