import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dsgkzurlpdrdelzjskeh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZ2t6dXJscGRyZGVsempza2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NzkxNDAsImV4cCI6MjA2MTM1NTE0MH0.X9Vwr4Ps_MltoN4tiqyZKOctbMfTAQ0mHb5dQmUBYQQ';

/**
 * Supabase client for Chrome extension
 *
 * Auth Strategy: Dual Auto-Refresh with Bidirectional Sync
 * ------------------------------------------------------
 * Both the extension and web app independently auto-refresh tokens.
 * When one refreshes successfully, it syncs the new tokens to the other.
 *
 * This approach ensures:
 * - Extension works standalone (without web app open)
 * - Web app works standalone (without extension installed)
 * - Both stay in sync when both are active
 * - Graceful handling of "Already Used" token errors
 *
 * Token Flow:
 * 1. Extension auto-refreshes → Broadcasts to web via content script
 * 2. Web auto-refreshes → Sends to extension via postMessage bridge
 * 3. Loser of race condition accepts winner's tokens
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      // Use chrome.storage.local for session persistence across browser restarts
      getItem: async (key: string) => {
        const result = await chrome.storage.local.get(key);
        return result[key] || null;
      },
      setItem: async (key: string, value: string) => {
        await chrome.storage.local.set({ [key]: value });
      },
      removeItem: async (key: string) => {
        await chrome.storage.local.remove(key);
      }
    },
    // Enable automatic token refresh (runs ~5 min before expiry)
    autoRefreshToken: true,
    // Persist session across browser restarts
    persistSession: true,
    // Don't detect session from URL (we handle auth via postMessage bridge)
    detectSessionInUrl: false,
    // Use PKCE flow for better OAuth security (recommended for extensions)
    flowType: 'pkce'
  }
});
