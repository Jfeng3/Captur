import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ExerciseType = 'write_sentences' | 'fill_blank' | 'email_completion' | 'scenario';

const handler = async (
  req: VercelRequest,
  res: VercelResponse
) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, exerciseType } = req.body as { content: string; exerciseType?: ExerciseType };

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

    // Default to write_sentences if no type specified
    const type: ExerciseType = exerciseType || 'write_sentences';

    // Generate exercise based on type
    const exercise = await generateExercise(content, type);

    // Return successful response
    res.status(200).json({
      exerciseType: type,
      exercise
    });
  } catch (error) {
    console.error('Generate activation exercise error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      error: errorMessage,
      message: 'Failed to generate activation exercise'
    });
  }
};

async function generateExercise(content: string, type: ExerciseType) {
  const prompts: Record<ExerciseType, string> = {
    write_sentences: `Based on this vocabulary note, create a practice exercise that helps activate this vocabulary from passive to active use.

Vocabulary Note: "${content}"

Generate an exercise with:
1. A clear instruction asking the user to write 3 professional sentences using this vocabulary/expression
2. Context hints: Suggest 3 different workplace scenarios where this vocabulary would be naturally used (e.g., "in a project update email", "during a team meeting", "in a client presentation")
3. One example sentence to demonstrate natural usage

Format as JSON:
{
  "instruction": "Write 3 sentences using '[vocabulary]' in different workplace contexts",
  "scenarios": ["scenario 1", "scenario 2", "scenario 3"],
  "example": "example sentence showing natural usage"
}`,

    fill_blank: `Based on this vocabulary note, create a fill-in-the-blank exercise.

Vocabulary Note: "${content}"

Create 3 professional sentences with blanks where this vocabulary should go. Make the context clear enough that the vocabulary fits naturally.

Format as JSON:
{
  "instruction": "Fill in the blanks with the appropriate vocabulary",
  "sentences": [
    {"sentence": "During the meeting, we need to _____ on the key points.", "answer": "answer here"},
    {"sentence": "...", "answer": "..."},
    {"sentence": "...", "answer": "..."}
  ],
  "vocabulary": "the target vocabulary/expression"
}`,

    email_completion: `Based on this vocabulary note, create a professional email completion exercise.

Vocabulary Note: "${content}"

Generate a partial professional email where the user needs to complete it using this vocabulary naturally.

Format as JSON:
{
  "instruction": "Complete this professional email using '[vocabulary]' naturally in context",
  "emailStart": "first part of the email with clear context",
  "blankSection": "description of what should go in the blank",
  "emailEnd": "ending of the email (optional)",
  "exampleCompletion": "one way to complete it naturally"
}`,

    scenario: `Based on this vocabulary note, create a workplace scenario exercise.

Vocabulary Note: "${content}"

Create a realistic workplace scenario and ask the user to write a response using this vocabulary.

Format as JSON:
{
  "instruction": "Read this workplace scenario and write your response using '[vocabulary]'",
  "scenario": "detailed workplace situation description",
  "task": "specific task for the user (e.g., 'Write a Slack message to your team')",
  "hints": ["hint 1", "hint 2"],
  "exampleResponse": "one possible response using the vocabulary naturally"
}`
  };

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a professional English vocabulary trainer specializing in helping ESL professionals move vocabulary from passive (recognition) to active (production) use. Generate practical, workplace-relevant exercises.'
      },
      {
        role: 'user',
        content: prompts[type]
      }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const exerciseJson = completion.choices[0]?.message?.content?.trim() || '{}';

  try {
    return JSON.parse(exerciseJson);
  } catch (e) {
    // Fallback if JSON parsing fails
    return {
      instruction: 'Write 3 sentences using this vocabulary in workplace contexts',
      error: 'Failed to parse exercise format'
    };
  }
}

export default handler;
