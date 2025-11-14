// Content script for Captur extension
import { TooltipManager, TranscriptBox, NativeHighlightTooltip } from './components';
import { showStickyNotes } from './components/StickyNotes';
import { DEFAULT_LANGUAGE } from '../../../constants/languages';

console.log('🚀 Captur content script loaded at:', window.location.href);

// Listen for storage changes (especially translation language changes)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.translationLanguage) {
    const oldValue = changes.translationLanguage.oldValue;
    const newValue = changes.translationLanguage.newValue;
    console.log('🔄 [CONTENT] Translation language changed from', oldValue, 'to', newValue);
    console.log('✅ [CONTENT] New language will be used for next translation');
  }
});

// Check if onboarding should be shown
async function checkAndShowOnboarding() {
  // DISABLED: Onboarding modal permanently disabled
  console.log('✅ Onboarding disabled');

  // Mark onboarding as completed to prevent it from ever showing
  await chrome.storage.local.set({
    onboardingCompleted: true,
    showOnboarding: false
  });

  return;

  /* Original onboarding code (disabled)
  const result = await chrome.storage.local.get(['showOnboarding', 'onboardingCompleted']);

  // Don't show onboarding if it's already completed
  if (result.onboardingCompleted) {
    console.log('✅ Onboarding already completed, skipping');
    return;
  }

  // Only show if explicitly flagged to show onboarding
  if (result.showOnboarding) {
    console.log('👋 Showing onboarding for new user');

    // Small delay to ensure page is ready
    setTimeout(() => {
      const onboarding = new OnboardingModal({
        onComplete: () => {
          console.log('✅ Onboarding completed');
          // Reload page to ensure everything is initialized
          window.location.reload();
        }
      });
      onboarding.show();
    }, 1000);
  } else {
    console.log('✅ Onboarding not needed');
  }
  */
}

// Run onboarding check
checkAndShowOnboarding();

// Global variables for selection and tooltip management
let selectedText = '';
let selectionTimeout: number | null = null;
let currentSelection: Selection | null = null;
let tooltipManager: TooltipManager;
let nativeHighlightTooltip: NativeHighlightTooltip | null = null;
let lastShiftTime = 0;
const DOUBLE_SHIFT_THRESHOLD = 500; // milliseconds
let currentYouTubeUrl = window.location.href;
let transcriptBoxInstance: TranscriptBox | null = null;
let widgetObserver: MutationObserver | null = null;
let isTranslating = false; // Flag to prevent duplicate translation requests

// Initialize tooltip manager
function initializeTooltipManager() {
  tooltipManager = new TooltipManager({
    onRephrase: handleRephrase,
    onTranslate: handleTranslate,
    onSynonym: handleSynonym,
    onEdit: handleEdit,
    onReply: handleReply,
    // REMOVED: onSave callback - no longer saving to writing_notes
    onRephraseSelect: (option) => {
      console.log('Rephrase option selected:', option);
    },
    onTextReplace: (newText) => {
      replaceSelectedText(newText);
    }
  });
}

// Listen for messages from popup and background
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Content script received message:', request);

  if (request.action === 'getSelection') {
    const selectedText = window.getSelection()?.toString() || '';
    console.log('Sending selected text to popup:', selectedText);
    sendResponse({ selectedText });
  }

  // Handle session request from popup
  if (request.type === 'REQUEST_WEB_SESSION') {
    console.log('📥 [CONTENT] Popup requesting session from web');
    console.log('📤 [CONTENT] Forwarding request to web page...');

    // Forward request to web page
    window.postMessage(
      { type: 'CAPTUR_REQUEST_SESSION' },
      window.location.origin
    );

    sendResponse({ success: true });
  }

  return true;
});

// Listen for auth messages from web app via window.postMessage
window.addEventListener('message', (event) => {
  // SECURITY: Validate origin
  const allowedOrigins = [
    'https://www.captur.academy',
    'https://captur.academy', // Without www
    'http://localhost:5173'
  ];

  if (!allowedOrigins.includes(event.origin)) {
    // Silently ignore messages from other origins
    return;
  }

  // Check if this is an auth message
  if (event.data?.type === 'CAPTUR_AUTH_SUCCESS') {
    console.log('🔐 [AUTH_BRIDGE] Received auth message from web app');
    console.log('📧 [AUTH_BRIDGE] Origin:', event.origin);

    const { accessToken, refreshToken } = event.data;

    if (!accessToken || !refreshToken) {
      console.error('❌ [AUTH_BRIDGE] Missing tokens in message');
      // Send error response back to web app
      window.postMessage(
        {
          type: 'CAPTUR_AUTH_RESPONSE',
          success: false,
          error: 'Missing tokens'
        },
        event.origin
      );
      return;
    }

    console.log('🔑 [AUTH_BRIDGE] Tokens received, relaying to background script...');

    // Relay to background script (internal extension message)
    chrome.runtime.sendMessage(
      {
        type: 'AUTH_SUCCESS_FROM_WEB',
        accessToken,
        refreshToken,
        origin: event.origin
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ [AUTH_BRIDGE] Failed to relay to background:', chrome.runtime.lastError.message);

          // Send failure response back to web app
          window.postMessage(
            {
              type: 'CAPTUR_AUTH_RESPONSE',
              success: false,
              error: chrome.runtime.lastError.message
            },
            event.origin
          );
          return;
        }

        console.log('✅ [AUTH_BRIDGE] Background script response:', response);

        // Send success response back to web app
        window.postMessage(
          {
            type: 'CAPTUR_AUTH_RESPONSE',
            success: response?.success || false,
            user: response?.user
          },
          event.origin
        );
      }
    );
  }
});

console.log('✅ [AUTH_BRIDGE] Window message listener initialized');

// Listen for token refresh messages from background script (reverse bridge: extension → web)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'TOKEN_REFRESH_FROM_EXTENSION') {
    console.log('════════════════════════════════════════');
    console.log('📥 [AUTH_BRIDGE] Received token refresh from extension background');
    console.log('📤 [AUTH_BRIDGE] Forwarding to web app via postMessage...');

    const { accessToken, refreshToken } = message;

    // Forward to web page via window.postMessage
    window.postMessage(
      {
        type: 'CAPTUR_EXTENSION_TOKEN_REFRESH',
        accessToken,
        refreshToken
      },
      window.location.origin
    );

    console.log('✅ [AUTH_BRIDGE] Token refresh forwarded to web app');
    console.log('════════════════════════════════════════');

    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

console.log('✅ [AUTH_BRIDGE] Reverse bridge (extension → web) initialized');

// Handle voice action (previously rephrase)
function handleRephrase() {
  console.log('🔵 Voice button clicked');
  console.log('Selected text:', selectedText);
  
  if (!selectedText) {
    console.error('❌ No selected text available');
    return;
  }
  
  // Set loading state
  tooltipManager.setButtonLoading('rephrase-btn', true);
  
  const messageData = {
    action: 'rephraseText',
    data: {
      content: selectedText
    }
  };
  
  console.log('📤 Sending message to background script:', messageData);
  
  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.error('❌ Extension context invalidated. chrome.runtime.id is undefined');
    tooltipManager.showError('Extension needs reload. Please refresh the page.');
    return;
  }
  
  console.log('✅ Extension context is valid, sending message...');
  
  chrome.runtime.sendMessage(messageData, (response) => {
    console.log('📥 Received response from background script:', response);
    
    // Reset button state
    tooltipManager.setButtonLoading('rephrase-btn', false);
    
    // Check for context invalidation
    if (chrome.runtime.lastError) {
      console.error('Runtime error:', chrome.runtime.lastError.message);
      tooltipManager.showError('Extension context lost. Please refresh the page.');
      return;
    }
    
    try {
      if (response?.success && response.data?.alternatives?.length > 0) {
        // Show voice options in tooltip
        tooltipManager.showRephraseOptions(response.data.alternatives);
        console.log('Voice options received:', response.data.alternatives);
      } else if (response?.success && response.data?.rephrased) {
        // If no alternatives but has rephrased text, show it as single option
        tooltipManager.showRephraseOptions([response.data.rephrased]);
        console.log('Voice text received:', response.data.rephrased);
      } else {
        console.error('Voice failed:', response?.error);
        tooltipManager.showError(response?.error || 'Voice failed. Please try again.');
      }
    } catch (error) {
      console.error('Voice error:', error);
      tooltipManager.showError('Error processing voice results.');
    }
  });
}

// Handle translate action
function handleTranslate() {
  console.log('🌐 Translate button clicked');
  console.log('Selected text:', selectedText);

  if (!selectedText) {
    console.error('❌ No selected text available');
    return;
  }

  // Set loading state
  tooltipManager.setButtonLoading('translate-btn', true);

  // Get language preference from storage
  chrome.storage.sync.get(['translationLanguage'], (result) => {
    const targetLanguage = result.translationLanguage || DEFAULT_LANGUAGE;
    console.log('Using translation language:', targetLanguage);

    const messageData = {
      action: 'translateText',
      data: {
        content: selectedText,
        targetLanguage: targetLanguage
      }
    };

    console.log('📤 Sending message to background script:', messageData);

    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.error('❌ Extension context invalidated. chrome.runtime.id is undefined');
      tooltipManager.showError('Extension needs reload. Please refresh the page.');
      return;
    }

    console.log('✅ Extension context is valid, sending message...');

    chrome.runtime.sendMessage(messageData, (response) => {
      console.log('📥 Received response from background script:', response);

      // Reset button state
      tooltipManager.setButtonLoading('translate-btn', false);

      // Check for context invalidation
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError.message);
        tooltipManager.showError('Extension context lost. Please refresh the page.');
        return;
      }

      try {
        if (response?.success && response.data?.translated) {
          // Show translated text as single option
          tooltipManager.showRephraseOptions([response.data.translated]);
          console.log('Translated text received:', response.data.translated);
        } else {
          console.error('Translation failed:', response?.error);
          tooltipManager.showError(response?.error || 'Translation failed. Please try again.');
        }
      } catch (error) {
        console.error('Translation error:', error);
        tooltipManager.showError('Error processing translation results.');
      }
    });
  });
}

// Handle synonym action
function handleSynonym() {
  console.log('📚 Synonym button clicked');
  console.log('Selected text:', selectedText);

  if (!selectedText) {
    console.error('❌ No selected text available');
    return;
  }

  // Set loading state
  tooltipManager.setButtonLoading('synonym-btn', true);

  const messageData = {
    action: 'findSynonyms',
    data: {
      content: selectedText
    }
  };

  console.log('📤 Sending message to background script:', messageData);

  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.error('❌ Extension context invalidated. chrome.runtime.id is undefined');
    tooltipManager.showError('Extension needs reload. Please refresh the page.');
    return;
  }

  console.log('✅ Extension context is valid, sending message...');

  chrome.runtime.sendMessage(messageData, (response) => {
    console.log('📥 Received response from background script:', response);

    // Reset button state
    tooltipManager.setButtonLoading('synonym-btn', false);

    // Check for context invalidation
    if (chrome.runtime.lastError) {
      console.error('Runtime error:', chrome.runtime.lastError.message);
      tooltipManager.showError('Extension context lost. Please refresh the page.');
      return;
    }

    try {
      if (response?.success && response.data?.synonyms?.length > 0) {
        // Show synonyms in a vertical list below the selection
        tooltipManager.showSynonyms(response.data.synonyms);
        console.log('Synonyms received:', response.data.synonyms);
      } else {
        console.error('Finding synonyms failed:', response?.error);
        tooltipManager.showError(response?.error || 'Could not find synonyms. Please try again.');
      }
    } catch (error) {
      console.error('Synonym error:', error);
      tooltipManager.showError('Error processing synonyms.');
    }
  });
}

// Handle simplify action (previously edit)
function handleEdit() {
  console.log('✏️ Simplify button clicked');
  console.log('Selected text:', selectedText);

  if (!selectedText) {
    console.error('❌ No selected text available');
    return;
  }

  // Set loading state
  tooltipManager.setButtonLoading('edit-btn', true);

  const messageData = {
    action: 'editText',
    data: {
      content: selectedText
    }
  };

  console.log('📤 Sending message to background script:', messageData);

  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.error('❌ Extension context invalidated. chrome.runtime.id is undefined');
    tooltipManager.showError('Extension needs reload. Please refresh the page.');
    return;
  }

  console.log('✅ Extension context is valid, sending message...');

  chrome.runtime.sendMessage(messageData, (response) => {
    console.log('📥 Received response from background script:', response);

    // Reset button state
    tooltipManager.setButtonLoading('edit-btn', false);

    // Check for context invalidation
    if (chrome.runtime.lastError) {
      console.error('Runtime error:', chrome.runtime.lastError.message);
      tooltipManager.showError('Extension context lost. Please refresh the page.');
      return;
    }

    try {
      if (response?.success && response.data?.edited) {
        // Show simplified text as single option
        tooltipManager.showRephraseOptions([response.data.edited]);
        console.log('Simplified text received:', response.data.edited);
      } else {
        console.error('Simplify failed:', response?.error);
        tooltipManager.showError(response?.error || 'Simplify failed. Please try again.');
      }
    } catch (error) {
      console.error('Simplify error:', error);
      tooltipManager.showError('Error processing simplify results.');
    }
  });
}

// Handle reply action
function handleReply() {
  console.log('💬 Reply button clicked');
  console.log('Selected text:', selectedText);

  if (!selectedText) {
    console.error('❌ No selected text available');
    return;
  }

  // Set loading state
  tooltipManager.setButtonLoading('reply-btn', true);

  const messageData = {
    action: 'replyText',
    data: {
      content: selectedText
    }
  };

  console.log('📤 Sending message to background script:', messageData);

  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.error('❌ Extension context invalidated. chrome.runtime.id is undefined');
    tooltipManager.showError('Extension needs reload. Please refresh the page.');
    return;
  }

  console.log('✅ Extension context is valid, sending message...');

  chrome.runtime.sendMessage(messageData, (response) => {
    console.log('📥 Received response from background script:', response);

    // Reset button state
    tooltipManager.setButtonLoading('reply-btn', false);

    // Check for context invalidation
    if (chrome.runtime.lastError) {
      console.error('Runtime error:', chrome.runtime.lastError.message);
      tooltipManager.showError('Extension context lost. Please refresh the page.');
      return;
    }

    try {
      if (response?.success && response.data?.reply) {
        // Show reply text as single option
        tooltipManager.showRephraseOptions([response.data.reply]);
        console.log('Reply text received:', response.data.reply);
      } else {
        console.error('Reply failed:', response?.error);
        tooltipManager.showError(response?.error || 'Reply failed. Please try again.');
      }
    } catch (error) {
      console.error('Reply error:', error);
      tooltipManager.showError('Error processing reply results.');
    }
  });
}


// Replace selected text with chosen option
async function replaceSelectedText(newText: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    console.warn('No selection to replace');
    return;
  }

  // Check if we're in Google Docs
  const isGoogleDocs = window.location.hostname === 'docs.google.com';

  if (isGoogleDocs) {
    // For Google Docs, use clipboard-based replacement
    try {
      // Copy the new text to clipboard
      await navigator.clipboard.writeText(newText);

      // Execute paste command (this works in Google Docs with user gesture)
      const success = document.execCommand('paste');

      if (success) {
        console.log('✅ Text replaced in Google Docs via clipboard');
        tooltipManager.showSuccess('Text replaced!');
      } else {
        console.warn('Paste command failed, trying insertText');
        // Fallback: try insertText
        document.execCommand('insertText', false, newText);
      }
    } catch (err) {
      console.error('Failed to replace text in Google Docs:', err);
      tooltipManager.showError('Failed to replace text');
    }
  } else {
    // For regular contenteditable or input elements
    const range = selection.getRangeAt(0);

    // Check if the selection is in an input or textarea
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      const start = activeElement.selectionStart || 0;
      const end = activeElement.selectionEnd || 0;
      const currentValue = activeElement.value;

      activeElement.value = currentValue.substring(0, start) + newText + currentValue.substring(end);
      activeElement.selectionStart = activeElement.selectionEnd = start + newText.length;

      console.log('✅ Text replaced in input/textarea');
    } else {
      // For contenteditable or regular DOM
      range.deleteContents();
      range.insertNode(document.createTextNode(newText));

      console.log('✅ Text replaced in contenteditable');
    }

    tooltipManager.showSuccess('Text replaced!');
  }
}

// REMOVED: handleSaveToNotes - No longer saving to writing_notes table
// Chrome extension now only uses note_content table via saveNoteContent action

// Handle translate action for native tooltip
function handleNativeTranslate() {
  console.log('🌐 Native Translate button clicked');

  // Prevent duplicate translation requests using DOM-based flag (shared across all content script instances)
  if (document.body.dataset.captureTranslating === 'true') {
    console.log('⚠️ Translation already in progress (DOM flag), ignoring duplicate request');
    return;
  }

  // Also check instance variable
  if (isTranslating) {
    console.log('⚠️ Translation already in progress (instance flag), ignoring duplicate request');
    return;
  }

  if (!nativeHighlightTooltip) {
    console.error('❌ Native tooltip not available');
    return;
  }

  // Get text from tooltip (stored when tooltip was created)
  const textToTranslate = nativeHighlightTooltip.getSelectedText();
  console.log('Selected text from tooltip:', textToTranslate);

  if (!textToTranslate) {
    console.error('❌ No selected text available');
    return;
  }

  // Set translating flags (both instance and DOM-based for cross-instance prevention)
  isTranslating = true;
  document.body.dataset.captureTranslating = 'true';
  console.log('🔒 Translation locked - set both instance and DOM flags');

  // Set loading state
  nativeHighlightTooltip.setLoading(true);

  // Get language preference from storage
  chrome.storage.sync.get(['translationLanguage'], (result) => {
    console.log('📦 [NATIVE TRANSLATE] Raw storage result:', result);
    console.log('📦 [NATIVE TRANSLATE] translationLanguage value:', result.translationLanguage);
    console.log('📦 [NATIVE TRANSLATE] Is undefined?:', result.translationLanguage === undefined);
    const targetLanguage = result.translationLanguage || DEFAULT_LANGUAGE;
    console.log('🌍 [NATIVE TRANSLATE] Final language to use:', targetLanguage);
    console.log('🌍 [NATIVE TRANSLATE] DEFAULT_LANGUAGE constant is:', DEFAULT_LANGUAGE);

    const messageData = {
      action: 'translateText',
      data: {
        content: textToTranslate,
        targetLanguage: targetLanguage
      }
    };

    console.log('📤 Sending message to background script:', messageData);

  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.error('❌ Extension context invalidated. chrome.runtime.id is undefined');
    isTranslating = false;
    document.body.dataset.captureTranslating = 'false';
    console.log('🔓 Translation unlocked (error case) - reset both flags');
    return;
  }

  console.log('✅ Extension context is valid, sending message...');

  chrome.runtime.sendMessage(messageData, (response) => {
    console.log('📥 Received response from background script:', response);

    // Reset translating flags (both instance and DOM)
    isTranslating = false;
    document.body.dataset.captureTranslating = 'false';
    console.log('🔓 Translation unlocked - reset both flags');

    // Reset button state
    if (nativeHighlightTooltip) {
      nativeHighlightTooltip.setLoading(false);
    }

    // Check for context invalidation
    if (chrome.runtime.lastError) {
      console.error('Runtime error:', chrome.runtime.lastError.message);
      return;
    }

    try {
      if (response?.success && response.data?.translated) {
        console.log('Translated text received:', response.data.translated);

        // Replace the text inline on the page with styled button
        const translatedText = response.data.translated;

        console.log('📝 [TRANSLATE] Translation received:', translatedText);
        console.log('📝 [TRANSLATE] Current selection exists:', !!currentSelection);
        console.log('📝 [TRANSLATE] Range count:', currentSelection?.rangeCount);

        // Try to restore selection and replace
        if (currentSelection && currentSelection.rangeCount > 0) {
          const range = currentSelection.getRangeAt(0);
          console.log('✅ [TRANSLATE] Using DOM replacement path');

          // Check if the selection is in an input or textarea
          const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
          if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            const start = activeElement.selectionStart || 0;
            const end = activeElement.selectionEnd || 0;
            const currentValue = activeElement.value;

            activeElement.value = currentValue.substring(0, start) + translatedText + currentValue.substring(end);
            activeElement.selectionStart = activeElement.selectionEnd = start + translatedText.length;

            console.log('✅ Text replaced in input/textarea');
          } else {
            // For contenteditable or regular DOM - create styled button
            range.deleteContents();

            // Check if it's a simple word-translation pair or a full sentence with inline translations
            const simpleMatch = translatedText.match(/^(.+?)\s*\((.+?)\)$/);

            if (simpleMatch) {
              // Single word translation: "word (中文)"
              const originalWord = simpleMatch[1].trim();
              const translation = simpleMatch[2].trim();

              // Create styled vocabulary button
              const vocabButton = createTranslationButton(originalWord, translation, textToTranslate);
              range.insertNode(vocabButton);
            } else {
              // Sentence translation with inline vocabulary: "text word1 (翻译1) more text word2 (翻译2)"
              // Create a document fragment with mixed text and buttons
              const fragment = createInlineTranslationFragment(translatedText, textToTranslate);
              range.insertNode(fragment);
            }

            console.log('✅ Text replaced in contenteditable/DOM');
          }

          // Hide the tooltip after replacement
          console.log('🔄 [TRANSLATE] Hiding tooltip after DOM replacement');
          hideNativeHighlightTooltip();
        } else {
          // Fallback: show in tooltip if we can't replace
          console.log('⚠️ [TRANSLATE] Using tooltip fallback path');
          if (nativeHighlightTooltip) {
            nativeHighlightTooltip.showTranslationResult(translatedText);
          }
        }
      } else {
        console.error('Translation failed:', response?.error);
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
  });
  });
}

// Create a document fragment with inline translation buttons for sentences
// Input: "The airline will cancel more flights to make sure they can efficiently (高效地) run..."
// Output: DocumentFragment with text nodes and yellow button elements mixed together
function createInlineTranslationFragment(translatedText: string, originalText: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  const regex = /([^\s(]+)\s*\(([^)]+)\)/g;
  let match;

  while ((match = regex.exec(translatedText)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const textBefore = translatedText.substring(lastIndex, match.index);
      fragment.appendChild(document.createTextNode(textBefore));
    }

    // Create yellow-highlighted button for the vocabulary
    const word = match[1].trim();
    const translation = match[2].trim();
    const vocabButton = createTranslationButton(word, translation, originalText);
    fragment.appendChild(vocabButton);

    lastIndex = regex.lastIndex;
  }

  // Add remaining text after the last match
  if (lastIndex < translatedText.length) {
    const textAfter = translatedText.substring(lastIndex);
    fragment.appendChild(document.createTextNode(textAfter));
  }

  return fragment;
}

// Create styled translation button (similar to vocabulary highlighting)
function createTranslationButton(originalWord: string, translation: string, originalText: string): HTMLElement {
  const vocabButton = document.createElement('button');
  vocabButton.setAttribute('data-word', originalWord);
  vocabButton.setAttribute('data-translation', translation);
  vocabButton.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border: 1.5px solid #d1d5db;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    vertical-align: middle;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    font-size: 13px;
    font-family: inherit;
  `;

  // English word (bold with yellow highlight)
  const englishWord = document.createElement('strong');
  englishWord.textContent = originalWord;
  englishWord.style.cssText = `
    font-weight: 700;
    background-color: #fef3c7;
    padding: 2px 4px;
    border-radius: 3px;
  `;

  // Chinese translation text
  const chineseText = document.createElement('span');
  chineseText.textContent = `(${translation})`;
  chineseText.style.cssText = `
    color: #6b7280;
    font-style: italic;
    font-size: 12px;
  `;

  // Checkmark icon (hidden by default)
  const checkmark = document.createElement('span');
  checkmark.style.cssText = `
    font-size: 14px;
    color: #10b981;
    display: none;
    font-weight: bold;
  `;
  checkmark.textContent = '✓';

  vocabButton.appendChild(englishWord);
  vocabButton.appendChild(chineseText);
  vocabButton.appendChild(checkmark);

  // Add hover effect
  vocabButton.addEventListener('mouseenter', () => {
    if (checkmark.style.display === 'none') {
      vocabButton.style.borderColor = '#9ca3af';
      vocabButton.style.background = '#f9fafb';
    }
  });
  vocabButton.addEventListener('mouseleave', () => {
    if (checkmark.style.display === 'none') {
      vocabButton.style.borderColor = '#d1d5db';
      vocabButton.style.background = 'white';
    }
  });

  // Add click handler to save to flashcard
  let isChecked = false;
  vocabButton.addEventListener('click', (e) => {
    e.stopPropagation();

    if (!isChecked) {
      // Mark as checked and save to flashcards
      isChecked = true;

      // Update UI
      vocabButton.style.background = '#f0fdf4'; // light green background
      vocabButton.style.borderColor = '#10b981'; // green border
      checkmark.style.display = 'inline';

      // Create flashcard
      const pageUrl = window.location.href;
      const backContent = translation;

      console.log('════════════════════════════════════════');
      console.log('💾 [CONTENT] Sending flashcard creation request');
      console.log('💾 [CONTENT] Word:', originalText);
      console.log('💾 [CONTENT] Translation:', backContent);
      console.log('💾 [CONTENT] Page URL:', pageUrl);
      console.log('════════════════════════════════════════');

      chrome.runtime.sendMessage({
        action: 'createFlashcard',
        data: {
          front: originalText, // Use the original selected text
          back: backContent,
          sourceUrl: pageUrl,
          tag: 'translation'
        }
      }, (response) => {
        if (response?.success) {
          console.log('✅ [CONTENT] Flashcard created successfully for:', originalText);
          console.log('✅ [CONTENT] Flashcard ID:', response.data?.id);
        } else {
          console.error('❌ [CONTENT] Failed to create flashcard:', response?.error);
          console.error('❌ [CONTENT] Word:', originalText);
        }
      });
    }
  });

  return vocabButton;
}

// Show native highlight tooltip (now just a dot)
function showNativeHighlightTooltip(selection: Selection) {
  // Prevent duplicate tooltips by checking if one already exists in the DOM
  const existingTooltip = document.getElementById('captur-native-highlight-tooltip');
  if (existingTooltip) {
    console.log('⚠️ Tooltip already exists in DOM, skipping duplicate creation');
    return;
  }

  // Also check instance variable
  if (nativeHighlightTooltip) {
    console.log('⚠️ Tooltip instance already exists, skipping duplicate creation');
    return;
  }

  // Store current selection for later use
  currentSelection = selection;

  // Create new tooltip dot
  nativeHighlightTooltip = new NativeHighlightTooltip({
    onTranslate: handleNativeTranslate
  });

  // Store the selected text in the tooltip
  nativeHighlightTooltip.setSelectedText(selectedText);

  const tooltipElement = nativeHighlightTooltip.create();
  document.body.appendChild(tooltipElement);
  nativeHighlightTooltip.position(selection);

  console.log('✅ Native tooltip dot shown at end of text:', selectedText);
}

// Hide native highlight tooltip
function hideNativeHighlightTooltip() {
  if (nativeHighlightTooltip) {
    nativeHighlightTooltip.destroy();
    nativeHighlightTooltip = null;
  }
}

// Update selection tracking on mouseup
document.addEventListener('mouseup', () => {
  console.log('Mouse up event detected - updating selection tracking');

  // Clear any existing timeout
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
  }

  // Small delay to ensure selection is complete
  selectionTimeout = window.setTimeout(() => {
    const selection = window.getSelection();
    const newSelectedText = selection?.toString().trim() || '';

    console.log('Text selection updated:', {
      selectedText: newSelectedText,
      length: newSelectedText.length,
      rangeCount: selection?.rangeCount || 0,
      selectionExists: !!selection
    });

    if (newSelectedText.length > 0 && selection && selection.rangeCount > 0) {
      console.log('✅ Text selected - showing native highlight tooltip');
      selectedText = newSelectedText;
      currentSelection = selection;

      // Show native highlight tooltip immediately
      showNativeHighlightTooltip(selection);
    } else {
      console.log('❌ No text selected');
      currentSelection = null;
      selectedText = '';
      hideNativeHighlightTooltip();
    }
  }, 100);
});

// Hide tooltip when clicking outside
document.addEventListener('mousedown', (e) => {
  const target = e.target as Node;

  // Check if clicking outside native highlight tooltip
  if (nativeHighlightTooltip && nativeHighlightTooltip.getElement()) {
    const tooltipElement = nativeHighlightTooltip.getElement();
    if (tooltipElement && !tooltipElement.contains(target)) {
      hideNativeHighlightTooltip();
      currentSelection = null;
      selectedText = '';
    }
  }

  // Check if clicking outside advanced tooltip (double-shift)
  if (tooltipManager && !tooltipManager.contains(target)) {
    tooltipManager.hide();
    // Only clear selection when clicking outside tooltip
    currentSelection = null;
    selectedText = '';
  }
  // Don't clear selection if clicking inside tooltip
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Show tooltip when Shift key is pressed twice with text selected
  if (e.key === 'Shift' && currentSelection && selectedText) {
    const currentTime = Date.now();
    const timeSinceLastShift = currentTime - lastShiftTime;

    if (timeSinceLastShift < DOUBLE_SHIFT_THRESHOLD) {
      console.log('Double Shift detected with text selected - showing advanced tooltip');
      // Hide native tooltip when showing advanced tooltip
      hideNativeHighlightTooltip();
      tooltipManager.show(currentSelection);
      lastShiftTime = 0; // Reset after successful double shift
    } else {
      console.log('First Shift pressed, waiting for second Shift');
      lastShiftTime = currentTime;
    }
  }
  
  // REMOVED: Ctrl+Shift+S keyboard shortcut for saveNote
  // Chrome extension no longer saves to writing_notes table
  
  // Hide tooltips on Escape
  if (e.key === 'Escape') {
    hideNativeHighlightTooltip();
    tooltipManager.hide();
  }
});

// Initialize the tooltip manager when the script loads
initializeTooltipManager();

// Detect YouTube URL changes (for SPA navigation)
function detectYouTubeUrlChange() {
  const newUrl = window.location.href;

  if (newUrl !== currentYouTubeUrl) {
    console.log('🔄 YouTube URL changed:', { from: currentYouTubeUrl, to: newUrl });
    currentYouTubeUrl = newUrl;

    // Check if this is a YouTube watch page
    const isYouTubeWatch = newUrl.includes('youtube.com/watch');

    if (isYouTubeWatch) {
      // Extract video ID from new URL
      const videoIdMatch = newUrl.match(/[?&]v=([^&]+)/);
      if (videoIdMatch) {
        const newVideoId = videoIdMatch[1];
        console.log('📺 New video detected:', newVideoId);

        // Clean up existing transcript box if it exists
        if (transcriptBoxInstance) {
          console.log('🧹 Cleaning up old transcript box for new video');
          transcriptBoxInstance.destroy();
          transcriptBoxInstance = null;
        }
      }
    } else {
      // Not on a watch page, clean up transcript box if exists
      if (transcriptBoxInstance) {
        console.log('🧹 Cleaning up transcript box (not on watch page)');
        transcriptBoxInstance.destroy();
        transcriptBoxInstance = null;
      }
    }
  }
}

// Listen for URL changes using multiple methods for YouTube SPA
// Method 1: Listen to popstate (back/forward navigation)
window.addEventListener('popstate', () => {
  console.log('🔙 Popstate event detected');
  detectYouTubeUrlChange();
});

// Method 2: Override pushState and replaceState to catch SPA navigation
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  originalPushState.apply(this, args);
  console.log('➡️ PushState detected');
  detectYouTubeUrlChange();
};

history.replaceState = function(...args) {
  originalReplaceState.apply(this, args);
  console.log('🔄 ReplaceState detected');
  detectYouTubeUrlChange();
};

// Method 3: YouTube-specific event (yt-navigate-finish)
document.addEventListener('yt-navigate-finish', () => {
  console.log('🎬 YouTube navigation finished');
  detectYouTubeUrlChange();
});

interface TranscriptSegment {
  text: string;
  start: number; // seconds
  duration: number;
}

interface TranscriptResponse {
  fullText: string;
  transcript: TranscriptSegment[];
}

// Fetch YouTube transcript via Supadata.ai API
// @ts-ignore - Function kept for future YouTube transcript feature
async function _fetchYouTubeTranscript(videoId: string): Promise<TranscriptResponse> {
  try {
    // Call our Vercel API endpoint which uses Supadata.ai
    // Use absolute URL for production, relative for local dev
    const apiUrl = window.location.hostname === 'localhost'
      ? `/api/youtube-transcript?videoId=${videoId}`
      : `https://www.captur.academy/api/youtube-transcript?videoId=${videoId}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch transcript');
    }

    const data = await response.json();

    if (!data.fullText || !data.transcript) {
      throw new Error('No transcript data returned');
    }

    return {
      fullText: data.fullText,
      transcript: data.transcript
    };
  } catch (error) {
    throw error;
  }
}

// YouTube transcript box functions
// @ts-ignore - Function kept for future YouTube transcript feature
function _showYouTubeTranscript(videoId: string) {
  console.log('🎬 showYouTubeTranscript called for videoId:', videoId);

  // Clean up existing instance
  if (transcriptBoxInstance) {
    console.log('🧹 Cleaning up existing transcript box');
    transcriptBoxInstance.destroy();
    transcriptBoxInstance = null;
  }

  // Detect if this is a Shorts video
  const isShorts = window.location.pathname.startsWith('/shorts/');

  // Create new TranscriptBox instance
  console.log('📦 Creating new TranscriptBox instance');
  transcriptBoxInstance = new TranscriptBox({
    videoId
  });

  // Get video element for syncing
  const videoElement = document.querySelector('video') as HTMLVideoElement;

  if (isShorts) {
    // For Shorts: position to the left of the video (not implemented yet with new TranscriptBox)
    // TODO: Add Shorts support to TranscriptBox class
    console.warn('⚠️ Shorts support not yet implemented with new TranscriptBox');
    return;
  }

  // Helper function to wait for elements and render transcript box
  const renderTranscriptBox = () => {
    // For regular videos: adjust layout to make video and transcript boxes equal width
    const videoPlayer = document.getElementById('player') || document.querySelector('#movie_player');
    const primaryColumn = document.querySelector('#primary');
    const secondaryColumn = document.querySelector('#secondary');

    if (!videoPlayer || !primaryColumn || !secondaryColumn) {
      console.warn('⚠️ YouTube elements not ready, will retry...', {
        hasPlayer: !!videoPlayer,
        hasPrimary: !!primaryColumn,
        hasSecondary: !!secondaryColumn
      });
      return false;
    }

    console.log('✅ YouTube elements found, rendering transcript box');

    // Adjust primary column (video side) to take 50% width
    const primaryInner = primaryColumn.querySelector('#primary-inner') || primaryColumn;
    (primaryInner as HTMLElement).style.maxWidth = '50%';
    (primaryInner as HTMLElement).style.width = '50%';

    // Adjust secondary column (recommendations side) to take 50% width
    (secondaryColumn as HTMLElement).style.maxWidth = '50%';
    (secondaryColumn as HTMLElement).style.width = '50%';
    (secondaryColumn as HTMLElement).style.marginLeft = '0px';

    // Get video dimensions to match height
    const videoRect = videoPlayer.getBoundingClientRect();
    transcriptBoxInstance!.updateHeight(videoRect.height);

    // Set video element for time sync
    if (videoElement) {
      transcriptBoxInstance!.setVideoElement(videoElement);
    }

    // Insert into DOM
    const secondaryInner = secondaryColumn.querySelector('#secondary-inner');
    if (secondaryInner) {
      secondaryInner.insertBefore(transcriptBoxInstance!.getElement(), secondaryInner.firstChild);
    } else {
      secondaryColumn.insertBefore(transcriptBoxInstance!.getElement(), secondaryColumn.firstChild);
    }

    console.log('✅ Transcript box successfully rendered');
    return true;
  };

  // Try to render immediately
  if (renderTranscriptBox()) {
    return;
  }

  // If not ready, retry with longer timeout
  let retryCount = 0;
  const maxRetries = 20; // Increased from 10 to 20
  const retryInterval = setInterval(() => {
    retryCount++;
    console.log(`🔄 Retry ${retryCount}/${maxRetries} to render transcript box...`);

    if (renderTranscriptBox()) {
      console.log('✅ Transcript box rendered successfully on retry', retryCount);
      clearInterval(retryInterval);
    } else if (retryCount >= maxRetries) {
      console.error('❌ Failed to render transcript box after max retries');
      console.error('❌ Missing elements:', {
        player: !!(document.getElementById('player') || document.querySelector('#movie_player')),
        primary: !!document.querySelector('#primary'),
        secondary: !!document.querySelector('#secondary')
      });
      alert('⚠️ Could not load transcript box. Please try refreshing the page or waiting for YouTube to fully load.');
      clearInterval(retryInterval);
    }
  }, 300); // Increased from 200ms to 300ms (total: 6 seconds)
}

// @ts-ignore - Function kept for future YouTube transcript feature
function _updateTranscriptBox(transcript: TranscriptSegment[]) {
  if (transcriptBoxInstance) {
    transcriptBoxInstance.setTranscript(transcript);
  }
}

// Export YouTube transcript function to window for sticky notes access
(window as any)._showYouTubeTranscript = _showYouTubeTranscript;

// Create floating widget with Generate and Load buttons
function createFloatingWidget() {
  console.log('🎯 Creating floating widget...');

  // Add spinner animation style if not already added
  if (!document.getElementById('captur-spinner-animation')) {
    const style = document.createElement('style');
    style.id = 'captur-spinner-animation';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Check if widget already exists
  const existing = document.getElementById('captur-floating-widget');
  if (existing) {
    console.log('✅ Widget already exists, skipping creation');
    return;
  }

  // Check if body exists
  if (!document.body) {
    console.warn('⚠️ document.body not ready yet, retrying in 100ms...');
    setTimeout(createFloatingWidget, 100);
    return;
  }

  console.log('📦 Creating widget element...');
  const widget = document.createElement('div');
  widget.id = 'captur-floating-widget';
  widget.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    left: 20px !important;
    display: flex !important;
    align-items: center !important;
    z-index: 2147483647 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  `;

  // Container for the teal dot
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'captur-widget-button';
  buttonContainer.style.cssText = `
    position: relative !important;
    display: flex !important;
  `;

  // Teal dot (main button)
  const generateBtn = document.createElement('button');
  generateBtn.id = 'captur-generate-btn';
  generateBtn.title = 'Click to generate notes, hover to show notes';
  generateBtn.textContent = '';

  generateBtn.style.cssText = `
    background: #62b3bd !important;
    border: none !important;
    padding: 0 !important;
    cursor: pointer !important;
    box-shadow: 0 4px 15px rgba(98, 179, 189, 0.3) !important;
    transition: all 0.3s ease !important;
    width: 16px !important;
    height: 16px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
  `;

  // Show sticky notes on hover
  buttonContainer.onmouseenter = () => {
    generateBtn.style.transform = 'translateY(-2px)';
    generateBtn.style.boxShadow = '0 6px 20px rgba(98, 179, 189, 0.4)';

    // Check if sticky notes already exist in DOM
    const existingStickyNotes = document.getElementById('captur-key-takeaways');

    if (existingStickyNotes) {
      // Sticky notes exist - just show them instantly
      existingStickyNotes.style.display = 'block';

      // Hide floating widget
      const floatingWidget = document.getElementById('captur-floating-widget');
      if (floatingWidget) {
        floatingWidget.style.display = 'none';
      }
    } else {
      // No sticky notes exist - show empty sticky notes immediately
      const currentUrl = window.location.href;

      // Load cached data and show sticky notes WITHOUT generating takeaways
      chrome.runtime.sendMessage({
        action: 'loadNoteContent',
        data: { url: currentUrl }
      }, (loadResponse) => {
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError.message);
          // Show empty sticky notes even if load fails
          showStickyNotes([], [], [], [], currentUrl, '', true);
        } else {
          const noteData = loadResponse?.success ? loadResponse.data : null;
          // Show sticky notes with cached data, no generation
          showStickyNotes(
            noteData?.takeAways || [],
            [],
            noteData?.reflections || [],
            noteData?.markedSentences || [],
            currentUrl,
            '',
            noteData?.takeAways ? false : true
          );
        }

        // Hide floating widget
        const floatingWidget = document.getElementById('captur-floating-widget');
        if (floatingWidget) {
          floatingWidget.style.display = 'none';
        }
      });
    }
  };

  buttonContainer.onmouseleave = () => {
    generateBtn.style.transform = 'translateY(0)';
    generateBtn.style.boxShadow = '0 4px 15px rgba(98, 179, 189, 0.3)';
  };

  // Teal dot is now non-clickable - only shows sticky notes on hover
  // Click handler removed - vocabulary generation moved to sticky notes tab
  // YouTube handling also moved to sticky notes tab

  buttonContainer.appendChild(generateBtn);
  widget.appendChild(buttonContainer);
  document.body.appendChild(widget);

  console.log('✅ Floating widget created and appended to body!');
  console.log('Widget position:', widget.style.position);
  console.log('Widget z-index:', widget.style.zIndex);
  console.log('Widget display:', widget.style.display);
  console.log('Widget visibility:', widget.style.visibility);

  // Right-click to show context menu with close option
  widget.oncontextmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Remove any existing context menu
    const existingMenu = document.getElementById('captur-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.id = 'captur-context-menu';
    contextMenu.style.cssText = `
      position: fixed !important;
      left: ${e.clientX}px !important;
      top: ${e.clientY}px !important;
      background: white !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 6px !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05) !important;
      z-index: 2147483648 !important;
      padding: 4px !important;
      min-width: 120px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;

    // Create close option
    const closeOption = document.createElement('div');
    closeOption.textContent = 'Close Widget';
    closeOption.style.cssText = `
      padding: 8px 12px !important;
      cursor: pointer !important;
      border-radius: 4px !important;
      font-size: 14px !important;
      color: #374151 !important;
      transition: all 0.2s !important;
    `;
    closeOption.onmouseover = () => {
      closeOption.style.background = '#f3f4f6';
    };
    closeOption.onmouseout = () => {
      closeOption.style.background = 'transparent';
    };
    closeOption.onclick = () => {
      // Stop observer to prevent recreation
      if (widgetObserver) {
        widgetObserver.disconnect();
        widgetObserver = null;
      }

      // Remove widget
      const widgetElement = document.getElementById('captur-floating-widget');
      if (widgetElement) {
        widgetElement.remove();
      }

      // Remove context menu
      contextMenu.remove();
    };

    contextMenu.appendChild(closeOption);
    document.body.appendChild(contextMenu);

    // Close menu when clicking outside
    const closeMenu = (event: MouseEvent) => {
      if (!contextMenu.contains(event.target as Node)) {
        contextMenu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 0);

    return false;
  };

  // Watch for widget removal and recreate if needed
  widgetObserver = new MutationObserver(() => {
    const widgetStillExists = document.getElementById('captur-floating-widget');
    if (!widgetStillExists) {
      console.warn('⚠️ Floating widget was removed! Recreating...');
      if (widgetObserver) {
        widgetObserver.disconnect();
      }
      setTimeout(createFloatingWidget, 100);
    }
  });

  // Observe the body for child removals
  widgetObserver.observe(document.body, {
    childList: true,
    subtree: false
  });
}

// Create floating widget on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingWidget);
} else {
  // DOM already loaded
  createFloatingWidget();
}