import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/db';

// Declare chrome type for extension messaging
declare const chrome: {
  runtime?: {
    sendMessage?: (extensionId: string, message: unknown, callback: (response: unknown) => void) => void;
    lastError?: { message: string };
  };
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes with explicit event handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AUTH] Auth state change event:', event);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'TOKEN_REFRESHED') {
          console.log('✅ [AUTH] Token refreshed successfully on web');
          // Session will be synced to extension via the sync useEffect
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync session with Chrome extension when user is authenticated
  useEffect(() => {
    console.log('════════════════════════════════════════');
    console.log('🔄 [AUTH_SYNC] Extension sync check triggered');
    console.log('🔄 [AUTH_SYNC] Has session:', !!session);
    console.log('🔄 [AUTH_SYNC] Loading state:', loading);

    if (!session || loading) {
      console.log('⏭️ [AUTH_SYNC] Skipping sync - no session or still loading');
      console.log('════════════════════════════════════════');
      return;
    }

    console.log('📤 [AUTH_SYNC] Sending auth to extension via postMessage...');
    console.log('📧 [AUTH_SYNC] User email:', session.user?.email);
    console.log('⏰ [AUTH_SYNC] Session expires at:', session.expires_at);

    // Send auth tokens via window.postMessage
    window.postMessage(
      {
        type: 'CAPTUR_AUTH_SUCCESS',
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      },
      window.location.origin // Same origin
    );

    // Listen for response from content script
    const handleAuthResponse = (event: MessageEvent) => {
      // Validate origin
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'CAPTUR_AUTH_RESPONSE') {
        console.log('📥 [AUTH_SYNC] Received response from extension:', event.data);

        if (event.data.success) {
          console.log('✅ [AUTH_SYNC] Session synced successfully with extension!');
          console.log('✅ [AUTH_SYNC] User:', event.data.user);
        } else {
          console.log('❌ [AUTH_SYNC] Extension sync failed:', event.data.error);
          console.log('💡 [AUTH_SYNC] This is normal if extension is not installed');
        }

        // Cleanup listener
        window.removeEventListener('message', handleAuthResponse);
        console.log('════════════════════════════════════════');
      }
    };

    window.addEventListener('message', handleAuthResponse);

    // Cleanup after timeout (5 seconds)
    const timeout = setTimeout(() => {
      window.removeEventListener('message', handleAuthResponse);
      console.log('⏱️ [AUTH_SYNC] Response timeout - extension may not be installed');
      console.log('════════════════════════════════════════');
    }, 5000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('message', handleAuthResponse);
    };
  }, [session, loading]);

  // Listen for messages from extension (bidirectional sync + session requests)
  useEffect(() => {
    const handleExtensionMessages = async (event: MessageEvent) => {
      // Validate origin
      if (event.origin !== window.location.origin) return;

      // Handle token refresh from extension
      if (event.data?.type === 'CAPTUR_EXTENSION_TOKEN_REFRESH') {
        const { accessToken, refreshToken } = event.data;

        console.log('════════════════════════════════════════');
        console.log('📥 [AUTH] Receiving refreshed tokens from extension');
        console.log('🔄 [AUTH] Extension won the refresh race, syncing to web...');

        try {
          // Set session with extension's tokens (overwrites web's tokens)
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('❌ [AUTH] Failed to sync extension tokens:', error.message);
          } else {
            console.log('✅ [AUTH] Successfully synced with extension tokens');
            console.log('👤 [AUTH] User:', data.session?.user?.email);
          }
        } catch (error) {
          console.error('❌ [AUTH] Exception while syncing tokens:', error);
        }

        console.log('════════════════════════════════════════');
      }

      // Handle session request from extension (when popup opens)
      if (event.data?.type === 'CAPTUR_REQUEST_SESSION') {
        console.log('════════════════════════════════════════');
        console.log('📥 [AUTH] Extension requesting current session');

        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession) {
          console.log('📤 [AUTH] Sending current session to extension');
          console.log('👤 [AUTH] User:', currentSession.user?.email);

          // Send current session to extension
          window.postMessage(
            {
              type: 'CAPTUR_AUTH_SUCCESS',
              accessToken: currentSession.access_token,
              refreshToken: currentSession.refresh_token,
            },
            window.location.origin
          );

          console.log('✅ [AUTH] Session sent to extension');
        } else {
          console.log('⚠️ [AUTH] No session available to send');
        }

        console.log('════════════════════════════════════════');
      }
    };

    window.addEventListener('message', handleExtensionMessages);
    return () => window.removeEventListener('message', handleExtensionMessages);
  }, []);

  // Handle auth errors gracefully (e.g., "Already Used" token errors)
  useEffect(() => {
    const handleAuthError = (error: AuthError) => {
      if (error.message?.includes('Invalid Refresh Token: Already Used')) {
        console.log('⚠️ [AUTH] Token already refreshed elsewhere (likely by extension)');
        console.log('💡 [AUTH] This is normal - waiting for token sync from extension');
        // Don't show error to user - this is expected in dual-refresh scenario
      } else {
        console.error('❌ [AUTH] Auth error:', error.message);
      }
    };

    // Note: Supabase doesn't expose onAuthError directly, but errors are logged
    // The actual error handling happens in the onAuthStateChange listener
    // This is here as documentation for future error handling improvements

    return () => {
      // Cleanup if needed
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
