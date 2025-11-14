import { supabase } from './supabase';

/**
 * Get the current authenticated user ID
 * Returns null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  try {
    console.log('🔍 [AUTH] Getting user ID...');
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user?.id) {
      console.log('✅ [AUTH] User ID found:', session.user.id);
      console.log('📧 [AUTH] User email:', session.user.email);
    } else {
      console.log('❌ [AUTH] No user ID found - user not authenticated');
    }

    return session?.user?.id || null;
  } catch (error) {
    console.error('❌ [AUTH] Error getting user ID:', error);
    return null;
  }
}

/**
 * Check if user is currently authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getUserId();
  return userId !== null;
}

/**
 * Get the current user's email
 */
export async function getUserEmail(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.email || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

/**
 * Sign out the current user
 * Clears all extension data
 */
export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
    // Clear all extension data
    await chrome.storage.local.clear();
    await chrome.storage.sync.clear();
    console.log('✅ User signed out successfully');
  } catch (error) {
    console.error('❌ Error signing out:', error);
    throw error;
  }
}

/**
 * Open the captur.academy auth page in a new tab
 * Adds query parameter to indicate coming from extension
 * Works from both content scripts and background scripts
 */
export async function openAuthPage(): Promise<void> {
  const authUrl = 'https://www.captur.academy/?auth=login&source=extension';

  // Store flag to indicate we're waiting for auth
  await chrome.storage.local.set({ awaitingAuth: true });

  // Check if chrome.tabs is available (background script) or not (content script)
  if (chrome.tabs && chrome.tabs.create) {
    // We're in a background script
    await chrome.tabs.create({ url: authUrl });
  } else {
    // We're in a content script - send message to background script
    chrome.runtime.sendMessage({
      action: 'openAuthPage',
      url: authUrl
    });
  }
}

/**
 * Set the auth session from external source (e.g., web app)
 * Used when user completes OAuth on captur.academy
 */
export async function setSession(accessToken: string, refreshToken: string): Promise<boolean> {
  try {
    console.log('🔐 [AUTH] Setting session with tokens...');
    console.log('🔑 [AUTH] Access token (first 20 chars):', accessToken.substring(0, 20) + '...');
    console.log('🔑 [AUTH] Refresh token (first 20 chars):', refreshToken.substring(0, 20) + '...');

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (error) {
      console.error('❌ [AUTH] Error setting session:', error);
      throw error;
    }

    console.log('✅ [AUTH] Session set successfully!');
    console.log('👤 [AUTH] User ID:', data.user?.id);
    console.log('📧 [AUTH] User email:', data.user?.email);
    console.log('🔄 [AUTH] Session expires at:', data.session?.expires_at);

    return true;
  } catch (error) {
    console.error('❌ [AUTH] Failed to set session:', error);
    return false;
  }
}

/**
 * Check if extension is awaiting auth completion
 */
export async function isAwaitingAuth(): Promise<boolean> {
  const result = await chrome.storage.local.get('awaitingAuth');
  return result.awaitingAuth === true;
}

/**
 * Clear the awaiting auth flag
 */
export async function clearAwaitingAuth(): Promise<void> {
  await chrome.storage.local.remove('awaitingAuth');
}
