/**
 * Renders the Sticky Notes card on the page with 3 tabs
 */

import { showWritingNotes } from './WritingNotes';

// Storage for marked sentences with categories
interface MarkedSentence {
  text: string;
  category: string;
}

let markedSentences: MarkedSentence[] = [];

// Store checkbox states for vocabularies
const vocabCheckedStates = new Map<string, boolean>();

// Function to highlight vocabularies in the article
export function highlightVocabulariesInArticle(vocabularies: Array<{word: string, definition: string, chinese: string, sentence?: string}>) {
  console.log('🎨 Highlighting vocabularies:', vocabularies);

  // Get all text nodes in the article body
  const articleBody = document.body;

  vocabularies.forEach((vocab, index) => {
    const word = vocab.word;
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // For multi-word phrases, don't use word boundaries around the entire phrase
    // Instead, use word boundary only at start and end
    const regex = new RegExp(`(^|\\s)(${escapedWord})($|\\s|[.,!?;:])`, 'i');

    console.log(`🔍 Looking for "${word}"`);

    // Walk through all text nodes
    const walker = document.createTreeWalker(
      articleBody,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip nodes in script, style, and our own extension elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tagName = parent.tagName.toLowerCase();
          if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip our own extension elements
          if (parent.id === 'captur-key-takeaways' || parent.id === 'captur-floating-widget') {
            return NodeFilter.FILTER_REJECT;
          }

          // Check if text contains the word (case insensitive)
          const text = node.textContent || '';
          if (text.toLowerCase().includes(word.toLowerCase())) {
            return NodeFilter.FILTER_ACCEPT;
          }

          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    const nodesToProcess: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      nodesToProcess.push(node as Text);
    }

    console.log(`  Found ${nodesToProcess.length} text nodes containing "${word}"`);

    // Process nodes (limit to first occurrence only to avoid cluttering)
    let processedCount = 0;
    nodesToProcess.forEach(textNode => {
      if (processedCount >= 1) return; // Only highlight first occurrence

      const text = textNode.textContent || '';
      const match = text.match(regex);

      if (match && match.index !== undefined) {
        console.log(`  ✅ Matched "${word}" in text:`, text.substring(0, 100));

        const matchText = match[2]; // The actual word/phrase (group 2)
        const beforeText = text.substring(0, match.index + match[1].length);
        const afterText = text.substring(match.index + match[1].length + matchText.length);

        // Create wrapper span
        const wrapper = document.createElement('span');
        wrapper.style.cssText = 'position: relative; display: inline-block;';

        // Add text before match
        if (beforeText) wrapper.appendChild(document.createTextNode(beforeText));

        // Create clickable button with word + Chinese translation combined
        const vocabId = `article-vocab-${index}`;
        const vocabButton = document.createElement('button');
        vocabButton.id = vocabId;
        vocabButton.setAttribute('data-word', word);
        vocabButton.title = vocab.definition;
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

        // Add hover effect
        vocabButton.addEventListener('mouseenter', () => {
          if (!vocabCheckedStates.get(word)) {
            vocabButton.style.borderColor = '#9ca3af';
            vocabButton.style.background = '#f9fafb';
          }
        });
        vocabButton.addEventListener('mouseleave', () => {
          if (!vocabCheckedStates.get(word)) {
            vocabButton.style.borderColor = '#d1d5db';
            vocabButton.style.background = 'white';
          }
        });

        // English word (bold with yellow highlight - preserve original styling)
        const englishWord = document.createElement('strong');
        englishWord.textContent = matchText;
        englishWord.style.cssText = `
          font-weight: 700;
          background-color: #fef3c7;
          padding: 2px 4px;
          border-radius: 3px;
        `;

        // Chinese translation text
        const chineseText = document.createElement('span');
        chineseText.textContent = `(${vocab.chinese})`;
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

        // Add click handler - entire button is clickable
        vocabButton.addEventListener('click', (e) => {
          e.stopPropagation();
          const isChecked = vocabCheckedStates.get(word) || false;

          if (!isChecked) {
            // Mark as checked and save to flashcards
            vocabCheckedStates.set(word, true);

            // Update UI
            vocabButton.style.background = '#f0fdf4'; // light green background
            vocabButton.style.borderColor = '#10b981'; // green border
            checkmark.style.display = 'inline';

            // Create flashcard with sentence context
            const pageUrl = window.location.href;
            const backContent = vocab.sentence
              ? `${vocab.chinese}\n\n${vocab.definition}\n\nExample: ${vocab.sentence}`
              : `${vocab.chinese}\n\n${vocab.definition}`;

            chrome.runtime.sendMessage({
              action: 'createFlashcard',
              data: {
                front: word,
                back: backContent,
                sourceUrl: pageUrl,
                tag: 'vocabulary'
              }
            }, (response) => {
              if (response?.success) {
                console.log('✓ Flashcard created for:', word);
              } else {
                console.error('❌ Failed to create flashcard:', response?.error);
              }
            });
          }
          // Note: No uncheck - once added, stays checked
        });

        wrapper.appendChild(vocabButton);

        // Add text after match
        if (afterText) wrapper.appendChild(document.createTextNode(afterText));

        // Replace text node with wrapper
        textNode.parentNode?.replaceChild(wrapper, textNode);
        processedCount++;
      }
    });
  });

  console.log('✅ Vocabulary highlighting complete');
}

// Function to highlight marked sentences in the article
export function highlightMarkedSentencesInArticle(markedSentences: MarkedSentence[]) {
  console.log('🎨 Highlighting marked sentences:', markedSentences);

  // Category colors - matching the Tooltip mark colors
  const categoryColors: Record<string, string> = {
    new_vocabulary: '#a5f3fc',          // cyan
    claim: '#bfdbfe',                   // blue
    interesting_expression: '#c4b5fd',  // purple
    hook: '#fca5a5',                    // red
    difficult_sentence: '#fef08a',      // yellow
  };

  const articleBody = document.body;

  markedSentences.forEach((markedSentence) => {
    const sentence = markedSentence.text;
    const category = markedSentence.category;
    const color = categoryColors[category] || '#fef3c7'; // default to yellow

    console.log(`🔍 Looking for marked sentence: "${sentence.substring(0, 50)}..."`);

    // Walk through all text nodes
    const walker = document.createTreeWalker(
      articleBody,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tagName = parent.tagName.toLowerCase();
          if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip our own extension elements
          if (parent.id === 'captur-key-takeaways' || parent.id === 'captur-floating-widget') {
            return NodeFilter.FILTER_REJECT;
          }

          const text = node.textContent || '';
          if (text.includes(sentence)) {
            return NodeFilter.FILTER_ACCEPT;
          }

          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    const nodesToProcess: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      nodesToProcess.push(node as Text);
    }

    // Process nodes
    nodesToProcess.forEach(textNode => {
      const text = textNode.textContent || '';
      const index = text.indexOf(sentence);

      if (index !== -1) {
        const before = text.substring(0, index);
        const matchText = text.substring(index, index + sentence.length);
        const after = text.substring(index + sentence.length);

        const parent = textNode.parentNode;
        if (!parent) return;

        // Create highlighted span
        const highlightSpan = document.createElement('mark');
        highlightSpan.style.backgroundColor = color;
        highlightSpan.style.padding = '2px 4px';
        highlightSpan.style.borderRadius = '3px';
        highlightSpan.style.fontWeight = '500';
        highlightSpan.textContent = matchText;

        // Replace text node with highlighted version
        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(highlightSpan);
        if (after) fragment.appendChild(document.createTextNode(after));

        parent.replaceChild(fragment, textNode);
        console.log(`✅ Highlighted marked sentence in category: ${category}`);
      }
    });
  });

  console.log('✅ Marked sentences highlighting complete');
}

// Detect page type based on URL
type PageType = 'x_post' | 'youtube_video' | 'news_article' | 'product_page' | 'article';

function detectPageType(): PageType {
  const url = window.location.href;

  // Case 1: X (Twitter) post page
  if (url.match(/^https:\/\/x\.com\/[^\/]+\/status\//)) {
    return 'x_post';
  }

  // Case 2: YouTube video page
  if (url.startsWith('https://www.youtube.com/watch?v=')) {
    return 'youtube_video';
  }

  // Case 3: News sites (WSJ, NYT, etc.)
  if (url.match(/wsj\.com|nytimes\.com|washingtonpost\.com|reuters\.com|apnews\.com|bbc\.com\/news/)) {
    return 'news_article';
  }

  // Case 4: Product landing pages (common patterns)
  if (url.match(/\/pricing|\/features|\/product|\/demo|stripe\.com|notion\.so|linear\.app/)) {
    return 'product_page';
  }

  // Case 5: Everything else (articles, blogs, etc.)
  return 'article';
}

export async function showStickyNotes(
  takeaways: string[],
  vocabularies?: Array<{word: string, definition: string, chinese: string, sentence?: string}>,
  existingReflections?: string[],
  existingMarkedSentences?: MarkedSentence[],
  currentUrl?: string,
  pageContent?: string,
  needsGeneration?: boolean
) {
  // Detect page type
  const pageType = detectPageType();
  console.log('Page type detected:', pageType);

  // Store vocabularies globally for saving
  const difficultVocabularies = vocabularies || [];

  // Initialize with existing data if provided
  if (existingReflections && existingReflections.length > 0) {
    console.log('✅ Loading existing reflections:', existingReflections);
  }
  if (existingMarkedSentences && existingMarkedSentences.length > 0) {
    console.log('✅ Loading existing marked sentences:', existingMarkedSentences);
    markedSentences = existingMarkedSentences;
  }

  // Hide the floating widget when showing takeaways
  const floatingWidget = document.getElementById('captur-floating-widget');
  if (floatingWidget) {
    floatingWidget.style.display = 'none';
  }

  // Remove existing takeaways if any
  const existing = document.getElementById('captur-key-takeaways');
  if (existing) {
    existing.remove();
  }

  // State for reflections - initialize with existing reflections if available
  let loadedPrompts: string[] = existingReflections || [];

  // State for minimize
  let isMinimized = false;

  // Create the takeaways container
  const container = document.createElement('div');
  container.id = 'captur-key-takeaways';
  container.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    left: 20px !important;
    max-width: 380px !important;
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    color: #202124 !important;
    padding: 20px !important;
    border-radius: 12px !important;
    border: 1px solid rgba(229, 231, 235, 0.8) !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08) !important;
    z-index: 2147483647 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    animation: slideIn 0.3s ease-out !important;
  `;

  // Add animation keyframes
  if (!document.getElementById('captur-takeaways-style')) {
    const style = document.createElement('style');
    style.id = 'captur-takeaways-style';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Create header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  `;

  const title = document.createElement('h3');
  title.textContent = '✨ Key Takeaways';
  title.style.cssText = `
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #62b3bd;
  `;

  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 6px;
  `;

  // Write notes button - opens yellow note editor
  const writeNotesBtn = document.createElement('button');
  writeNotesBtn.innerHTML = '📋';
  writeNotesBtn.title = 'Open note editor';
  writeNotesBtn.style.cssText = `
    background: rgba(249, 250, 251, 0.9);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(229, 231, 235, 0.8);
    color: #6b7280;
    font-size: 16px;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  `;
  writeNotesBtn.onmouseover = () => {
    writeNotesBtn.style.background = 'rgba(243, 244, 246, 0.95)';
    writeNotesBtn.style.borderColor = 'rgba(209, 213, 219, 0.9)';
    writeNotesBtn.style.transform = 'translateY(-1px)';
    writeNotesBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  };
  writeNotesBtn.onmouseout = () => {
    writeNotesBtn.style.background = 'rgba(249, 250, 251, 0.9)';
    writeNotesBtn.style.borderColor = 'rgba(229, 231, 235, 0.8)';
    writeNotesBtn.style.transform = 'translateY(0)';
    writeNotesBtn.style.boxShadow = 'none';
  };
  writeNotesBtn.onclick = () => {
    console.log('📋 Write notes button clicked - opening WritingNotes');
    showWritingNotes(
      container,
      (content: string) => {
        // Add the content as the first item in the Reflect tab
        loadedPrompts.unshift(content);
        // Re-render prompts if Reflect tab is active
        renderPrompts(loadedPrompts);
        console.log('✓ Saved note to Reflect tab:', content);
        // Save to captur.academy
        saveStickyNoteToMiniflow();
      },
      {
        takeAways: takeawaysData,
        markedSentences: markedSentences.map(s => s.text)
      }
    );
  };

  // Minimize button
  const minimizeBtn = document.createElement('button');
  minimizeBtn.innerHTML = '−';
  minimizeBtn.title = 'Minimize';
  minimizeBtn.style.cssText = `
    background: rgba(249, 250, 251, 0.9);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(229, 231, 235, 0.8);
    color: #6b7280;
    font-size: 20px;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  `;
  minimizeBtn.onmouseover = () => {
    minimizeBtn.style.background = 'rgba(243, 244, 246, 0.95)';
    minimizeBtn.style.borderColor = 'rgba(209, 213, 219, 0.9)';
    minimizeBtn.style.transform = 'translateY(-1px)';
    minimizeBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  };
  minimizeBtn.onmouseout = () => {
    minimizeBtn.style.background = 'rgba(249, 250, 251, 0.9)';
    minimizeBtn.style.borderColor = 'rgba(229, 231, 235, 0.8)';
    minimizeBtn.style.transform = 'translateY(0)';
    minimizeBtn.style.boxShadow = 'none';
  };

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.title = 'Close';
  closeBtn.style.cssText = `
    background: rgba(249, 250, 251, 0.9);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(229, 231, 235, 0.8);
    color: #6b7280;
    font-size: 24px;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  `;
  closeBtn.onmouseover = () => {
    closeBtn.style.background = 'rgba(254, 226, 226, 0.95)';
    closeBtn.style.borderColor = 'rgba(252, 165, 165, 0.9)';
    closeBtn.style.color = '#dc2626';
    closeBtn.style.transform = 'translateY(-1px)';
    closeBtn.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.15)';
  };
  closeBtn.onmouseout = () => {
    closeBtn.style.background = 'rgba(249, 250, 251, 0.9)';
    closeBtn.style.borderColor = 'rgba(229, 231, 235, 0.8)';
    closeBtn.style.color = '#6b7280';
    closeBtn.style.transform = 'translateY(0)';
    closeBtn.style.boxShadow = 'none';
  };
  closeBtn.onclick = () => {
    container.remove();
    // Show the floating widget buttons again when takeaways are closed
    const floatingWidget = document.getElementById('captur-floating-widget');
    if (floatingWidget) {
      floatingWidget.style.display = 'flex';
    }
  };

  buttonContainer.appendChild(writeNotesBtn);
  buttonContainer.appendChild(minimizeBtn);
  buttonContainer.appendChild(closeBtn);

  header.appendChild(title);
  header.appendChild(buttonContainer);

  // Tab data - check if YouTube to add transcript tab
  const isYouTube = window.location.hostname.includes('youtube.com');

  let tabs: Array<{ id: string; label: string; icon: string }>;
  if (isYouTube) {
    tabs = [
      { id: 'vocabularies', label: 'Vocabularies', icon: '🔤' },
      { id: 'transcript', label: 'Transcript', icon: '📜' },
      { id: 'takeaways', label: 'Takeaways', icon: '📝' },
      { id: 'notes', label: 'Notes', icon: '📋' },
      { id: 'more', label: 'More', icon: '⚙️' }
    ];
  } else {
    tabs = [
      { id: 'vocabularies', label: 'Vocabularies', icon: '🔤' },
      { id: 'takeaways', label: 'Takeaways', icon: '📝' },
      { id: 'notes', label: 'Notes', icon: '📋' },
      { id: 'more', label: 'More', icon: '⚙️' }
    ];
  }

  let activeTab = 'vocabularies'; // Default to vocabularies tab
  const tabContents: { [key: string]: HTMLDivElement } = {};

  // Create horizontal tabs container
  const tabsContainer = document.createElement('div');
  tabsContainer.style.cssText = `
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(229, 231, 235, 0.6);
    padding-bottom: 8px;
  `;

  // Create horizontal tab buttons
  const tabButtons: { [key: string]: HTMLButtonElement } = {};

  tabs.forEach((tab) => {
    const tabBtn = document.createElement('button');
    tabBtn.textContent = `${tab.icon}`;
    tabBtn.title = tab.label;
    tabBtn.style.cssText = `
      flex: 1;
      padding: 8px 4px;
      background: ${tab.id === activeTab ? 'rgba(98, 179, 189, 0.15)' : 'transparent'};
      border: none;
      border-bottom: 2px solid ${tab.id === activeTab ? '#62b3bd' : 'transparent'};
      color: ${tab.id === activeTab ? '#62b3bd' : '#6b7280'};
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 4px 4px 0 0;
    `;

    tabBtn.onclick = () => {
      // Update active tab
      activeTab = tab.id;

      // Update all tab button styles
      tabs.forEach(t => {
        const btn = tabButtons[t.id];
        const isActive = t.id === activeTab;
        btn.style.background = isActive ? 'rgba(98, 179, 189, 0.15)' : 'transparent';
        btn.style.borderBottomColor = isActive ? '#62b3bd' : 'transparent';
        btn.style.color = isActive ? '#62b3bd' : '#6b7280';
      });

      // Update content visibility
      Object.keys(tabContents).forEach(key => {
        tabContents[key].style.display = key === tab.id ? 'block' : 'none';
      });

      // Lazy load takeaways when Takeaways tab is clicked
      if (tab.id === 'takeaways' && needsGeneration && takeawaysData.length === 0) {
        (window as any).__generateTakeaways?.();
      }
    };

    tabBtn.onmouseover = () => {
      if (tab.id !== activeTab) {
        tabBtn.style.background = 'rgba(243, 244, 246, 0.5)';
      }
    };

    tabBtn.onmouseout = () => {
      if (tab.id !== activeTab) {
        tabBtn.style.background = 'transparent';
      }
    };

    tabButtons[tab.id] = tabBtn;
    tabsContainer.appendChild(tabBtn);
  });

  // Create tab content containers
  const contentContainer = document.createElement('div');
  contentContainer.style.cssText = `
    max-height: 300px;
    overflow-y: auto;
  `;

  // Tab 0: Vocabularies
  const vocabulariesContent = document.createElement('div');
  vocabulariesContent.style.display = 'block'; // Default active tab

  // Function to render vocabularies
  function renderVocabularies(vocabList: Array<{word: string, definition: string, chinese: string, sentence?: string}>) {
    vocabulariesContent.innerHTML = '';

    if (vocabList.length === 0) {
      // Show "Generate Vocabularies" button
      const generateBtn = document.createElement('button');
      generateBtn.textContent = '🔤 Generate Difficult Vocabularies';
      generateBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #62b3bd 0%, #4a9aa8 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(98, 179, 189, 0.3);
      `;

      generateBtn.onmouseover = () => {
        generateBtn.style.transform = 'translateY(-2px)';
        generateBtn.style.boxShadow = '0 6px 16px rgba(98, 179, 189, 0.4)';
      };

      generateBtn.onmouseout = () => {
        generateBtn.style.transform = 'translateY(0)';
        generateBtn.style.boxShadow = '0 4px 12px rgba(98, 179, 189, 0.3)';
      };

      generateBtn.onclick = async () => {
        console.log('🔤 Generating vocabularies...');
        generateBtn.textContent = '⏳ Generating...';
        generateBtn.disabled = true;

        try {
          // Get page content for vocabulary generation
          const pageContent = document.body.innerText;

          // Send message to background script
          chrome.runtime.sendMessage(
            {
              action: 'generateVocabularies',
              data: { content: pageContent }
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error('Chrome runtime error:', chrome.runtime.lastError);
                alert('❌ Failed to generate vocabularies: Extension error');
                generateBtn.textContent = '🔤 Generate Difficult Vocabularies';
                generateBtn.disabled = false;
                return;
              }

              if (response && response.success && response.vocabularies) {
                console.log('✅ Vocabularies generated:', response.vocabularies);

                // Update the vocabularies array
                difficultVocabularies.length = 0;
                response.vocabularies.forEach((vocab: any) => {
                  difficultVocabularies.push({
                    word: vocab.word,
                    definition: vocab.definition,
                    chinese: vocab.chinese,
                    sentence: vocab.sentence
                  });
                });

                // Re-render to show the list
                renderVocabularies(difficultVocabularies);

                // Save to captur.academy
                saveStickyNoteToMiniflow();
              } else {
                console.error('Failed to generate vocabularies:', response?.error);
                alert(`❌ Failed to generate vocabularies: ${response?.error || 'Unknown error'}`);
                generateBtn.textContent = '🔤 Generate Difficult Vocabularies';
                generateBtn.disabled = false;
              }
            }
          );
        } catch (error) {
          console.error('Error generating vocabularies:', error);
          alert('❌ Failed to generate vocabularies');
          generateBtn.textContent = '🔤 Generate Difficult Vocabularies';
          generateBtn.disabled = false;
        }
      };

      vocabulariesContent.appendChild(generateBtn);
      return;
    }

    // Display vocabulary list
    const list = document.createElement('div');
    list.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    vocabList.forEach((vocab) => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 10px;
        background: rgba(249, 250, 251, 0.8);
        border-radius: 6px;
        border: 1px solid rgba(229, 231, 235, 0.6);
        transition: all 0.2s;
      `;

      item.innerHTML = `
        <div style="font-weight: 600; color: #202124; margin-bottom: 4px;">${vocab.word}</div>
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">${vocab.definition}</div>
        <div style="font-size: 12px; color: #9ca3af; font-style: italic;">${vocab.chinese}</div>
      `;

      item.onmouseover = () => {
        item.style.background = 'rgba(243, 244, 246, 0.95)';
        item.style.transform = 'translateX(4px)';
      };

      item.onmouseout = () => {
        item.style.background = 'rgba(249, 250, 251, 0.8)';
        item.style.transform = 'translateX(0)';
      };

      list.appendChild(item);
    });

    vocabulariesContent.appendChild(list);
  }

  // Initial render
  renderVocabularies(difficultVocabularies);

  // Register vocabularies tab
  tabContents['vocabularies'] = vocabulariesContent;

  // Tab 1: Transcript (YouTube only)
  let transcriptContent: HTMLDivElement | null = null;

  if (isYouTube) {
    transcriptContent = document.createElement('div');
    transcriptContent.style.display = activeTab === 'transcript' ? 'block' : 'none';

    function renderTranscript() {
      if (!transcriptContent) return;

      transcriptContent.innerHTML = '';

      const loadBtn = document.createElement('button');
      loadBtn.textContent = '📜 Load YouTube Transcript';
      loadBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #62b3bd 0%, #4a9aa8 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(98, 179, 189, 0.3);
      `;

      loadBtn.onmouseover = () => {
        loadBtn.style.transform = 'translateY(-2px)';
        loadBtn.style.boxShadow = '0 6px 16px rgba(98, 179, 189, 0.4)';
      };

      loadBtn.onmouseout = () => {
        loadBtn.style.transform = 'translateY(0)';
        loadBtn.style.boxShadow = '0 4px 12px rgba(98, 179, 189, 0.3)';
      };

      loadBtn.onclick = () => {
        // Extract video ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get('v') || window.location.pathname.split('/').pop();

        if (videoId) {
          loadBtn.textContent = '⏳ Loading transcript...';
          loadBtn.disabled = true;

          // Call the _showYouTubeTranscript function
          if (typeof (window as any)._showYouTubeTranscript === 'function') {
            (window as any)._showYouTubeTranscript(videoId);
          } else {
            alert('❌ Transcript feature not available');
            loadBtn.textContent = '📜 Load YouTube Transcript';
            loadBtn.disabled = false;
          }
        } else {
          alert('❌ Could not extract video ID from URL');
        }
      };

      transcriptContent.appendChild(loadBtn);
    }

    renderTranscript();
    tabContents['transcript'] = transcriptContent;
  }

  // Tab 2: Takeaways
  const takeawaysContent = document.createElement('div');
  takeawaysContent.style.display = 'none';

  // State for takeaways loading
  let takeawaysData = takeaways;
  let isLoadingTakeaways = false;

  // Function to render takeaways
  function renderTakeaways(takeawaysList: string[]) {
    takeawaysContent.innerHTML = '';

    if (takeawaysList.length === 0) {
      const placeholderDiv = document.createElement('div');
      placeholderDiv.style.cssText = `
        padding: 16px;
        text-align: center;
        font-size: 13px;
        color: #9ca3af;
        font-style: italic;
        ${needsGeneration ? 'cursor: pointer;' : ''}
      `;
      placeholderDiv.textContent = needsGeneration ? 'Click here to generate takeaways...' : 'No takeaways available.';

      if (needsGeneration) {
        placeholderDiv.onclick = () => {
          generateTakeaways();
        };
        placeholderDiv.onmouseover = () => {
          placeholderDiv.style.color = '#62b3bd';
        };
        placeholderDiv.onmouseout = () => {
          placeholderDiv.style.color = '#9ca3af';
        };
      }

      takeawaysContent.appendChild(placeholderDiv);
      return;
    }

    const list = document.createElement('ol');
    list.style.cssText = `
      margin: 0;
      padding-left: 18px;
      list-style: decimal;
    `;

    takeawaysList.forEach((takeaway) => {
      const li = document.createElement('li');
      const processedHtml = takeaway.replace(
        /([a-zA-Z][\w\s'-]*?)\s*\(([^\)]+)\)/g,
        '<strong style="color: #202124;">$1</strong> <span style="color: #6b7280; font-size: 12px; font-style: italic;">($2)</span>'
      );
      li.innerHTML = processedHtml;
      li.style.cssText = `
        margin-bottom: 12px;
        line-height: 1.6;
        font-size: 14px;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
        padding: 8px;
        border-radius: 6px;
      `;

      li.onmouseover = () => {
        li.style.background = 'rgba(249, 250, 251, 0.8)';
        li.style.transform = 'translateX(4px)';
        li.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      };
      li.onmouseout = () => {
        li.style.background = 'transparent';
        li.style.transform = 'translateX(0)';
        li.style.boxShadow = 'none';
      };

      list.appendChild(li);
    });

    takeawaysContent.appendChild(list);
  }

  // Function to show loading state
  function showTakeawaysLoading() {
    takeawaysContent.innerHTML = '';

    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      gap: 12px;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 32px;
      height: 32px;
      border: 3px solid #e5e7eb;
      border-top-color: #62b3bd;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    const loadingText = document.createElement('p');
    loadingText.textContent = 'Generating takeaways...';
    loadingText.style.cssText = `
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    `;

    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(loadingText);
    takeawaysContent.appendChild(loadingDiv);

    // Add spinner animation if not already added
    if (!document.getElementById('captur-spinner-style')) {
      const style = document.createElement('style');
      style.id = 'captur-spinner-style';
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Function to generate takeaways
  async function generateTakeaways() {
    if (isLoadingTakeaways || !needsGeneration || !pageContent || !currentUrl) return;

    isLoadingTakeaways = true;
    showTakeawaysLoading();

    // Detect page type
    let pageType = 'article';
    if (currentUrl.match(/^https:\/\/x\.com\/[^\/]+\/status\//)) {
      pageType = 'x_post';
    }

    chrome.runtime.sendMessage({
      action: 'generateTakeaways',
      data: { content: pageContent, pageType }
    }, (response) => {
      isLoadingTakeaways = false;

      if (response?.success && response.takeaways) {
        takeawaysData = response.takeaways;
        needsGeneration = false;
        renderTakeaways(takeawaysData);
        // Save to database
        saveStickyNoteToMiniflow();
      } else {
        takeawaysContent.innerHTML = '';
        const errorDiv = document.createElement('p');
        errorDiv.textContent = 'Failed to generate takeaways. Please try again.';
        errorDiv.style.cssText = `
          margin: 0;
          padding: 16px;
          text-align: center;
          font-size: 13px;
          color: #dc2626;
        `;
        takeawaysContent.appendChild(errorDiv);
      }
    });
  }

  // Initial render
  renderTakeaways(takeawaysData);

  // Expose generateTakeaways for tab click handler
  (window as any).__generateTakeaways = generateTakeaways;

  tabContents['takeaways'] = takeawaysContent;

  // Tab 2: Reflections (user notes only)
  const promptsContent = document.createElement('div');
  promptsContent.style.display = 'none';

  // Function to render reflections
  function renderPrompts(prompts: string[]) {
    promptsContent.innerHTML = '';

    if (prompts.length === 0) {
      const emptyState = document.createElement('p');
      emptyState.textContent = 'No reflections yet. Use the note editor (📋) to write your thoughts.';
      emptyState.style.cssText = `
        margin: 0;
        padding: 16px;
        text-align: center;
        font-size: 13px;
        color: #9ca3af;
        font-style: italic;
      `;
      promptsContent.appendChild(emptyState);
      return;
    }

    const promptsList = document.createElement('ul');
    promptsList.style.cssText = `
      margin: 0;
      padding-left: 0;
      list-style: none;
    `;

    prompts.forEach((prompt) => {
      const li = document.createElement('li');
      li.textContent = `💡 ${prompt}`;
      li.style.cssText = `
        margin-bottom: 12px;
        line-height: 1.6;
        font-size: 14px;
        color: #374151;
        padding: 12px;
        background: rgba(249, 250, 251, 0.9);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(229, 231, 235, 0.8);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
      `;

      li.onmouseover = () => {
        li.style.background = 'rgba(243, 244, 246, 0.95)';
        li.style.borderColor = 'rgba(209, 213, 219, 0.9)';
        li.style.transform = 'translateY(-2px)';
        li.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      };
      li.onmouseout = () => {
        li.style.background = 'rgba(249, 250, 251, 0.9)';
        li.style.borderColor = 'rgba(229, 231, 235, 0.8)';
        li.style.transform = 'translateY(0)';
        li.style.boxShadow = 'none';
      };

      promptsList.appendChild(li);
    });

    promptsContent.appendChild(promptsList);
  }

  // Initialize with existing reflections
  renderPrompts(loadedPrompts);

  tabContents['prompts'] = promptsContent;

  // Tab 3: Marked Sentences
  const markedContent = document.createElement('div');
  markedContent.style.display = 'none';

  function renderMarkedSentences() {
    markedContent.innerHTML = '';

    if (markedSentences.length === 0) {
      const emptyState = document.createElement('p');
      emptyState.textContent = 'No marked sentences yet. Select text and use "Marks" to categorize and save it here.';
      emptyState.style.cssText = `
        margin: 0;
        padding: 16px;
        text-align: center;
        font-size: 13px;
        color: #9ca3af;
        font-style: italic;
      `;
      markedContent.appendChild(emptyState);
    } else {
      // Group sentences by category
      const categories = ['new_vocabulary', 'claim', 'interesting_expression', 'hook', 'difficult_sentence'];
      const categoryLabels: Record<string, string> = {
        new_vocabulary: 'New Vocabulary',
        claim: 'Claim',
        interesting_expression: 'Interesting Expression',
        hook: 'Hook',
        difficult_sentence: 'Difficult Sentence',
      };

      categories.forEach(category => {
        const sentencesInCategory = markedSentences.filter(s => s.category === category);
        if (sentencesInCategory.length === 0) return;

        // Category header
        const categoryHeader = document.createElement('h4');
        categoryHeader.textContent = categoryLabels[category];
        categoryHeader.style.cssText = `
          margin: 16px 0 8px 0;
          font-size: 12px;
          font-weight: 600;
          color: #62b3bd;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        `;
        markedContent.appendChild(categoryHeader);

        // Category list
        const categoryList = document.createElement('ul');
        categoryList.style.cssText = `
          margin: 0 0 8px 0;
          padding-left: 0;
          list-style: none;
        `;

        sentencesInCategory.forEach((markedSentence) => {
          const li = document.createElement('li');
          li.style.cssText = `
            margin-bottom: 10px;
            line-height: 1.6;
            font-size: 13px;
            padding: 10px;
            background: rgba(249, 250, 251, 0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(229, 231, 235, 0.8);
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: start;
            gap: 8px;
            transition: all 0.2s;
          `;

          const text = document.createElement('span');
          text.textContent = markedSentence.text;
          text.style.cssText = `
            flex: 1;
            color: #374151;
          `;

          const buttonContainer = document.createElement('div');
          buttonContainer.style.cssText = `
            display: flex;
            gap: 4px;
            flex-shrink: 0;
          `;

          // Copy button
          const copyBtn = document.createElement('button');
          copyBtn.innerHTML = '📋';
          copyBtn.title = 'Copy';
          copyBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(229, 231, 235, 0.8);
            color: #6b7280;
            font-size: 14px;
            cursor: pointer;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
          `;

          copyBtn.onclick = async () => {
            try {
              await navigator.clipboard.writeText(markedSentence.text);
              copyBtn.innerHTML = '✅';
              setTimeout(() => {
                copyBtn.innerHTML = '📋';
              }, 1500);
            } catch (err) {
              console.error('Failed to copy:', err);
              copyBtn.innerHTML = '❌';
              setTimeout(() => {
                copyBtn.innerHTML = '📋';
              }, 1500);
            }
          };

          copyBtn.onmouseover = () => {
            copyBtn.style.background = 'rgba(243, 244, 246, 0.95)';
            copyBtn.style.borderColor = 'rgba(209, 213, 219, 0.9)';
            copyBtn.style.transform = 'scale(1.05)';
            copyBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          };
          copyBtn.onmouseout = () => {
            copyBtn.style.background = 'rgba(255, 255, 255, 0.9)';
            copyBtn.style.borderColor = 'rgba(229, 231, 235, 0.8)';
            copyBtn.style.transform = 'scale(1)';
            copyBtn.style.boxShadow = 'none';
          };

          // Remove button
          const removeBtn = document.createElement('button');
          removeBtn.innerHTML = '×';
          removeBtn.title = 'Remove';
          removeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(229, 231, 235, 0.8);
            color: #6b7280;
            font-size: 18px;
            cursor: pointer;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
          `;

          removeBtn.onclick = () => {
            const index = markedSentences.indexOf(markedSentence);
            if (index > -1) {
              markedSentences.splice(index, 1);
              renderMarkedSentences();
              // Save to captur.academy when marked sentence is removed
              saveStickyNoteToMiniflow();
            }
          };

          removeBtn.onmouseover = () => {
            removeBtn.style.background = 'rgba(254, 226, 226, 0.95)';
            removeBtn.style.borderColor = 'rgba(252, 165, 165, 0.9)';
            removeBtn.style.color = '#dc2626';
            removeBtn.style.transform = 'scale(1.05)';
            removeBtn.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.15)';
          };
          removeBtn.onmouseout = () => {
            removeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
            removeBtn.style.borderColor = 'rgba(229, 231, 235, 0.8)';
            removeBtn.style.color = '#6b7280';
            removeBtn.style.transform = 'scale(1)';
            removeBtn.style.boxShadow = 'none';
          };

          buttonContainer.appendChild(copyBtn);
          buttonContainer.appendChild(removeBtn);

          li.appendChild(text);
          li.appendChild(buttonContainer);
          categoryList.appendChild(li);
        });

        markedContent.appendChild(categoryList);
      });
    }
  }

  renderMarkedSentences();
  tabContents['marked'] = markedContent;

  // Tab 2: Notes (combines marked sentences + reflections)
  const notesContent = document.createElement('div');
  notesContent.style.display = 'none';

  function renderNotes() {
    notesContent.innerHTML = '';

    // Section 1: Reflections
    const reflectionsSection = document.createElement('div');
    reflectionsSection.style.cssText = `
      margin-bottom: 20px;
    `;

    const reflectionsHeader = document.createElement('h4');
    reflectionsHeader.textContent = '💡 Reflections';
    reflectionsHeader.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 13px;
      font-weight: 600;
      color: #62b3bd;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    `;
    reflectionsSection.appendChild(reflectionsHeader);

    if (loadedPrompts.length === 0) {
      const emptyState = document.createElement('p');
      emptyState.textContent = 'No reflections yet. Use the note editor (📋) to write your thoughts.';
      emptyState.style.cssText = `
        margin: 0 0 16px 0;
        padding: 16px;
        text-align: center;
        font-size: 13px;
        color: #9ca3af;
        font-style: italic;
        background: rgba(249, 250, 251, 0.5);
        border-radius: 8px;
      `;
      reflectionsSection.appendChild(emptyState);
    } else {
      const promptsList = document.createElement('ul');
      promptsList.style.cssText = `
        margin: 0;
        padding-left: 0;
        list-style: none;
      `;

      loadedPrompts.forEach((prompt) => {
        const li = document.createElement('li');
        li.textContent = `💡 ${prompt}`;
        li.style.cssText = `
          margin-bottom: 12px;
          line-height: 1.6;
          font-size: 14px;
          color: #374151;
          padding: 12px;
          background: rgba(249, 250, 251, 0.9);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(229, 231, 235, 0.8);
          border-radius: 10px;
          transition: all 0.2s;
        `;
        promptsList.appendChild(li);
      });

      reflectionsSection.appendChild(promptsList);
    }

    notesContent.appendChild(reflectionsSection);

    // Section 2: Marked Sentences
    const markedSection = document.createElement('div');

    const markedHeader = document.createElement('h4');
    markedHeader.textContent = '📌 Marked Sentences';
    markedHeader.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 13px;
      font-weight: 600;
      color: #62b3bd;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    `;
    markedSection.appendChild(markedHeader);

    if (markedSentences.length === 0) {
      const emptyState = document.createElement('p');
      emptyState.textContent = 'No marked sentences yet. Select text and use "Marks" to categorize and save it here.';
      emptyState.style.cssText = `
        margin: 0;
        padding: 16px;
        text-align: center;
        font-size: 13px;
        color: #9ca3af;
        font-style: italic;
        background: rgba(249, 250, 251, 0.5);
        border-radius: 8px;
      `;
      markedSection.appendChild(emptyState);
    } else {
      // Group sentences by category
      const categories = ['new_vocabulary', 'claim', 'interesting_expression', 'hook', 'difficult_sentence'];
      const categoryLabels: Record<string, string> = {
        new_vocabulary: 'New Vocabulary',
        claim: 'Claim',
        interesting_expression: 'Interesting Expression',
        hook: 'Hook',
        difficult_sentence: 'Difficult Sentence',
      };

      categories.forEach(category => {
        const sentencesInCategory = markedSentences.filter(s => s.category === category);
        if (sentencesInCategory.length === 0) return;

        // Category subheader
        const categoryHeader = document.createElement('h5');
        categoryHeader.textContent = categoryLabels[category];
        categoryHeader.style.cssText = `
          margin: 16px 0 8px 0;
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        `;
        markedSection.appendChild(categoryHeader);

        // Category list
        const categoryList = document.createElement('ul');
        categoryList.style.cssText = `
          margin: 0 0 8px 0;
          padding-left: 0;
          list-style: none;
        `;

        sentencesInCategory.forEach((markedSentence) => {
          const li = document.createElement('li');
          li.style.cssText = `
            margin-bottom: 10px;
            line-height: 1.6;
            font-size: 13px;
            padding: 10px;
            background: rgba(249, 250, 251, 0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(229, 231, 235, 0.8);
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: start;
            gap: 8px;
            transition: all 0.2s;
          `;

          const text = document.createElement('span');
          text.textContent = markedSentence.text;
          text.style.cssText = `
            flex: 1;
            color: #374151;
          `;

          const removeBtn = document.createElement('button');
          removeBtn.innerHTML = '×';
          removeBtn.title = 'Remove';
          removeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(229, 231, 235, 0.8);
            color: #6b7280;
            font-size: 18px;
            cursor: pointer;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
          `;

          removeBtn.onclick = () => {
            const index = markedSentences.indexOf(markedSentence);
            if (index > -1) {
              markedSentences.splice(index, 1);
              renderNotes();
              renderMarkedSentences(); // Keep original also updated
              saveStickyNoteToMiniflow();
            }
          };

          removeBtn.onmouseover = () => {
            removeBtn.style.background = 'rgba(254, 226, 226, 0.95)';
            removeBtn.style.borderColor = 'rgba(252, 165, 165, 0.9)';
            removeBtn.style.color = '#dc2626';
            removeBtn.style.transform = 'scale(1.05)';
            removeBtn.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.15)';
          };
          removeBtn.onmouseout = () => {
            removeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
            removeBtn.style.borderColor = 'rgba(229, 231, 235, 0.8)';
            removeBtn.style.color = '#6b7280';
            removeBtn.style.transform = 'scale(1)';
            removeBtn.style.boxShadow = 'none';
          };

          li.appendChild(text);
          li.appendChild(removeBtn);
          categoryList.appendChild(li);
        });

        markedSection.appendChild(categoryList);
      });
    }

    notesContent.appendChild(markedSection);
  }

  // Initial render
  renderNotes();

  // Register notes tab
  tabContents['notes'] = notesContent;

  // Expose renderNotes for updates when marked sentences are added
  (window as any).__renderNotes = renderNotes;

  // Tab 3: More (settings and actions)
  const moreContent = document.createElement('div');
  moreContent.style.display = 'none';

  function renderMore() {
    moreContent.innerHTML = '';

    // Settings section
    const settingsSection = document.createElement('div');
    settingsSection.style.cssText = `
      margin-bottom: 20px;
    `;

    const settingsHeader = document.createElement('h4');
    settingsHeader.textContent = '⚙️ Settings';
    settingsHeader.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 13px;
      font-weight: 600;
      color: #62b3bd;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    `;
    settingsSection.appendChild(settingsHeader);

    // Clear all data button
    const clearAllBtn = document.createElement('button');
    clearAllBtn.textContent = '🗑️ Clear All Data';
    clearAllBtn.style.cssText = `
      width: 100%;
      padding: 10px 12px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.9);
      color: #dc2626;
      border: 1px solid rgba(252, 165, 165, 0.5);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    `;

    clearAllBtn.onclick = () => {
      if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        // Clear arrays by emptying them (not reassigning)
        difficultVocabularies.length = 0;
        takeawaysData.length = 0;
        markedSentences.length = 0;
        loadedPrompts.length = 0;

        renderVocabularies(difficultVocabularies);
        renderTakeaways(takeawaysData);
        renderNotes();
        renderMarkedSentences();

        saveStickyNoteToMiniflow();
        alert('✅ All data cleared successfully');
      }
    };

    clearAllBtn.onmouseover = () => {
      clearAllBtn.style.background = 'rgba(254, 226, 226, 0.95)';
      clearAllBtn.style.borderColor = 'rgba(252, 165, 165, 0.9)';
      clearAllBtn.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.15)';
    };

    clearAllBtn.onmouseout = () => {
      clearAllBtn.style.background = 'rgba(255, 255, 255, 0.9)';
      clearAllBtn.style.borderColor = 'rgba(252, 165, 165, 0.5)';
      clearAllBtn.style.boxShadow = 'none';
    };

    settingsSection.appendChild(clearAllBtn);

    // Export data button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '📥 Export All Data';
    exportBtn.style.cssText = `
      width: 100%;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.9);
      color: #374151;
      border: 1px solid rgba(229, 231, 235, 0.8);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    `;

    exportBtn.onclick = () => {
      const exportData = {
        url: window.location.href,
        vocabularies: difficultVocabularies,
        takeaways: takeawaysData,
        reflections: loadedPrompts,
        markedSentences: markedSentences,
        exportedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `captur-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    };

    exportBtn.onmouseover = () => {
      exportBtn.style.background = 'rgba(243, 244, 246, 0.95)';
      exportBtn.style.borderColor = 'rgba(209, 213, 219, 0.9)';
      exportBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
    };

    exportBtn.onmouseout = () => {
      exportBtn.style.background = 'rgba(255, 255, 255, 0.9)';
      exportBtn.style.borderColor = 'rgba(229, 231, 235, 0.8)';
      exportBtn.style.boxShadow = 'none';
    };

    settingsSection.appendChild(exportBtn);

    moreContent.appendChild(settingsSection);

    // Info section
    const infoSection = document.createElement('div');

    const infoHeader = document.createElement('h4');
    infoHeader.textContent = 'ℹ️ About';
    infoHeader.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 13px;
      font-weight: 600;
      color: #62b3bd;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    `;
    infoSection.appendChild(infoHeader);

    const infoText = document.createElement('p');
    infoText.innerHTML = `
      <strong>Captur Extension v1.0.6</strong><br>
      <span style="font-size: 12px; color: #6b7280;">Capture and learn vocabulary from any webpage</span>
    `;
    infoText.style.cssText = `
      margin: 0;
      padding: 12px;
      font-size: 13px;
      color: #374151;
      background: rgba(249, 250, 251, 0.5);
      border-radius: 8px;
      line-height: 1.6;
    `;
    infoSection.appendChild(infoText);

    moreContent.appendChild(infoSection);
  }

  // Initial render
  renderMore();

  // Register more tab
  tabContents['more'] = moreContent;

  // Append everything
  contentContainer.appendChild(vocabulariesContent);
  if (transcriptContent) {
    contentContainer.appendChild(transcriptContent);
  }
  contentContainer.appendChild(takeawaysContent);
  contentContainer.appendChild(notesContent);
  contentContainer.appendChild(moreContent);
  contentContainer.appendChild(markedContent);
  contentContainer.appendChild(promptsContent);

  // Add minimize functionality
  minimizeBtn.onclick = () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      tabsContainer.style.display = 'none';
      contentContainer.style.display = 'none';
      minimizeBtn.innerHTML = '+';
      minimizeBtn.title = 'Expand';
    } else {
      tabsContainer.style.display = 'flex';
      contentContainer.style.display = 'block';
      minimizeBtn.innerHTML = '−';
      minimizeBtn.title = 'Minimize';
    }
  };

  container.appendChild(header);
  container.appendChild(tabsContainer);
  container.appendChild(contentContainer);
  document.body.appendChild(container);

  // Expose function to add marked sentences
  (window as any).addMarkedSentence = (sentence: string, category: string = 'hook') => {
    const exists = markedSentences.some(s => s.text === sentence && s.category === category);
    if (!exists) {
      markedSentences.push({ text: sentence, category });
      renderMarkedSentences();
      renderNotes(); // Update combined notes tab
      // Save to captur.academy when marked sentence is added
      saveStickyNoteToMiniflow();
    }
  };

  // Function to save sticky note to captur.academy
  function saveStickyNoteToMiniflow() {
    // Get page URL
    const pageUrl = window.location.href;

    // Build the complete note content
    let noteContent = `# URL\n\n${pageUrl}\n\n`;

    // Add takeaways
    noteContent += '# Key Takeaways\n\n';
    takeaways.forEach((takeaway, index) => {
      noteContent += `${index + 1}. ${takeaway}\n`;
    });
    noteContent += '\n';

    // Add reflections if loaded
    if (loadedPrompts && loadedPrompts.length > 0) {
      noteContent += '# Reflections\n\n';
      loadedPrompts.forEach((prompt, index) => {
        noteContent += `${index + 1}. ${prompt}\n`;
      });
      noteContent += '\n';
    }

    // Add marked sentences
    if (markedSentences.length > 0) {
      noteContent += '# Marked Sentences\n\n';
      const categories = [
        'new_vocabulary', 'claim', 'interesting_expression', 'hook', 'difficult_sentence'
      ];

      categories.forEach(category => {
        const sentences = markedSentences.filter(s => s.category === category);
        if (sentences.length > 0) {
          const categoryLabel = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          noteContent += `## ${categoryLabel}\n`;
          sentences.forEach(s => {
            noteContent += `- ${s.text}\n`;
          });
          noteContent += '\n';
        }
      });
    }

    // Save structured data to noteContent table
    chrome.runtime.sendMessage({
      action: 'saveNoteContent',
      data: {
        url: pageUrl,
        takeAways: takeawaysData,
        reflections: loadedPrompts || [],
        markedSentences: markedSentences,
        difficultVocabularies: difficultVocabularies.map(v => v.word), // Save just the english words
        tags: [pageType] // Use detected page type as tag
      }
    }, (response) => {
      if (response?.success) {
        console.log('✓ Structured note content saved successfully');
      } else {
        console.error('❌ Failed to save structured note content:', response?.error);
      }
    });
  }

  // Auto-save sticky note when takeaways are generated
  saveStickyNoteToMiniflow();
}
