import { supabase } from '../lib/db';

export async function migrateReadyToDraft() {
  console.log('Starting migration: Converting ready notes to draft...');
  
  try {
    // Update all notes with status 'ready' to 'draft'
    const { data, error } = await supabase
      .from('notes')
      .update({ status: 'draft' })
      .eq('status', 'ready')
      .select();
    
    if (error) {
      console.error('Migration failed:', error);
      throw error;
    }
    
    console.log(`Migration completed: ${data?.length || 0} notes updated from 'ready' to 'draft'`);
    return data;
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateReadyToDraft()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}