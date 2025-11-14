export interface TooltipOptions {
  onRephrase?: () => void;
  onTranslate?: () => void;
  onSynonym?: () => void;
  onEdit?: () => void;
  onReply?: () => void;
  // REMOVED: onSave - no longer saving to writing_notes table
  onDestroy?: () => void;
}

// Color mapping for different mark types
const MARK_COLORS: Record<string, string> = {
  new_vocabulary: '#a5f3fc',          // cyan
  claim: '#bfdbfe',                   // blue
  interesting_expression: '#c4b5fd',  // purple
  hook: '#fca5a5',                    // red
  difficult_sentence: '#fef08a',      // yellow
  subject: '#86efac',                 // green (for subject in difficult sentence)
  predicate: '#fde047',               // yellow (for predicate in difficult sentence)
};

export class Tooltip {
  private element: HTMLElement | null = null;
  private options: TooltipOptions;
  private currentSelection: Range | null = null;
  private synonymsContainer: HTMLElement | null = null;

  constructor(options: TooltipOptions = {}) {
    this.options = options;
  }

  create(): HTMLElement {
    const tooltipEl = document.createElement('div');
    tooltipEl.id = 'daily-notes-tooltip';
    tooltipEl.innerHTML = this.getHTML();
    
    tooltipEl.style.cssText = `
      position: absolute;
      z-index: 10000;
      pointer-events: auto;
    `;
    
    this.element = tooltipEl;
    this.attachEventListeners();
    
    return tooltipEl;
  }

  private getHTML(): string {
    return `
      <div style="
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 12px;
        overflow: visible;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(229, 231, 235, 0.8);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
        font-size: 14px;
        position: relative;
        transition: all 200ms ease;
      ">
        <div style="
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0;
          position: relative;
          background: rgba(249, 250, 251, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: inset 0 0 0 1px rgba(229, 231, 235, 0.3);
        ">
          <div style="display: flex; align-items: center; gap: 0;">
            <button id="rephrase-btn" style="
              background: transparent;
              color: hsl(222.2 47.4% 11.2%);
              border: none;
              height: 28px;
              padding: 0 8px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 500;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: all 200ms ease;
              position: relative;
              white-space: nowrap;
            "
            onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
            onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none';"
            onmousedown="this.style.transform='scale(0.98)';"
            onmouseup="this.style.transform='scale(1)';">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
                <path d="m12 20-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              Voice
            </button>
            <button id="translate-btn" style="
              background: transparent;
              color: hsl(222.2 47.4% 11.2%);
              border: none;
              height: 28px;
              padding: 0 8px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 500;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: all 200ms ease;
              position: relative;
              white-space: nowrap;
            "
            onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
            onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none';"
            onmousedown="this.style.transform='scale(0.98)';"
            onmouseup="this.style.transform='scale(1)';">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
                <path d="M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4"/>
              </svg>
              Translate
            </button>
            <button id="synonym-btn" style="
              background: transparent;
              color: hsl(222.2 47.4% 11.2%);
              border: none;
              height: 28px;
              padding: 0 8px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 500;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: all 200ms ease;
              position: relative;
              white-space: nowrap;
            "
            onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
            onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none';"
            onmousedown="this.style.transform='scale(0.98)';"
            onmouseup="this.style.transform='scale(1)';">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
              Synonym
            </button>
            <button id="edit-btn" style="
              background: transparent;
              color: hsl(222.2 47.4% 11.2%);
              border: none;
              height: 28px;
              padding: 0 8px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 500;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: all 200ms ease;
              position: relative;
              white-space: nowrap;
            "
            onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
            onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none';"
            onmousedown="this.style.transform='scale(0.98)';"
            onmouseup="this.style.transform='scale(1)';">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Simplify
            </button>
            <button id="reply-btn" style="
              background: transparent;
              color: hsl(222.2 47.4% 11.2%);
              border: none;
              height: 28px;
              padding: 0 8px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 500;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: all 200ms ease;
              position: relative;
              white-space: nowrap;
            "
            onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
            onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none';"
            onmousedown="this.style.transform='scale(0.98)';"
            onmouseup="this.style.transform='scale(1)';">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              Reply
            </button>
            <div style="position: relative; display: inline-flex; align-items: center;">
              <button id="marks-btn" style="
                background: transparent;
                color: hsl(222.2 47.4% 11.2%);
                border: none;
                height: 32px;
                padding: 0 10px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 200ms ease;
                position: relative;
                white-space: nowrap;
              "
              onmouseover="this.style.backgroundColor='oklch(0.52 0.15 210)'; this.style.color='oklch(1 0 0)';"
              onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)';"
              onmousedown="this.style.transform='scale(0.98)';"
              onmouseup="this.style.transform='scale(1)';">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
                  <path d="M4 7h16M4 12h16M4 17h16"/>
                </svg>
                Marks
              </button>
              <div id="marks-dropdown" style="
                display: none;
                position: absolute;
                top: calc(100% - 4px);
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(229, 231, 235, 0.8);
                border-radius: 10px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
                padding: 6px;
                z-index: 10001;
                min-width: 200px;
              ">
                <button class="mark-option" data-mark="new_vocabulary" style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  width: 100%;
                  padding: 8px 12px;
                  background: transparent;
                  color: hsl(222.2 47.4% 11.2%);
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  text-align: left;
                  transition: all 200ms ease;
                "
                onmouseover="this.style.backgroundColor='oklch(0.52 0.15 210)'; this.style.color='oklch(1 0 0)';"
                onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)';">
                  <span style="width: 16px; height: 16px; border-radius: 3px; background: #a5f3fc; border: 1px solid rgba(0,0,0,0.1); flex-shrink: 0;"></span>
                  New Vocabulary
                </button>
                <button class="mark-option" data-mark="claim" style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  width: 100%;
                  padding: 8px 12px;
                  background: transparent;
                  color: hsl(222.2 47.4% 11.2%);
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  text-align: left;
                  transition: all 200ms ease;
                "
                onmouseover="this.style.backgroundColor='oklch(0.52 0.15 210)'; this.style.color='oklch(1 0 0)';"
                onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)';">
                  <span style="width: 16px; height: 16px; border-radius: 3px; background: #bfdbfe; border: 1px solid rgba(0,0,0,0.1); flex-shrink: 0;"></span>
                  Claim
                </button>
                <button class="mark-option" data-mark="interesting_expression" style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  width: 100%;
                  padding: 8px 12px;
                  background: transparent;
                  color: hsl(222.2 47.4% 11.2%);
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  text-align: left;
                  transition: all 200ms ease;
                "
                onmouseover="this.style.backgroundColor='oklch(0.52 0.15 210)'; this.style.color='oklch(1 0 0)';"
                onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)';">
                  <span style="width: 16px; height: 16px; border-radius: 3px; background: #c4b5fd; border: 1px solid rgba(0,0,0,0.1); flex-shrink: 0;"></span>
                  Interesting Expression
                </button>
                <button class="mark-option" data-mark="hook" style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  width: 100%;
                  padding: 8px 12px;
                  background: transparent;
                  color: hsl(222.2 47.4% 11.2%);
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  text-align: left;
                  transition: all 200ms ease;
                "
                onmouseover="this.style.backgroundColor='oklch(0.52 0.15 210)'; this.style.color='oklch(1 0 0)';"
                onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)';">
                  <span style="width: 16px; height: 16px; border-radius: 3px; background: #fca5a5; border: 1px solid rgba(0,0,0,0.1); flex-shrink: 0;"></span>
                  Hook
                </button>
                <button class="mark-option" data-mark="difficult_sentence" style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  width: 100%;
                  padding: 8px 12px;
                  background: transparent;
                  color: hsl(222.2 47.4% 11.2%);
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  text-align: left;
                  transition: all 200ms ease;
                "
                onmouseover="this.style.backgroundColor='oklch(0.52 0.15 210)'; this.style.color='oklch(1 0 0)';"
                onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)';">
                  <span style="width: 16px; height: 16px; border-radius: 3px; background: #fef08a; border: 1px solid rgba(0,0,0,0.1); flex-shrink: 0;"></span>
                  Difficult Sentence
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    if (!this.element) return;

    const rephraseBtn = this.element.querySelector('#rephrase-btn') as HTMLButtonElement;
    const translateBtn = this.element.querySelector('#translate-btn') as HTMLButtonElement;
    const synonymBtn = this.element.querySelector('#synonym-btn') as HTMLButtonElement;
    const editBtn = this.element.querySelector('#edit-btn') as HTMLButtonElement;
    const replyBtn = this.element.querySelector('#reply-btn') as HTMLButtonElement;
    const marksBtn = this.element.querySelector('#marks-btn') as HTMLButtonElement;
    const marksDropdown = this.element.querySelector('#marks-dropdown') as HTMLDivElement;
    // REMOVED: saveBtn - no longer needed

    if (rephraseBtn && this.options.onRephrase) {
      rephraseBtn.addEventListener('click', this.options.onRephrase);
    }

    if (translateBtn && this.options.onTranslate) {
      translateBtn.addEventListener('click', this.options.onTranslate);
    }

    if (synonymBtn && this.options.onSynonym) {
      synonymBtn.addEventListener('click', this.options.onSynonym);
    }

    if (editBtn && this.options.onEdit) {
      editBtn.addEventListener('click', this.options.onEdit);
    }

    if (replyBtn && this.options.onReply) {
      replyBtn.addEventListener('click', this.options.onReply);
    }

    // Marks dropdown hover behavior
    if (marksBtn && marksDropdown) {
      marksBtn.addEventListener('mouseenter', () => {
        marksDropdown.style.display = 'block';
      });

      const hideDropdown = () => {
        marksDropdown.style.display = 'none';
      };

      marksBtn.addEventListener('mouseleave', (e) => {
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!marksDropdown.contains(relatedTarget)) {
          hideDropdown();
        }
      });

      marksDropdown.addEventListener('mouseenter', () => {
        marksDropdown.style.display = 'block';
      });

      marksDropdown.addEventListener('mouseleave', (e) => {
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!marksBtn.contains(relatedTarget)) {
          hideDropdown();
        }
      });

      // Mark options
      const markOptions = marksDropdown.querySelectorAll('.mark-option');
      markOptions.forEach((option) => {
        option.addEventListener('click', async (e) => {
          e.stopPropagation();
          const markType = (option as HTMLElement).dataset.mark || '';

          // Get the selected text before highlighting
          const selection = window.getSelection();
          const selectedText = selection?.toString().trim();

          // Special handling for difficult_sentence - analyze subject and predicate
          if (markType === 'difficult_sentence' && selectedText) {
            marksDropdown.style.display = 'none';

            try {
              // Call API to analyze subject and predicate
              const response = await chrome.runtime.sendMessage({
                action: 'analyzeSubjectPredicate',
                data: { sentence: selectedText }
              });

              if (response.success && response.data) {
                // Highlight subject and predicate separately
                this.highlightSubjectPredicate(response.data.subject, response.data.predicate);

                // Add to marked sentences
                if ((window as any).addMarkedSentence) {
                  (window as any).addMarkedSentence(
                    `Subject: ${response.data.subject} | Predicate: ${response.data.predicate}`,
                    markType
                  );
                }
              } else {
                // Fallback to regular highlighting if analysis fails
                this.highlightSelection(markType);
                if (selectedText && (window as any).addMarkedSentence) {
                  (window as any).addMarkedSentence(selectedText, markType);
                }
              }
            } catch (error) {
              console.error('Failed to analyze sentence:', error);
              // Fallback to regular highlighting
              this.highlightSelection(markType);
              if (selectedText && (window as any).addMarkedSentence) {
                (window as any).addMarkedSentence(selectedText, markType);
              }
            }

            this.destroy();
          } else {
            // Regular marking for other types
            this.highlightSelection(markType);

            // Add to marked sentences in the takeaways card with category
            if (selectedText && (window as any).addMarkedSentence) {
              (window as any).addMarkedSentence(selectedText, markType);
            }

            marksDropdown.style.display = 'none';
            this.destroy();
          }
        });
      });
    }

    // REMOVED: saveBtn event listener - no longer needed
  }

  position(selection: Selection): void {
    if (!this.element) return;

    const range = selection.getRangeAt(0);
    this.currentSelection = range.cloneRange(); // Store the selection
    const rect = range.getBoundingClientRect();

    // Set minimum width to show all 7 buttons (increased from 180px to 520px)
    const minWidth = Math.max(rect.width, 520); // Wide enough for all buttons
    const tooltipContent = this.element.querySelector('div') as HTMLElement;
    if (tooltipContent) {
      tooltipContent.style.minWidth = `${minWidth}px`;
      tooltipContent.style.width = 'max-content'; // Allow content to determine width
    }

    // Position tooltip below the selection
    const top = rect.bottom + window.scrollY + 8;
    const left = rect.left + window.scrollX + (rect.width / 2) - (minWidth / 2); // Center tooltip

    // Ensure it stays on screen
    const rightEdge = left + minWidth;
    const screenWidth = window.innerWidth;
    const adjustedLeft = rightEdge > screenWidth - 10 ? screenWidth - minWidth - 10 : Math.max(10, left);

    this.element.style.top = `${top}px`;
    this.element.style.left = `${adjustedLeft}px`;

    // Add animation
    this.element.style.opacity = '0';
    this.element.style.transform = 'translateY(-4px)';
    setTimeout(() => {
      if (this.element) {
        this.element.style.opacity = '1';
        this.element.style.transform = 'translateY(0)';
      }
    }, 10);
  }

  updateContent(html: string): void {
    if (!this.element) return;
    
    const content = this.element.querySelector('div');
    if (content) {
      content.innerHTML = html;
    }
  }

  setButtonState(buttonId: string, text: string, disabled: boolean = false): void {
    if (!this.element) return;

    const button = this.element.querySelector(`#${buttonId}`) as HTMLButtonElement;
    if (button) {
      // REMOVED: save-btn handling - button no longer exists
      if (buttonId === 'translate-btn') {
        // For translate button, update text and icon
        const textContent = text === 'Translating...' ?
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05)); animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
          </svg>
          <style>@keyframes spin { to { transform: rotate(360deg); } }</style>` :
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
            <path d="M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4"/>
          </svg>`;

        button.innerHTML = `${textContent} ${text}`;
        button.disabled = disabled;
        button.style.opacity = disabled ? '0.5' : '1';
        button.style.cursor = disabled ? 'not-allowed' : 'pointer';
      } else if (buttonId === 'edit-btn') {
        // For simplify button, update text and icon
        const textContent = text === 'Simplifying...' ?
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05)); animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
          </svg>
          <style>@keyframes spin { to { transform: rotate(360deg); } }</style>` :
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>`;

        button.innerHTML = `${textContent} ${text}`;
        button.disabled = disabled;
        button.style.opacity = disabled ? '0.5' : '1';
        button.style.cursor = disabled ? 'not-allowed' : 'pointer';
      } else if (buttonId === 'synonym-btn') {
        // For synonym button, update text and icon
        const textContent = text === 'Finding...' ?
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05)); animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
          </svg>
          <style>@keyframes spin { to { transform: rotate(360deg); } }</style>` :
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>`;

        button.innerHTML = `${textContent} ${text}`;
        button.disabled = disabled;
        button.style.opacity = disabled ? '0.5' : '1';
        button.style.cursor = disabled ? 'not-allowed' : 'pointer';
      } else if (buttonId === 'reply-btn') {
        // For reply button, update text and icon
        const textContent = text === 'Replying...' ?
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05)); animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
          </svg>
          <style>@keyframes spin { to { transform: rotate(360deg); } }</style>` :
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>`;

        button.innerHTML = `${textContent} ${text}`;
        button.disabled = disabled;
        button.style.opacity = disabled ? '0.5' : '1';
        button.style.cursor = disabled ? 'not-allowed' : 'pointer';
      } else {
        // For voice button, update text and icon
        const textContent = text === 'Voicing...' ?
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05)); animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
          </svg>
          <style>@keyframes spin { to { transform: rotate(360deg); } }</style>` :
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
            <path d="m12 20-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>`;

        button.innerHTML = `${textContent} ${text}`;
        button.disabled = disabled;
        button.style.opacity = disabled ? '0.5' : '1';
        button.style.cursor = disabled ? 'not-allowed' : 'pointer';
      }
    }
  }

  contains(target: Node): boolean {
    return this.element ? this.element.contains(target) : false;
  }

  private highlightSelection(markType: string): void {
    if (!this.currentSelection) return;

    const color = MARK_COLORS[markType];
    if (!color) return;

    try {
      // Create a span element to wrap the selected text
      const mark = document.createElement('mark');
      mark.style.backgroundColor = color;
      mark.style.borderRadius = '2px';
      mark.style.padding = '2px 0';
      mark.dataset.markType = markType;

      // Wrap the selected content with the mark element
      this.currentSelection.surroundContents(mark);

      // Clear the selection
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      // If surroundContents fails (e.g., selection spans multiple elements),
      // use a different approach
      console.warn('Failed to highlight selection:', error);

      // Extract the contents and wrap them
      const fragment = this.currentSelection.extractContents();
      const mark = document.createElement('mark');
      mark.style.backgroundColor = color;
      mark.style.borderRadius = '2px';
      mark.style.padding = '2px 0';
      mark.dataset.markType = markType;
      mark.appendChild(fragment);
      this.currentSelection.insertNode(mark);

      // Clear the selection
      window.getSelection()?.removeAllRanges();
    }
  }

  private highlightSubjectPredicate(subject: string, predicate: string): void {
    if (!this.currentSelection) return;

    const selection = window.getSelection();
    if (!selection) return;

    try {
      const selectedText = this.currentSelection.toString();

      // Find subject and predicate positions in the selected text
      const subjectIndex = selectedText.indexOf(subject);
      const predicateIndex = selectedText.indexOf(predicate);

      if (subjectIndex === -1 || predicateIndex === -1) {
        console.warn('Could not find subject or predicate in selection');
        return;
      }

      // Create a container for the highlighted text
      const container = document.createElement('span');

      // Helper to add text parts
      const parts: Array<{text: string, type: 'subject' | 'predicate' | 'normal'}> = [];

      // Build parts array
      if (subjectIndex < predicateIndex) {
        // Subject comes first
        if (subjectIndex > 0) {
          parts.push({ text: selectedText.substring(0, subjectIndex), type: 'normal' });
        }
        parts.push({ text: subject, type: 'subject' });

        const betweenIndex = subjectIndex + subject.length;
        if (predicateIndex > betweenIndex) {
          parts.push({ text: selectedText.substring(betweenIndex, predicateIndex), type: 'normal' });
        }
        parts.push({ text: predicate, type: 'predicate' });

        const afterIndex = predicateIndex + predicate.length;
        if (afterIndex < selectedText.length) {
          parts.push({ text: selectedText.substring(afterIndex), type: 'normal' });
        }
      } else {
        // Predicate comes first
        if (predicateIndex > 0) {
          parts.push({ text: selectedText.substring(0, predicateIndex), type: 'normal' });
        }
        parts.push({ text: predicate, type: 'predicate' });

        const betweenIndex = predicateIndex + predicate.length;
        if (subjectIndex > betweenIndex) {
          parts.push({ text: selectedText.substring(betweenIndex, subjectIndex), type: 'normal' });
        }
        parts.push({ text: subject, type: 'subject' });

        const afterIndex = subjectIndex + subject.length;
        if (afterIndex < selectedText.length) {
          parts.push({ text: selectedText.substring(afterIndex), type: 'normal' });
        }
      }

      // Create elements for each part
      parts.forEach(part => {
        if (part.type === 'normal') {
          container.appendChild(document.createTextNode(part.text));
        } else {
          const mark = document.createElement('mark');
          mark.style.backgroundColor = MARK_COLORS[part.type];
          mark.style.borderRadius = '2px';
          mark.style.padding = '2px 0';
          mark.dataset.markType = part.type;
          mark.textContent = part.text;
          container.appendChild(mark);
        }
      });

      // Replace the selection with the highlighted container
      this.currentSelection.deleteContents();
      this.currentSelection.insertNode(container);

      // Clear the selection
      selection.removeAllRanges();
    } catch (error) {
      console.error('Failed to highlight subject/predicate:', error);
    }
  }

  showSynonyms(synonyms: string[]): void {
    if (!this.element || !this.currentSelection) return;

    // Remove existing synonyms container if any
    this.hideSynonyms();

    // Get the position of the selected text
    const rect = this.currentSelection.getBoundingClientRect();

    // Create synonyms container
    this.synonymsContainer = document.createElement('div');
    this.synonymsContainer.id = 'synonyms-container';
    this.synonymsContainer.style.cssText = `
      position: absolute;
      top: ${rect.bottom + window.scrollY + 48}px;
      left: ${rect.left + window.scrollX}px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(229, 231, 235, 0.8);
      border-radius: 10px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
      padding: 8px;
      z-index: 10002;
      min-width: 150px;
      max-width: 250px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
      font-size: 13px;
    `;

    // Add synonyms as a vertical list
    synonyms.forEach((synonym, index) => {
      const item = document.createElement('div');
      item.textContent = synonym;
      item.style.cssText = `
        padding: 6px 10px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 150ms ease;
        ${index < synonyms.length - 1 ? 'border-bottom: 1px solid rgba(0, 0, 0, 0.05);' : ''}
      `;
      item.onmouseover = () => {
        item.style.background = 'rgba(98, 179, 189, 0.15)';
        item.style.color = '#62b3bd';
        item.style.transform = 'translateX(4px)';
        item.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      };
      item.onmouseout = () => {
        item.style.background = 'transparent';
        item.style.color = 'hsl(222.2 47.4% 11.2%)';
        item.style.transform = 'translateX(0)';
        item.style.boxShadow = 'none';
      };
      this.synonymsContainer!.appendChild(item);
    });

    document.body.appendChild(this.synonymsContainer);
  }

  hideSynonyms(): void {
    if (this.synonymsContainer) {
      this.synonymsContainer.remove();
      this.synonymsContainer = null;
    }
  }

  destroy(): void {
    this.hideSynonyms();
    if (this.element) {
      this.element.remove();
      this.element = null;

      if (this.options.onDestroy) {
        this.options.onDestroy();
      }
    }
  }

  getElement(): HTMLElement | null {
    return this.element;
  }
}
