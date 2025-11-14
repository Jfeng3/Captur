import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Flashcards API called:', req.method);
  console.log('Request body:', req.body);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { front, back, sourceUrl, tag, userId } = req.body;
      console.log('Creating flashcard:', { front, back, sourceUrl, tag, userId });

      // Get the access token from Authorization header
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.replace('Bearer ', '');

      // Create authenticated Supabase client with proper session
      let authenticatedSupabase = supabase;

      if (accessToken) {
        authenticatedSupabase = createClient(supabaseUrl, supabaseAnonKey);
        // Set the session using the access token - this is required for RLS policies
        await authenticatedSupabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '' // Not needed for server-side operations
        });
        console.log('Using authenticated client with session');
      } else {
        console.log('No access token provided, using anonymous client');
      }

      if (!front) {
        return res.status(400).json({ error: 'Front (word) is required' });
      }

      // Default values
      const effectiveUserId = userId || 'default';
      const effectiveTag = tag || 'vocabulary';

      // Check if flashcard already exists for this user and word
      const { data: existing } = await authenticatedSupabase
        .from('flashcards')
        .select('id')
        .eq('user_id', effectiveUserId)
        .eq('front', front)
        .maybeSingle();

      if (existing) {
        console.log('Flashcard already exists:', existing.id);
        return res.status(200).json({
          success: true,
          message: 'Flashcard already exists',
          data: { id: existing.id }
        });
      }

      // Insert new flashcard
      const { data, error } = await authenticatedSupabase
        .from('flashcards')
        .insert({
          front,
          back: back || null,
          source_url: sourceUrl || null,
          tag: effectiveTag,
          user_id: effectiveUserId,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to create flashcard', details: error.message });
      }

      console.log('Flashcard created successfully:', data);

      return res.status(201).json({
        success: true,
        data: {
          id: data.id,
          front: data.front,
          back: data.back,
          sourceUrl: data.source_url,
          tag: data.tag,
          userId: data.user_id,
          nextReviewAt: data.next_review_at,
          reviewCount: data.review_count,
          easeFactor: parseFloat(data.ease_factor),
          interval: data.interval,
          lastReviewedAt: data.last_reviewed_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      });
    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
