/**
 * NativeHighlightTooltip - Simple tooltip that shows immediately on text selection
 * with Highlight and Translate buttons
 */

export interface NativeHighlightTooltipOptions {
  onTranslate?: () => void;
}

export class NativeHighlightTooltip {
  private element: HTMLDivElement | null = null;
  private options: NativeHighlightTooltipOptions;
  private selectedText: string = '';

  constructor(options: NativeHighlightTooltipOptions = {}) {
    this.options = options;
  }

  setSelectedText(text: string): void {
    this.selectedText = text;
  }

  getSelectedText(): string {
    return this.selectedText;
  }

  create(): HTMLDivElement {
    const tooltip = document.createElement('div');
    tooltip.id = 'captur-native-highlight-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      z-index: 2147483647;
      width: 8px;
      height: 8px;
      background: #62b3bd;
      border-radius: 50%;
      cursor: pointer;
      opacity: 0;
      transition: all 0.2s ease-in-out;
      box-shadow: 0 2px 6px rgba(98, 179, 189, 0.4);
    `;

    // Trigger translation on hover
    tooltip.onmouseenter = () => {
      tooltip.style.transform = 'scale(1.2)';
      tooltip.style.boxShadow = '0 3px 8px rgba(98, 179, 189, 0.6)';

      // Trigger translation
      if (this.options.onTranslate) {
        this.options.onTranslate();
      }
    };

    tooltip.onmouseleave = () => {
      tooltip.style.transform = 'scale(1)';
      tooltip.style.boxShadow = '0 2px 6px rgba(98, 179, 189, 0.4)';
    };

    this.element = tooltip;
    return tooltip;
  }

  position(selection: Selection): void {
    if (!this.element) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position dot at the end of the selected text (right side, vertically centered)
    const top = rect.top + window.scrollY + (rect.height / 2) - 4; // Center vertically, -4 for half dot height
    const left = rect.right + window.scrollX + 4; // 4px gap from text

    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;

    // Fade in
    requestAnimationFrame(() => {
      if (this.element) {
        this.element.style.opacity = '1';
      }
    });
  }

  getElement(): HTMLDivElement | null {
    return this.element;
  }

  showTranslationResult(translatedText: string): void {
    if (!this.element) return;

    console.log('🎨 [TOOLTIP] showTranslationResult called');
    console.log('🎨 [TOOLTIP] Full translated text:', translatedText);

    // Clear current content
    this.element.innerHTML = '';
    this.element.style.cssText = `
      position: absolute;
      z-index: 2147483647;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(229, 231, 235, 0.8);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      opacity: 1;
      max-width: 500px;
    `;

    // Translation display container
    const translationContainer = document.createElement('div');
    translationContainer.style.cssText = `
      padding: 12px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 10px;
      line-height: 1.8;
      color: #374151;
      font-size: 14px;
    `;

    // Parse translation text to extract word-translation pairs
    const translationPairs = this.parseTranslationPairs(translatedText);

    console.log('🎨 [TOOLTIP] Parsed translation pairs:', translationPairs);
    console.log('🎨 [TOOLTIP] Number of pairs found:', translationPairs.length);

    if (translationPairs.length > 0) {
      console.log('✅ [TOOLTIP] Rendering text with highlighted translations');

      // Render the full text with highlighted vocabulary words
      this.renderHighlightedText(translatedText, translationContainer);
    } else {
      // Fallback: if parsing fails, use a text node
      console.log('⚠️ [TOOLTIP] No pairs found, using fallback text display');
      const fallbackText = document.createTextNode(translatedText);
      translationContainer.appendChild(fallbackText);
    }

    this.element.appendChild(translationContainer);

    console.log('✅ Translation result displayed');
  }

  /**
   * Render the full text with highlighted vocabulary translations
   */
  private renderHighlightedText(
    fullText: string,
    container: HTMLElement
  ): void {
    let lastIndex = 0;
    const regex = /([^\s(]+)\s*\(([^)]+)\)/g;
    let match;

    // Reset regex lastIndex
    regex.lastIndex = 0;

    while ((match = regex.exec(fullText)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const textBefore = fullText.substring(lastIndex, match.index);
        const textNode = document.createTextNode(textBefore);
        container.appendChild(textNode);
      }

      // Create yellow-highlighted button for the vocabulary
      const vocabButton = this.createTranslationButton(match[1].trim(), match[2].trim());
      container.appendChild(vocabButton);

      lastIndex = regex.lastIndex;
    }

    // Add remaining text after the last match
    if (lastIndex < fullText.length) {
      const textAfter = fullText.substring(lastIndex);
      const textNode = document.createTextNode(textAfter);
      container.appendChild(textNode);
    }
  }

  setLoading(isLoading: boolean): void {
    if (!this.element) return;

    // Change dot appearance during loading
    if (isLoading) {
      this.element.style.background = '#9ca3af'; // gray during loading
      this.element.style.cursor = 'wait';
    } else {
      this.element.style.background = '#62b3bd'; // teal when ready
      this.element.style.cursor = 'pointer';
    }
  }

  /**
   * Parse translation text to extract word-translation pairs
   * Format: "word (翻译) word2 (翻译2)" or just "translation"
   */
  private parseTranslationPairs(translatedText: string): Array<{ word: string; translation: string }> {
    const pairs: Array<{ word: string; translation: string }> = [];

    console.log('🔍 [PARSE] Starting to parse translation text');
    console.log('🔍 [PARSE] Input text:', translatedText);

    // Regex to match patterns like "word (translation)"
    const regex = /([^\s(]+)\s*\(([^)]+)\)/g;
    let match;
    let matchCount = 0;

    while ((match = regex.exec(translatedText)) !== null) {
      matchCount++;
      console.log(`🔍 [PARSE] Match #${matchCount}:`, match[0]);
      console.log(`  - Word: "${match[1]}"`);
      console.log(`  - Translation: "${match[2]}"`);

      pairs.push({
        word: match[1].trim(),
        translation: match[2].trim()
      });
    }

    console.log('🔍 [PARSE] Total matches found:', matchCount);
    console.log('🔍 [PARSE] Pairs extracted:', pairs);

    return pairs;
  }

  /**
   * Create a translation button with yellow highlight (matching single-word translation style)
   */
  private createTranslationButton(originalWord: string, translation: string): HTMLElement {
    const vocabButton = document.createElement('button');
    vocabButton.setAttribute('data-word', originalWord);
    vocabButton.setAttribute('data-translation', translation);
    vocabButton.style.cssText = `
      display: inline-flex !important;
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0 2px;
    `;

    // English word (bold with yellow highlight)
    const englishWord = document.createElement('strong');
    englishWord.textContent = originalWord;
    englishWord.style.cssText = `
      font-weight: 700 !important;
      background-color: #fef3c7 !important;
      padding: 2px 4px;
      border-radius: 3px;
      color: #000 !important;
    `;

    // Chinese translation text (if provided)
    if (translation) {
      const chineseText = document.createElement('em');
      chineseText.textContent = ` (${translation})`;
      chineseText.style.cssText = `
        color: #6b7280;
        font-style: italic;
        font-size: 12px;
      `;

      vocabButton.appendChild(englishWord);
      vocabButton.appendChild(chineseText);
    } else {
      vocabButton.appendChild(englishWord);
    }

    // Make button position relative for absolute positioning of checkmark
    vocabButton.style.position = 'relative';

    // Add hover effect
    let isChecked = false;
    vocabButton.addEventListener('mouseenter', () => {
      if (!isChecked) {
        vocabButton.style.borderColor = '#9ca3af';
        vocabButton.style.background = '#f9fafb';
      }
    });
    vocabButton.addEventListener('mouseleave', () => {
      if (!isChecked) {
        vocabButton.style.borderColor = '#d1d5db';
        vocabButton.style.background = 'white';
      }
    });

    // Add click handler to save to flashcard
    vocabButton.addEventListener('click', (e) => {
      e.stopPropagation();

      if (!isChecked) {
        // Mark as checked and save to flashcards
        isChecked = true;

        // Create and add checkmark icon (only when clicked to not affect textContent before)
        const checkmark = document.createElement('i');
        checkmark.style.cssText = `
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: #10b981;
          font-weight: bold;
          font-style: normal;
        `;
        checkmark.textContent = '✓';
        checkmark.setAttribute('aria-hidden', 'true');
        vocabButton.appendChild(checkmark);

        // Update UI
        vocabButton.style.background = '#f0fdf4'; // light green background
        vocabButton.style.borderColor = '#10b981'; // green border
        vocabButton.style.paddingRight = '24px'; // Make room for checkmark

        // Create flashcard
        const pageUrl = window.location.href;
        const backContent = translation || originalWord;

        console.log('════════════════════════════════════════');
        console.log('💾 [TOOLTIP] Sending flashcard creation request');
        console.log('💾 [TOOLTIP] Word:', originalWord);
        console.log('💾 [TOOLTIP] Translation:', backContent);
        console.log('💾 [TOOLTIP] Page URL:', pageUrl);
        console.log('════════════════════════════════════════');

        chrome.runtime.sendMessage({
          action: 'createFlashcard',
          data: {
            front: originalWord,
            back: backContent,
            sourceUrl: pageUrl,
            tag: 'translation'
          }
        }, (response) => {
          if (response && response.success) {
            console.log('✅ [TOOLTIP] Flashcard created successfully:', response.data);
          } else {
            console.error('❌ [TOOLTIP] Failed to create flashcard:', response);
          }
        });
      }
    });

    return vocabButton;
  }

  destroy(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
