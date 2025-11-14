import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dsgkzurlpdrdelzjskeh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZ2t6dXJscGRyZGVsempza2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NzkxNDAsImV4cCI6MjA2MTM1NTE0MH0.X9Vwr4Ps_MltoN4tiqyZKOctbMfTAQ0mHb5dQmUBYQQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);