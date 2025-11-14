import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/db';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // The session will be automatically set by Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/?error=auth_failed');
          return;
        }

        if (session) {
          console.log('════════════════════════════════════════');
          console.log('🔐 [AUTH_CALLBACK] Auth callback processing...');
          console.log('✅ [AUTH_CALLBACK] Auth successful!');
          console.log('📧 [AUTH_CALLBACK] User email:', session.user.email);
          console.log('👤 [AUTH_CALLBACK] User ID:', session.user.id);
          console.log('⏰ [AUTH_CALLBACK] Session expires at:', session.expires_at);

          // Check if auth came from extension
          const authSource = sessionStorage.getItem('authSource');
          console.log('🔍 [AUTH_CALLBACK] Auth source from sessionStorage:', authSource || 'not set (regular web auth)');

          if (authSource === 'extension') {
            console.log('🔌 [AUTH_CALLBACK] This is extension auth - will sync to extension');
            console.log('📤 [AUTH_CALLBACK] Sending AUTH_SUCCESS via postMessage...');

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
              if (event.origin !== window.location.origin) {
                return;
              }

              if (event.data?.type === 'CAPTUR_AUTH_RESPONSE') {
                console.log('📥 [AUTH_CALLBACK] Received response:', event.data);

                if (event.data.success) {
                  console.log('✅ [AUTH_CALLBACK] Extension sync successful!');
                } else {
                  console.log('❌ [AUTH_CALLBACK] Extension sync failed:', event.data.error);
                }

                window.removeEventListener('message', handleAuthResponse);
                console.log('════════════════════════════════════════');
              }
            };

            window.addEventListener('message', handleAuthResponse);

            // Cleanup and redirect after short delay
            setTimeout(() => {
              window.removeEventListener('message', handleAuthResponse);
              console.log('🧹 [AUTH_CALLBACK] Clearing authSource from sessionStorage');
              sessionStorage.removeItem('authSource');
              console.log('🔀 [AUTH_CALLBACK] Redirecting to /dashboard?welcome=extension');
              navigate('/dashboard?welcome=extension');
            }, 1000);
          } else {
            console.log('🌐 [AUTH_CALLBACK] This is regular web auth - no extension sync needed');
            console.log('🔀 [AUTH_CALLBACK] Redirecting to /dashboard');
            console.log('════════════════════════════════════════');
            // Regular web app auth
            navigate('/dashboard');
          }
        } else {
          console.log('No session found, redirecting to home');
          navigate('/');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
