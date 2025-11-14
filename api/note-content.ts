import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Note Content API called:', req.method);
  console.log('Request body:', req.body);

  // Create authenticated Supabase client
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
  });

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
      const { url, takeAways, reflections, markedSentences, difficultVocabularies, tags, userId } = req.body;
      console.log('Extracted data:', { url, takeAways, reflections, markedSentences, difficultVocabularies, tags, userId });

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Verify authenticated user matches the userId in request
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Authentication error:', authError);
        return res.status(401).json({ error: 'Unauthorized - valid authentication required' });
      }

      // Security check: ensure the authenticated user matches the userId in the request
      if (user.id !== userId) {
        console.error('User ID mismatch - authenticated:', user.id, 'requested:', userId);
        return res.status(403).json({ error: 'Forbidden - user ID mismatch' });
      }

      const effectiveUserId = userId;

      // Upsert note content (replace if exists, insert if not)
      // First check if record exists
      const { data: existing } = await supabase
        .from('note_content')
        .select('id')
        .eq('user_id', effectiveUserId)
        .eq('url', url)
        .maybeSingle();

      let data, error;

      if (existing) {
        // Update existing record - REPLACE all fields
        const result = await supabase
          .from('note_content')
          .update({
            take_aways: takeAways || [],
            reflections: reflections || [],
            marked_sentences: markedSentences || [],
            difficult_vocabularies: difficultVocabularies || [],
            tags: tags || [],
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from('note_content')
          .insert({
            url,
            take_aways: takeAways || [],
            reflections: reflections || [],
            marked_sentences: markedSentences || [],
            difficult_vocabularies: difficultVocabularies || [],
            tags: tags || [],
            user_id: effectiveUserId,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to save note content', details: error.message });
      }

      console.log('Note content saved successfully:', data);

      return res.status(200).json({
        success: true,
        data: {
          id: data.id,
          url: data.url,
          takeAways: data.take_aways,
          reflections: data.reflections,
          markedSentences: data.marked_sentences,
          difficultVocabularies: data.difficult_vocabularies,
          tags: data.tags,
          userId: data.user_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
      });
    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { url, userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Verify authenticated user matches the userId in request
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Authentication error:', authError);
        return res.status(401).json({ error: 'Unauthorized - valid authentication required' });
      }

      // Security check: ensure the authenticated user matches the userId in the request
      if (user.id !== userId) {
        console.error('User ID mismatch - authenticated:', user.id, 'requested:', userId);
        return res.status(403).json({ error: 'Forbidden - user ID mismatch' });
      }

      let query = supabase
        .from('note_content')
        .select('*')
        .eq('user_id', userId as string)
        .order('updated_at', { ascending: false });

      if (url) {
        query = query.eq('url', url);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch note content', details: error.message });
      }

      return res.status(200).json({
        success: true,
        data: data.map(item => ({
          id: item.id,
          url: item.url,
          takeAways: item.take_aways,
          reflections: item.reflections,
          markedSentences: item.marked_sentences,
          difficultVocabularies: item.difficult_vocabularies,
          tags: item.tags,
          userId: item.user_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }))
      });
    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
