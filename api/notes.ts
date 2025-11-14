import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Notes API called:', req.method);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { title, content, source, url } = req.body;
      console.log('Extracted data:', { title, content, source, url });

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content is required' });
      }

      // Get current weekly tags (if any)
      const { data: weeklyTags } = await supabase
        .from('weekly_tags')
        .select('*')
        .gte('week_start', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('week_start', { ascending: false })
        .limit(1);

      const defaultTag = weeklyTags?.[0]?.tag1 || 'general';

      // Search for existing note by URL if URL is provided
      let existingNote = null;
      if (url) {
        const { data: foundNotes } = await supabase
          .from('notes')
          .select('*')
          .eq('url', url)
          .order('created_at', { ascending: false })
          .limit(1);

        existingNote = foundNotes?.[0];
        console.log('Existing note found:', existingNote ? 'yes' : 'no');
      }

      if (existingNote) {
        // Update existing note by appending new content
        const updatedContent = `${existingNote.content}\n\n${content.trim()}`;
        const wordCount = updatedContent.trim().split(/\s+/).filter((word: string) => word.length > 0).length;

        const updateData = {
          content: updatedContent,
          word_count: wordCount,
          updated_at: new Date().toISOString()
        };

        console.log('Updating existing note:', existingNote.id);

        const { data, error } = await supabase
          .from('notes')
          .update(updateData)
          .eq('id', existingNote.id)
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          console.error('Error details:', error.message);
          return res.status(500).json({ error: 'Failed to update note', details: error.message });
        }

        console.log('Note updated successfully:', data);

        return res.status(200).json({
          id: data.id,
          content: data.content,
          tag: data.tag,
          status: data.status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          wordCount: data.word_count,
          updated: true
        });
      } else {
        // Create new note
        const wordCount = content.trim().split(/\s+/).filter((word: string) => word.length > 0).length;

        const insertData = {
          content: content.trim(),
          tag: defaultTag,
          status: 'draft',
          word_count: wordCount,
          original_content: `${title ? `**${title}**\n\n` : ''}${content}${url ? `\n\nSource: ${url}` : ''}`,
          url: url || null,
          // Note: In production, you'd want to get the actual user_id from authentication
          user_id: null
        };

        console.log('Inserting new note with data:', insertData);

        const { data, error } = await supabase
          .from('notes')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          console.error('Error details:', error.message);
          return res.status(500).json({ error: 'Failed to save note', details: error.message });
        }

        console.log('Note saved successfully:', data);

        return res.status(200).json({
          id: data.id,
          content: data.content,
          tag: data.tag,
          status: data.status,
          createdAt: data.created_at,
          wordCount: data.word_count,
          updated: false
        });
      }
    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}