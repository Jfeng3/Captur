import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUserEmail } from '../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Globe, Zap, Layout, Cpu } from 'lucide-react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type LanguageCode } from '../constants/languages';

type ShiftShiftAction = 'rephrase' | 'translate' | 'synonym' | 'simplify' | 'reply';
type StickyNoteTab = 'takeaways' | 'marked' | 'reflect';
type TranslationModel = 'anthropic/claude-3-haiku' | 'zhipuai/glm-4-flash' | 'qwen/qwen-2.5-72b-instruct' | 'z-ai/glm-4.5-air:free' | 'z-ai/glm-4.5-air';

export default function SimplePopup() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [translationLanguage, setTranslationLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [translationModel, setTranslationModel] = useState<TranslationModel>('z-ai/glm-4.5-air');
  const [enabledShiftActions, setEnabledShiftActions] = useState<ShiftShiftAction[]>(['rephrase', 'translate', 'synonym', 'simplify', 'reply']);
  const [enabledStickyNoteTabs, setEnabledStickyNoteTabs] = useState<StickyNoteTab[]>(['takeaways', 'marked', 'reflect']);

  const requestSessionFromWeb = async () => {
    console.log('🔍 [POPUP] Requesting session from web app tabs...');

    // Query for captur.academy tabs
    const tabs = await chrome.tabs.query({
      url: ['https://www.captur.academy/*', 'http://localhost:5173/*']
    });

    console.log(`📡 [POPUP] Found ${tabs.length} web app tab(s)`);

    if (tabs.length > 0) {
      // Send message to each tab to request session
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'REQUEST_WEB_SESSION'
          }).catch(err => {
            console.log('⚠️ [POPUP] Could not send session request to tab:', tab.id, err.message);
          });
        }
      });
    }
  };

  useEffect(() => {
    checkAuth();

    // Request session from any open web app tabs (helps with already-logged-in scenario)
    requestSessionFromWeb();

    // Load saved preferences
    console.log('🔄 [POPUP] Loading saved preferences from chrome.storage.sync...');
    chrome.storage.sync.get(['translationLanguage', 'translationModel', 'enabledShiftActions', 'enabledStickyNoteTabs'], (result) => {
      console.log('📦 [POPUP] Loaded from storage:', result);

      if (result.translationLanguage) {
        console.log('🌐 [POPUP] Setting translation language to:', result.translationLanguage);
        setTranslationLanguage(result.translationLanguage as LanguageCode);
      } else {
        console.log('⚠️ [POPUP] No saved translation language, using default:', DEFAULT_LANGUAGE);
      }

      if (result.translationModel) {
        setTranslationModel(result.translationModel as TranslationModel);
      }
      if (result.enabledShiftActions) {
        setEnabledShiftActions(result.enabledShiftActions);
      }
      if (result.enabledStickyNoteTabs) {
        setEnabledStickyNoteTabs(result.enabledStickyNoteTabs);
      }
    });
  }, []);

  // Save preferences when they change
  useEffect(() => {
    console.log('💾 [POPUP] Saving translation language to chrome.storage.sync:', translationLanguage);
    chrome.storage.sync.set({ translationLanguage }, () => {
      console.log('✅ [POPUP] Translation language saved successfully');

      // Verify it was saved by reading it back
      chrome.storage.sync.get(['translationLanguage'], (result) => {
        console.log('✅ [POPUP] Verified saved language:', result.translationLanguage);
      });
    });
  }, [translationLanguage]);

  useEffect(() => {
    chrome.storage.sync.set({ translationModel });
  }, [translationModel]);

  useEffect(() => {
    chrome.storage.sync.set({ enabledShiftActions });
  }, [enabledShiftActions]);

  useEffect(() => {
    chrome.storage.sync.set({ enabledStickyNoteTabs });
  }, [enabledStickyNoteTabs]);

  const checkAuth = async () => {
    console.log('════════════════════════════════════════');
    console.log('🔍 [POPUP] Checking authentication status...');
    console.log('🆔 [POPUP] Current extension ID:', chrome.runtime.id);

    const { data: { session }, error } = await supabase.auth.getSession();

    // Log what we're checking
    console.log('🔍 [POPUP] Checked: supabase.auth.getSession()');
    console.log('🔍 [POPUP] Session object exists:', !!session);
    console.log('🔍 [POPUP] Session data:', session ? {
      user_id: session.user?.id,
      email: session.user?.email,
      expires_at: session.expires_at,
      has_access_token: !!session.access_token,
      has_refresh_token: !!session.refresh_token
    } : null);

    if (error) {
      console.error('❌ [POPUP] Error getting session:', error);
    }

    setIsAuthenticated(!!session);

    if (session) {
      console.log('✅ [POPUP] User is authenticated!');
      console.log('👤 [POPUP] User ID:', session.user?.id);

      const email = await getUserEmail();
      console.log('📧 [POPUP] User email:', email);
      setUserEmail(email);

      // Get user avatar from session user metadata
      const avatar = session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture || null;
      console.log('🖼️ [POPUP] User avatar URL:', avatar);
      setUserAvatar(avatar);

      // DISABLED: Onboarding cards hidden for now
      // Check if onboarding completed
      // const result = await chrome.storage.local.get(['onboardingCompleted']);
      // if (!result.onboardingCompleted) {
      //   setShowOnboarding(true);
      // }

      // Mark onboarding as completed immediately
      await chrome.storage.local.set({ onboardingCompleted: true });
      console.log('✅ [POPUP] Onboarding marked as completed');
    } else {
      console.log('❌ [POPUP] User is not authenticated');
      console.log('❌ [POPUP] Reason: session is null or undefined');
      console.log('💡 [POPUP] This could mean:');
      console.log('   1. User has not signed in yet');
      console.log('   2. Session expired');
      console.log('   3. Session was not synced from web app');
      console.log('   4. Extension storage was cleared');

      // Check if we're awaiting auth
      const storageData = await chrome.storage.local.get(['awaitingAuth', 'onboardingCompleted']);
      console.log('📦 [POPUP] Chrome storage state:', storageData);
    }

    console.log('════════════════════════════════════════');
    setLoading(false);
  };

  const handleSignIn = async () => {
    console.log('🔐 [POPUP] Sign in button clicked');
    console.log('🔐 [POPUP] Opening auth page...');

    // Open captur.academy for authentication
    const authUrl = 'https://www.captur.academy/?auth=login&source=extension';

    // Set flag to show onboarding after auth
    await chrome.storage.local.set({ awaitingAuth: true });
    console.log('✅ [POPUP] Set awaitingAuth flag');

    // Open in new tab
    chrome.tabs.create({ url: authUrl });
    console.log('✅ [POPUP] Opened auth page in new tab');

    // Close popup
    console.log('👋 [POPUP] Closing popup...');
    window.close();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await chrome.storage.local.clear();
    setIsAuthenticated(false);
    setUserEmail(null);
    setShowOnboarding(false);
  };

  const completeOnboarding = async () => {
    await chrome.storage.local.set({ onboardingCompleted: true });
    setShowOnboarding(false);
  };

  const toggleShiftAction = (action: ShiftShiftAction) => {
    if (enabledShiftActions.includes(action)) {
      // Prevent disabling all actions
      if (enabledShiftActions.length === 1) {
        setMessage('At least one action must be enabled');
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 2000);
        return;
      }
      setEnabledShiftActions(enabledShiftActions.filter(a => a !== action));
    } else {
      setEnabledShiftActions([...enabledShiftActions, action]);
    }

    setMessage('Settings saved');
    setMessageType('success');
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 1500);
  };

  const toggleStickyNoteTab = (tab: StickyNoteTab) => {
    if (enabledStickyNoteTabs.includes(tab)) {
      // Prevent disabling all tabs
      if (enabledStickyNoteTabs.length === 1) {
        setMessage('At least one tab must be enabled');
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 2000);
        return;
      }
      setEnabledStickyNoteTabs(enabledStickyNoteTabs.filter(t => t !== tab));
    } else {
      setEnabledStickyNoteTabs([...enabledStickyNoteTabs, tab]);
    }

    setMessage('Settings saved');
    setMessageType('success');
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 1500);
  };

  const shiftActions: { value: ShiftShiftAction; label: string; icon: string }[] = [
    { value: 'rephrase', label: 'Rephrase', icon: '✏️' },
    { value: 'translate', label: 'Translate', icon: '🌐' },
    { value: 'synonym', label: 'Synonym', icon: '📚' },
    { value: 'simplify', label: 'Simplify', icon: '⚡' },
    { value: 'reply', label: 'Reply', icon: '💬' },
  ];

  const stickyNoteTabs: { value: StickyNoteTab; label: string; icon: string }[] = [
    { value: 'takeaways', label: 'Takeaways', icon: '📝' },
    { value: 'marked', label: 'Marked', icon: '🔖' },
    { value: 'reflect', label: 'Reflect', icon: '💭' },
  ];

  const onboardingCards = [
    {
      title: '📚 Build Vocabulary',
      description: 'Click on any word to save it as a flashcard. Review later with spaced repetition.',
    },
    {
      title: '✨ AI-Powered Learning',
      description: 'Get instant translations, definitions, and example sentences powered by AI.',
    },
    {
      title: '📝 Take Notes',
      description: 'Highlight important sentences and add your own reflections while reading.',
    },
    {
      title: '🎯 Track Progress',
      description: 'View all your saved vocabulary and notes at captur.academy/flashcards',
    },
  ];

  if (loading) {
    return (
      <div className="min-w-[420px] min-h-[500px] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-w-[420px] min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-background p-8">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-6">✨</div>
          <h1 className="text-3xl font-bold mb-3">Welcome to Captur!</h1>
          <p className="text-muted-foreground mb-8">
            Build vocabulary from content you love
            <span className="block text-primary font-semibold mt-1">30x faster than traditional methods</span>
          </p>

          <button
            onClick={handleSignIn}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            Sign in with Google
          </button>

          <p className="text-xs text-muted-foreground mt-4">
            Required to save your flashcards & notes
          </p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    const currentCard = onboardingCards[onboardingStep];

    return (
      <div className="min-w-[420px] min-h-[500px] flex flex-col bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b px-6 py-4">
          <h2 className="text-xl font-bold text-primary text-center">Getting Started</h2>
        </div>

        {/* Card */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-7xl mb-6">{currentCard.title.split(' ')[0]}</div>
          <h3 className="text-2xl font-bold mb-3 text-center">
            {currentCard.title.substring(currentCard.title.indexOf(' ') + 1)}
          </h3>
          <p className="text-muted-foreground text-center mb-8 max-w-sm">
            {currentCard.description}
          </p>

          {/* Progress dots */}
          <div className="flex gap-2 mb-8">
            {onboardingCards.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === onboardingStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 w-full max-w-sm">
            {onboardingStep > 0 && (
              <button
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (onboardingStep < onboardingCards.length - 1) {
                  setOnboardingStep(onboardingStep + 1);
                } else {
                  completeOnboarding();
                }
              }}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              {onboardingStep < onboardingCards.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main settings view
  return (
    <div className="min-w-[420px] min-h-[500px] bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-primary/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {userEmail?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold">Captur</h2>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Translation Language */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Translation Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={translationLanguage}
              onChange={(e) => {
                const newLanguage = e.target.value as LanguageCode;
                console.log('🌐 [POPUP] User changed language from', translationLanguage, 'to', newLanguage);
                setTranslationLanguage(newLanguage);
                setMessage('Language updated');
                setMessageType('success');
                setTimeout(() => {
                  setMessage('');
                  setMessageType('');
                }, 1500);
              }}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              Choose which language to translate vocabulary words to
            </p>
          </CardContent>
        </Card>

        {/* Translation Model */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Translation Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={translationModel}
              onChange={(e) => {
                setTranslationModel(e.target.value as TranslationModel);
                setMessage('Model updated');
                setMessageType('success');
                setTimeout(() => {
                  setMessage('');
                  setMessageType('');
                }, 1500);
              }}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="anthropic/claude-3-haiku">Claude 3 Haiku (Anthropic)</option>
              <option value="zhipuai/glm-4-flash">GLM-4-Flash (ZhipuAI)</option>
              <option value="qwen/qwen-2.5-72b-instruct">Qwen 2.5 72B (Alibaba)</option>
              <option value="z-ai/glm-4.5-air:free">GLM-4.5-Air Free (ZhipuAI)</option>
              <option value="z-ai/glm-4.5-air">GLM-4.5-Air (ZhipuAI)</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              Choose which AI model to use for translation
            </p>
          </CardContent>
        </Card>

        {/* Double-Shift Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Double-Shift Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Select which actions appear when you press Shift twice
            </p>
            <div className="space-y-2">
              {shiftActions.map((action) => (
                <label
                  key={action.value}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={enabledShiftActions.includes(action.value)}
                    onChange={() => toggleShiftAction(action.value)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium">{action.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sticky Note Tabs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Sticky Note Tabs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Choose which tabs to show in your sticky notes
            </p>
            <div className="space-y-2">
              {stickyNoteTabs.map((tab) => (
                <label
                  key={tab.value}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={enabledStickyNoteTabs.includes(tab.value)}
                    onChange={() => toggleStickyNoteTab(tab.value)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-sm font-medium">{tab.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Display */}
        {message && (
          <Card className={messageType === 'success' ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'}>
            <CardContent className="pt-4 pb-4">
              <p className={`text-sm font-medium text-center ${messageType === 'success' ? 'text-green-700' : 'text-destructive'}`}>
                {message}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
