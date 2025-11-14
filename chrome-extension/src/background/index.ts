import { API_URL } from '../config';
import { supabase } from '../lib/supabase';
import { isAuthenticated, getUserId } from '../lib/auth';
import { DEFAULT_LANGUAGE } from '../constants/languages';

// Build timestamp injected at build time
declare const __BUILD_TIMESTAMP__: string;

// Store the most recent Google Docs selection for other extension parts to read
let lastSelection: any = null;

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 [EXTENSION] Auth state changed:', event, session?.user?.email);

  if (event === 'SIGNED_IN') {
    console.log('✅ [EXTENSION] User signed in:', session?.user?.id);

    // Notify all tabs that user is logged in
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'authStateChanged',
            authenticated: true,
            userId: session?.user?.id,
            email: session?.user?.email
          }).catch(err => {
            // Ignore errors for tabs that don't have content script
            console.log('Could not send message to tab:', tab.id, err.message);
          });
        }
      });
    });

    // Clear awaiting auth flag
    chrome.storage.local.remove('awaitingAuth');
  } else if (event === 'TOKEN_REFRESHED' && session) {
    console.log('════════════════════════════════════════');
    console.log('🔄 [EXTENSION] Token refreshed successfully');
    console.log('📤 [EXTENSION] Broadcasting new tokens to web app...');

    // Broadcast refreshed tokens to all captur.academy tabs
    chrome.tabs.query({
      url: ['https://www.captur.academy/*', 'http://localhost:5173/*']
    }, (tabs) => {
      console.log(`📡 [EXTENSION] Found ${tabs.length} web app tab(s)`);

      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOKEN_REFRESH_FROM_EXTENSION',
            accessToken: session.access_token,
            refreshToken: session.refresh_token
          }).catch(err => {
            console.log('⚠️ [EXTENSION] Could not send tokens to tab:', tab.id, err.message);
          });
        }
      });

      if (tabs.length > 0) {
        console.log('✅ [EXTENSION] Token broadcast complete');
      } else {
        console.log('ℹ️ [EXTENSION] No web app tabs open - tokens not synced');
      }
    });

    console.log('════════════════════════════════════════');
  } else if (event === 'SIGNED_OUT') {
    console.log('👋 [EXTENSION] User signed out');

    // Notify all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'authStateChanged',
            authenticated: false
          }).catch(err => {
            console.log('Could not send message to tab:', tab.id, err.message);
          });
        }
      });
    });
  }
});

// Listen for extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`Captur extension installed - VERSION: ${__BUILD_TIMESTAMP__}`);
  console.log('API_URL configured as:', API_URL);

  // Create context menu item
  chrome.contextMenus.create({
    id: 'save-selection',
    title: 'Save with Captur',
    contexts: ['selection']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error creating context menu:', chrome.runtime.lastError);
    } else {
      console.log('Context menu created successfully');
    }
  });

  // Check if this is a fresh install
  if (details.reason === 'install') {
    console.log('🎉 Fresh install detected');

    // Check if user is already authenticated
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      console.log('❌ User not authenticated - will show onboarding');
      // Set flag to show onboarding on first page visit
      await chrome.storage.local.set({
        showOnboarding: true,
        onboardingCompleted: false
      });
    } else {
      console.log('✅ User already authenticated - skipping onboarding');
      await chrome.storage.local.set({
        showOnboarding: false,
        onboardingCompleted: true
      });
    }
  }
});

// Listen for browser startup to validate session
chrome.runtime.onStartup.addListener(async () => {
  console.log('════════════════════════════════════════');
  console.log('🚀 [EXTENSION] Browser startup detected');
  console.log('🔍 [EXTENSION] Validating session...');

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('❌ [EXTENSION] Error getting session on startup:', error.message);
  } else if (session) {
    console.log('✅ [EXTENSION] Valid session found');
    console.log('👤 [EXTENSION] User:', session.user?.email);
    console.log('⏰ [EXTENSION] Session expires at:', new Date(session.expires_at! * 1000).toLocaleString());
  } else {
    console.log('⚠️ [EXTENSION] No session found - user needs to authenticate');
  }

  console.log('════════════════════════════════════════');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);
  console.log('Selection text:', info.selectionText);
  console.log('Tab URL:', tab?.url);
  
  if (info.menuItemId === 'save-selection' && info.selectionText) {
    console.log('Attempting to save note...');
    const noteData = {
      title: `Note from ${new URL(tab?.url || '').hostname}`,
      content: info.selectionText,
      source: 'chrome-extension-context',
      url: tab?.url || '',
    };
    console.log('Note data:', noteData);
    console.log('Sending to:', `${API_URL}/api/notes`);
    
    try {
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        let responseData;
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = { message: await response.text() };
        }
        console.log('Note saved successfully:', responseData);
        
        // Show success notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icon-128.png'),
          title: 'Captured!',
          message: 'Your selection has been saved with Captur',
        }, (notificationId) => {
          console.log('Notification created:', notificationId);
        });
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon-128.png'),
        title: 'Error',
        message: 'Failed to save note. Please try again.',
      }, (notificationId) => {
        console.log('Error notification created:', notificationId);
      });
    }
  }
});

// Listen for messages from external sources (like the web app)
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log('════════════════════════════════════════');
  console.log('📨 [EXTERNAL] External message received');
  console.log('📨 [EXTERNAL] Type:', request.type);
  console.log('📨 [EXTERNAL] Sender origin:', sender.origin);
  console.log('📨 [EXTERNAL] Sender URL:', sender.url);
  console.log('📨 [EXTERNAL] Full request:', request);
  console.log('════════════════════════════════════════');

  // Handle auth success from web app
  if (request.type === 'AUTH_SUCCESS') {
    console.log('🔐 [EXTERNAL] Received AUTH_SUCCESS from web app');

    const { accessToken, refreshToken } = request;

    if (!accessToken || !refreshToken) {
      console.error('❌ [EXTERNAL] Missing auth tokens in request');
      console.error('❌ [EXTERNAL] Has accessToken:', !!accessToken);
      console.error('❌ [EXTERNAL] Has refreshToken:', !!refreshToken);
      sendResponse({ success: false, error: 'Missing tokens' });
      return;
    }

    console.log('🔑 [EXTERNAL] Access token (first 20 chars):', accessToken.substring(0, 20) + '...');
    console.log('🔑 [EXTERNAL] Refresh token (first 20 chars):', refreshToken.substring(0, 20) + '...');
    console.log('🔄 [EXTERNAL] Setting session in Supabase...');

    // Set the session in Supabase
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    }).then(({ data, error }) => {
      if (error) {
        console.error('❌ [EXTERNAL] Error setting session:', error);
        console.error('❌ [EXTERNAL] Error details:', JSON.stringify(error));
        sendResponse({ success: false, error: error.message });
        return;
      }

      console.log('✅ [EXTERNAL] Session set successfully!');
      console.log('👤 [EXTERNAL] User ID:', data.user?.id);
      console.log('📧 [EXTERNAL] User email:', data.user?.email);
      console.log('🔄 [EXTERNAL] Session expires at:', data.session?.expires_at);

      // Clear the awaiting auth flag and mark onboarding as completed
      console.log('💾 [EXTERNAL] Updating chrome storage...');
      chrome.storage.local.set({
        onboardingCompleted: true,
        showOnboarding: false
      });
      chrome.storage.local.remove('awaitingAuth');
      console.log('✅ [EXTERNAL] Chrome storage updated');

      sendResponse({ success: true, user: data.user?.email });
    }).catch(err => {
      console.error('❌ [EXTERNAL] Unexpected error setting session:', err);
      console.error('❌ [EXTERNAL] Error stack:', err.stack);
      sendResponse({ success: false, error: String(err) });
    });

    return true; // Keep message channel open for async response
  }

  console.log('❌ [EXTERNAL] Unknown message type:', request.type);
  sendResponse({ success: false, error: 'Unknown message type' });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('🔔 Message received in background:', {
    type: request?.type,
    action: request?.action,
    sender: sender.tab ? `tab ${sender.tab.id}` : 'extension',
    url: sender.tab?.url,
    request: request
  });

  // Handle auth success from web app (via content script bridge)
  if (request.type === 'AUTH_SUCCESS_FROM_WEB') {
    console.log('🔐 [BRIDGE] Received auth from content script bridge');
    console.log('📧 [BRIDGE] Origin:', request.origin);

    const { accessToken, refreshToken } = request;

    if (!accessToken || !refreshToken) {
      console.error('❌ [BRIDGE] Missing tokens');
      sendResponse({ success: false, error: 'Missing tokens' });
      return;
    }

    console.log('🔑 [BRIDGE] Access token (first 20 chars):', accessToken.substring(0, 20) + '...');
    console.log('🔑 [BRIDGE] Refresh token (first 20 chars):', refreshToken.substring(0, 20) + '...');
    console.log('🔄 [BRIDGE] Manually writing session to storage (bypassing Supabase auth state machine)...');

    // Bypass Supabase's setSession() which triggers interfering auth state events
    // Instead, manually write the session directly to chrome.storage in the format Supabase expects
    (async () => {
      try {
        // Decode the JWT to get user info and expiry
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expiresAt = payload.exp;

        console.log('👤 [BRIDGE] User ID from token:', payload.sub);
        console.log('📧 [BRIDGE] User email from token:', payload.email);
        console.log('⏰ [BRIDGE] Token expires at:', new Date(expiresAt * 1000).toISOString());

        // Create session object in the exact format Supabase expects
        const session = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresAt - Math.floor(Date.now() / 1000),
          expires_at: expiresAt,
          token_type: 'bearer',
          user: {
            id: payload.sub,
            email: payload.email,
            aud: payload.aud,
            role: payload.role,
            created_at: payload.created_at,
            updated_at: payload.updated_at
          }
        };

        // Write directly to chrome.storage.local using the Supabase storage key format
        const storageKey = 'sb-dsgkzurlpdrdelzjskeh-auth-token';
        await chrome.storage.local.set({
          [storageKey]: JSON.stringify(session)
        });
        console.log('✅ [BRIDGE] Session written directly to storage');

        // Update onboarding flags
        console.log('💾 [BRIDGE] Updating chrome storage flags...');
        await chrome.storage.local.set({
          onboardingCompleted: true,
          showOnboarding: false
        });
        await chrome.storage.local.remove('awaitingAuth');
        console.log('✅ [BRIDGE] Chrome storage updated');

        // Manually trigger a session refresh to let Supabase auth state catch up
        console.log('🔄 [BRIDGE] Triggering Supabase getSession to sync auth state...');
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('⚠️ [BRIDGE] getSession returned error (may be expected):', error.message);
        } else if (data.session) {
          console.log('✅ [BRIDGE] Supabase auth state synced!');
          console.log('👤 [BRIDGE] Verified user:', data.session.user?.email);
        }

        sendResponse({ success: true, user: payload.email });
      } catch (err) {
        console.error('❌ [BRIDGE] Unexpected error setting session:', err);
        console.error('❌ [BRIDGE] Error stack:', (err as Error).stack);
        sendResponse({ success: false, error: String(err) });
      }
    })();

    return true; // Keep message channel open for async response
  }

  // Handle openAuthPage action from content script
  if (request?.action === 'openAuthPage') {
    console.log('🔐 Opening auth page:', request.url);
    chrome.tabs.create({ url: request.url }).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      console.error('Error opening auth page:', error);
      sendResponse({ success: false, error: String(error) });
    });
    return true;
  }

  // Handle Google Docs selection payload
  if (request?.type === "SELECTION_PAYLOAD") {
    lastSelection = request.payload; // { text, ranges, docId, ts }
    console.log('📄 ✅ Stored Google Docs selection:', lastSelection);
    console.log('📄 Selection details:', {
      text: lastSelection?.text?.substring(0, 100) + '...',
      hasRanges: !!lastSelection?.ranges,
      docId: lastSelection?.docId,
      timestamp: lastSelection?.ts
    });
    // Do whatever (send to server, show notification, etc.)
    sendResponse({ ok: true, stored: true, timestamp: new Date().toISOString() });
    return true;
  }

  // REMOVED: saveNote action - Chrome extension now uses saveNoteContent instead
  // The old /api/notes endpoint is for the web app's writing notes feature only

  if (request.action === 'saveNoteContent') {
    console.log('Handling saveNoteContent action from content script');
    console.log('Note content data:', request.data);

    // Get authenticated userId and access token
    Promise.all([getUserId(), supabase.auth.getSession()]).then(([userId, { data: { session } }]) => {
      if (!userId || !session?.access_token) {
        console.error('User not authenticated');
        sendResponse({ success: false, error: 'Authentication required. Please sign in.' });
        return;
      }

      // Replace userId in request data
      const dataWithUserId = { ...request.data, userId };
      console.log('Saving with userId:', userId);

      // Handle save note content request (structured data) with auth token
      fetch(`${API_URL}/api/note-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(dataWithUserId),
      })
        .then(async response => {
          console.log('Response from note-content API:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`Server error ${response.status}: ${errorText.substring(0, 200)}`);
          }

          return response.json();
        })
        .then(data => {
          console.log('Note content saved successfully:', data);
          sendResponse({ success: true, data: data.data });
        })
        .catch(error => {
          console.error('Error saving note content:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          sendResponse({ success: false, error: errorMessage });
        });
    }).catch(error => {
      console.error('Error getting userId:', error);
      sendResponse({ success: false, error: 'Failed to get authentication status' });
    });

    return true; // Keep the message channel open for async response
  }

  if (request.action === 'generateTakeaways') {
    console.log('Handling generateTakeaways action from content script');
    console.log('Content length:', request.data.content?.length);
    console.log('Page type:', request.data.pageType);

    // Get language preference from storage
    chrome.storage.sync.get(['translationLanguage'], (result) => {
      const targetLanguage = result.translationLanguage || DEFAULT_LANGUAGE;
      console.log('Using language:', targetLanguage);

      // Handle generate takeaways request
      fetch(`${API_URL}/api/generate-takeaways`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: request.data.content,
          pageType: request.data.pageType || 'article',
          targetLanguage: targetLanguage
        }),
      })
        .then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Takeaways from API:', data);
          sendResponse({ success: true, takeaways: data.takeaways });
        })
        .catch(error => {
          console.error('Error in generateTakeaways:', error);
          sendResponse({ success: false, error: error.message });
        });
    });

    return true; // Keep the message channel open for async response
  }

  if (request.action === 'generatePrompts') {
    console.log('Handling generatePrompts action from content script');
    console.log('Content length:', request.data.content?.length);

    fetch(`${API_URL}/api/generate-prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: request.data.content }),
    })
      .then(async response => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Prompts from API:', data);
        sendResponse({ success: true, prompts: data.prompts });
      })
      .catch(error => {
        console.error('Error in generatePrompts:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }

  if (request.action === 'generateVocabularies') {
    console.log('Handling generateVocabularies action from content script');
    console.log('Content length:', request.data.content?.length);

    fetch(`${API_URL}/api/generate-vocabularies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: request.data.content }),
    })
      .then(async response => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Vocabularies from API:', data);
        sendResponse({ success: true, vocabularies: data.vocabularies });
      })
      .catch(error => {
        console.error('Error in generateVocabularies:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }

  if (request.action === 'runCustomPrompt') {
    console.log('Handling runCustomPrompt action from content script');
    console.log('Prompt:', request.data.prompt);
    console.log('Content length:', request.data.content?.length);

    fetch(`${API_URL}/api/run-custom-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: request.data.content,
        prompt: request.data.prompt
      }),
    })
      .then(async response => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Custom prompt response from API:', data);
        sendResponse({ success: true, response: data.response });
      })
      .catch(error => {
        console.error('Error in runCustomPrompt:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }

  if (request.action === 'analyzeSubjectPredicate') {
    console.log('Handling analyzeSubjectPredicate action from content script');
    console.log('Sentence:', request.data.sentence);

    fetch(`${API_URL}/api/analyze-subject-predicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sentence: request.data.sentence }),
    })
      .then(async response => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Subject/Predicate from API:', data);
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        console.error('Error in analyzeSubjectPredicate:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }

  if (request.action === 'rephraseText') {
    console.log('Handling rephraseText action from content script');
    console.log('Text to rephrase:', request.data.content);
    
    // Handle rephrase text request
    fetch(`${API_URL}/api/rephrase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: request.data.content }),
    })
      .then(async response => {
        console.log('Rephrase response from API:', response.status);
        console.log('Rephrase response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          // Try to get error message from response
          let errorText;
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = 'Unable to read error response';
          }
          console.error('Rephrase server error response:', errorText);
          throw new Error(`Server error ${response.status}: ${errorText.substring(0, 200)}`);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type') || '';
        console.log('Rephrase response content-type:', contentType);
        
        if (contentType.includes('application/json')) {
          try {
            const jsonData = await response.json();
            console.log('Rephrase parsed JSON successfully:', jsonData);
            return jsonData;
          } catch (jsonError) {
            console.error('Rephrase JSON parsing failed:', jsonError);
            // Fallback: try to get the raw text to see what we actually received
            const rawText = await response.text();
            console.error('Rephrase raw response text:', rawText.substring(0, 200));
            const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
            throw new Error(`JSON parsing failed: ${errorMessage}. Raw response: ${rawText.substring(0, 100)}`);
          }
        } else {
          // If not JSON, get text response
          const text = await response.text();
          console.log('Rephrase non-JSON response text:', text.substring(0, 200));
          throw new Error(`Expected JSON but got ${contentType}: ${text.substring(0, 100)}...`);
        }
      })
      .then(data => {
        console.log('Rephrase data from API:', data);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('Error in rephraseText:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep the message channel open for async response
  }

  if (request.action === 'translateText') {
    console.log('Handling translateText action from content script');
    console.log('Text to translate:', request.data.content);
    console.log('Target language:', request.data.targetLanguage);

    // Get the selected translation model from chrome storage
    chrome.storage.sync.get(['translationModel'], (result) => {
      const model = result.translationModel || 'z-ai/glm-4.5-air';
      console.log('Using translation model:', model);

      // Handle translate text request
      fetch(`${API_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: request.data.content,
          targetLanguage: request.data.targetLanguage || 'zh-CN',
          model: model
        }),
      })
      .then(async response => {
        console.log('Translate response from API:', response.status);
        console.log('Translate response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          // Try to get error message from response
          let errorText;
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = 'Unable to read error response';
          }
          console.error('Translate server error response:', errorText);
          throw new Error(`Server error ${response.status}: ${errorText.substring(0, 200)}`);
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type') || '';
        console.log('Translate response content-type:', contentType);

        if (contentType.includes('application/json')) {
          try {
            const jsonData = await response.json();
            console.log('Translate parsed JSON successfully:', jsonData);
            return jsonData;
          } catch (jsonError) {
            console.error('Translate JSON parsing failed:', jsonError);
            // Fallback: try to get the raw text to see what we actually received
            const rawText = await response.text();
            console.error('Translate raw response text:', rawText.substring(0, 200));
            const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
            throw new Error(`JSON parsing failed: ${errorMessage}. Raw response: ${rawText.substring(0, 100)}`);
          }
        } else {
          // If not JSON, get text response
          const text = await response.text();
          console.log('Translate non-JSON response text:', text.substring(0, 200));
          throw new Error(`Expected JSON but got ${contentType}: ${text.substring(0, 100)}...`);
        }
      })
      .then(data => {
        console.log('Translate data from API:', data);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('Error in translateText:', error);
        sendResponse({ success: false, error: error.message });
      });
    });

    return true; // Keep the message channel open for async response
  }

  if (request.action === 'editText') {
    console.log('Handling editText action from content script');
    console.log('Text to edit:', request.data.content);

    // Handle edit text request
    fetch(`${API_URL}/api/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: request.data.content
      }),
    })
      .then(async response => {
        console.log('Edit response from API:', response.status);
        console.log('Edit response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          // Try to get error message from response
          let errorText;
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = 'Unable to read error response';
          }
          console.error('Edit server error response:', errorText);
          throw new Error(`Server error ${response.status}: ${errorText.substring(0, 200)}`);
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type') || '';
        console.log('Edit response content-type:', contentType);

        if (contentType.includes('application/json')) {
          try {
            const jsonData = await response.json();
            console.log('Edit parsed JSON successfully:', jsonData);
            return jsonData;
          } catch (jsonError) {
            console.error('Edit JSON parsing failed:', jsonError);
            // Fallback: try to get the raw text to see what we actually received
            const rawText = await response.text();
            console.error('Edit raw response text:', rawText.substring(0, 200));
            const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
            throw new Error(`JSON parsing failed: ${errorMessage}. Raw response: ${rawText.substring(0, 100)}`);
          }
        } else {
          // If not JSON, get text response
          const text = await response.text();
          console.log('Edit non-JSON response text:', text.substring(0, 200));
          throw new Error(`Expected JSON but got ${contentType}: ${text.substring(0, 100)}...`);
        }
      })
      .then(data => {
        console.log('Edit data from API:', data);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('Error in editText:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }

  if (request.action === 'loadNoteContent') {
    console.log('Handling loadNoteContent action from content script');
    console.log('Loading note content for URL:', request.data.url);

    // Get authenticated userId and access token
    Promise.all([getUserId(), supabase.auth.getSession()]).then(([userId, { data: { session } }]) => {
      if (!userId || !session?.access_token) {
        console.error('User not authenticated');
        sendResponse({ success: false, error: 'Authentication required. Please sign in.' });
        return;
      }

      const url = encodeURIComponent(request.data.url);

      // Handle load note content request with auth token and userId
      fetch(`${API_URL}/api/note-content?url=${url}&userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
        .then(async response => {
          console.log('Load note content response from API:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`Server error ${response.status}: ${errorText.substring(0, 200)}`);
          }

          return response.json();
        })
        .then(data => {
          console.log('Note content loaded successfully:', data);
          // Return first item if array, or null if no data
          const noteContent = data.data && data.data.length > 0 ? data.data[0] : null;
          sendResponse({ success: true, data: noteContent });
        })
        .catch(error => {
          console.error('Error loading note content:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          sendResponse({ success: false, error: errorMessage });
        });
    }).catch(error => {
      console.error('Error getting userId:', error);
      sendResponse({ success: false, error: 'Failed to get authentication status' });
    });

    return true; // Keep the message channel open for async response
  }

  if (request.action === 'replyText') {
    console.log('Handling replyText action from content script');
    console.log('Text to reply to:', request.data.content);

    // Handle reply text request
    fetch(`${API_URL}/api/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: request.data.content
      }),
    })
      .then(async response => {
        console.log('Reply response from API:', response.status);
        console.log('Reply response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          // Try to get error message from response
          let errorText;
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = 'Unable to read error response';
          }
          console.error('Reply server error response:', errorText);
          throw new Error(`Server error ${response.status}: ${errorText.substring(0, 200)}`);
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type') || '';
        console.log('Reply response content-type:', contentType);

        if (contentType.includes('application/json')) {
          try {
            const jsonData = await response.json();
            console.log('Reply parsed JSON successfully:', jsonData);
            return jsonData;
          } catch (jsonError) {
            console.error('Reply JSON parsing failed:', jsonError);
            // Fallback: try to get the raw text to see what we actually received
            const rawText = await response.text();
            console.error('Reply raw response text:', rawText.substring(0, 200));
            const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
            throw new Error(`JSON parsing failed: ${errorMessage}. Raw response: ${rawText.substring(0, 100)}`);
          }
        } else {
          // If not JSON, get text response
          const text = await response.text();
          console.log('Reply non-JSON response text:', text.substring(0, 200));
          throw new Error(`Expected JSON but got ${contentType}: ${text.substring(0, 100)}...`);
        }
      })
      .then(data => {
        console.log('Reply data from API:', data);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('Error in replyText:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }

  if (request.action === 'findSynonyms') {
    console.log('Handling findSynonyms action from content script');
    console.log('Word/phrase to find synonyms for:', request.data.content);

    // Handle find synonyms request
    fetch(`${API_URL}/api/synonyms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: request.data.content
      }),
    })
      .then(async response => {
        console.log('Synonyms response from API:', response.status);
        console.log('Synonyms response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          // Try to get error message from response
          let errorText;
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = 'Unable to read error response';
          }
          console.error('Synonyms server error response:', errorText);
          throw new Error(`Server error ${response.status}: ${errorText.substring(0, 200)}`);
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type') || '';
        console.log('Synonyms response content-type:', contentType);

        if (contentType.includes('application/json')) {
          try {
            const jsonData = await response.json();
            console.log('Synonyms parsed JSON successfully:', jsonData);
            return jsonData;
          } catch (jsonError) {
            console.error('Synonyms JSON parsing failed:', jsonError);
            // Fallback: try to get the raw text to see what we actually received
            const rawText = await response.text();
            console.error('Synonyms raw response text:', rawText.substring(0, 200));
            const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
            throw new Error(`JSON parsing failed: ${errorMessage}. Raw response: ${rawText.substring(0, 100)}`);
          }
        } else {
          // If not JSON, get text response
          const text = await response.text();
          console.log('Synonyms non-JSON response text:', text.substring(0, 200));
          throw new Error(`Expected JSON but got ${contentType}: ${text.substring(0, 100)}...`);
        }
      })
      .then(data => {
        console.log('Synonyms data from API:', data);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('Error in findSynonyms:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }

  if (request.action === 'createFlashcard') {
    console.log('════════════════════════════════════════');
    console.log('💾 [FLASHCARD] Create flashcard request received');
    console.log('💾 [FLASHCARD] Word (front):', request.data?.front);
    console.log('💾 [FLASHCARD] Translation (back):', request.data?.back?.substring(0, 50) + '...');
    console.log('💾 [FLASHCARD] Source URL:', request.data?.sourceUrl);
    console.log('💾 [FLASHCARD] Tag:', request.data?.tag);
    console.log('════════════════════════════════════════');

    // Get authenticated userId and access token
    Promise.all([getUserId(), supabase.auth.getSession()]).then(([userId, { data: { session } }]) => {
      if (!userId || !session?.access_token) {
        console.error('❌ [FLASHCARD] User not authenticated - cannot create flashcard');
        console.error('❌ [FLASHCARD] Please sign in first');
        sendResponse({ success: false, error: 'Authentication required. Please sign in.' });
        return;
      }

      // Replace userId in request data
      const dataWithUserId = { ...request.data, userId };
      console.log('✅ [FLASHCARD] User authenticated - userId:', userId);
      console.log('✅ [FLASHCARD] Access token available:', !!session.access_token);
      console.log('📤 [FLASHCARD] Sending flashcard to API with data:', {
        front: dataWithUserId.front,
        backLength: dataWithUserId.back?.length,
        sourceUrl: dataWithUserId.sourceUrl,
        tag: dataWithUserId.tag,
        userId: dataWithUserId.userId
      });

      // Handle create flashcard request with Authorization header
      fetch(`${API_URL}/api/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(dataWithUserId),
      })
        .then(async response => {
          console.log('📥 [FLASHCARD] API response status:', response.status);
          console.log('📥 [FLASHCARD] API response OK:', response.ok);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [FLASHCARD] Server error response:', errorText);
            throw new Error(`Server error ${response.status}: ${errorText.substring(0, 200)}`);
          }

          return response.json();
        })
        .then(data => {
          console.log('✅ [FLASHCARD] Flashcard created successfully!');
          console.log('✅ [FLASHCARD] Flashcard ID:', data.data?.id);
          console.log('✅ [FLASHCARD] Response data:', data);
          sendResponse({ success: true, data: data.data });
        })
        .catch(error => {
          console.error('❌ [FLASHCARD] Error creating flashcard:', error);
          console.error('❌ [FLASHCARD] Error stack:', error.stack);
          const errorMessage = error instanceof Error ? error.message : String(error);
          sendResponse({ success: false, error: errorMessage });
        });
    }).catch(error => {
      console.error('❌ [FLASHCARD] Error getting userId:', error);
      console.error('❌ [FLASHCARD] Error stack:', error.stack);
      sendResponse({ success: false, error: 'Failed to get authentication status' });
    });

    return true; // Keep the message channel open for async response
  }
});

export {};