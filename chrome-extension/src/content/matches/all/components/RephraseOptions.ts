export interface RephraseOptionsConfig {
  options: string[];
  maxWidth?: number;
  onSelect?: (option: string, index: number) => void;
  onCancel?: () => void;
  onCopy?: (text: string) => void;
  onRephrase?: (text: string) => void;
  onTranslate?: (text: string) => void;
  onEdit?: (text: string) => void;
  onReply?: (text: string) => void;
}

export class RephraseOptions {
  private config: RephraseOptionsConfig;

  constructor(config: RephraseOptionsConfig) {
    this.config = config;
  }

  render(): string {
    const maxWidth = this.config.maxWidth || 600;
    const optionsHtml = this.config.options.map((option, index) => {
      // Format the option text - highlight Chinese translations in parentheses
      const formattedOption = this.formatWithTranslations(option);

      return `
      <button class="rephrase-option" data-index="${index}" style="
        display: block;
        width: 100%;
        padding: 8px 12px;
        background: transparent;
        color: hsl(222.2 47.4% 11.2%);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-family: Calibri, 'Segoe UI', Tahoma, sans-serif;
        font-size: 11pt;
        text-align: left;
        line-height: 2;
        word-wrap: break-word;
        transition: all 200ms ease;
        margin: 0;
        margin-bottom: 0;
        position: relative;
        font-weight: 400;
        white-space: pre-wrap;
        box-shadow: inset 0 0 0 1px hsl(214.3 31.8% 91.4%);
        box-sizing: border-box;
        overflow-wrap: break-word;
        hyphens: auto;
      "
      onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.1)'; this.style.boxShadow='inset 0 0 0 1px rgba(98, 179, 189, 0.3)'; this.style.transform='translateX(4px)'; this.style.color='#62b3bd';"
      onmouseout="this.style.backgroundColor='transparent'; this.style.boxShadow='inset 0 0 0 1px hsl(214.3 31.8% 91.4%)'; this.style.transform='translateX(0)'; this.style.color='hsl(222.2 47.4% 11.2%)';"
      onmousedown="this.style.transform='scale(0.98)';"
      onmouseup="this.style.transform='scale(1)';">
        ${formattedOption}
      </button>
    `;
    }).join('<div style="height: 4px;"></div>');
    
    return `
      <div style="
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(229, 231, 235, 0.8);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        max-width: ${maxWidth}px;
        width: max-content;
      ">
        <div style="
          padding: 4px;
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
            <button id="rephrase-result-btn" style="
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
            <button id="translate-result-btn" style="
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
            onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
            onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none';"
            onmousedown="this.style.transform='scale(0.98)';"
            onmouseup="this.style.transform='scale(1)';">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
                <path d="M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4"/>
              </svg>
              Translate
            </button>
            <button id="edit-result-btn" style="
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
            <button id="reply-result-btn" style="
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
            onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
            onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none';"
            onmousedown="this.style.transform='scale(0.98)';"
            onmouseup="this.style.transform='scale(1)';">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              Reply
            </button>
            <button id="marks-result-btn" style="
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
            onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
            onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none';"
            onmousedown="this.style.transform='scale(0.98)';"
            onmouseup="this.style.transform='scale(1)';">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
                <path d="M4 7h16M4 12h16M4 17h16"/>
              </svg>
              Marks
            </button>
            <div id="marks-result-dropdown" style="
              display: none;
              position: absolute;
              top: 40px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              padding: 4px;
              z-index: 10001;
              min-width: 180px;
            ">
              <button class="mark-result-option" data-mark="thesis" style="
                display: block;
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
              onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateX(4px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
              onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateX(0)'; this.style.boxShadow='none';">
                Mark as Thesis
              </button>
              <button class="mark-result-option" data-mark="statement" style="
                display: block;
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
              onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateX(4px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
              onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateX(0)'; this.style.boxShadow='none';">
                Mark as Statement
              </button>
              <button class="mark-result-option" data-mark="story" style="
                display: block;
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
              onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateX(4px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
              onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateX(0)'; this.style.boxShadow='none';">
                Mark as Story
              </button>
              <button class="mark-result-option" data-mark="case_study" style="
                display: block;
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
              onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateX(4px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
              onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateX(0)'; this.style.boxShadow='none';">
                Mark as Case Study
              </button>
              <button class="mark-result-option" data-mark="contrast" style="
                display: block;
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
              onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateX(4px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
              onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateX(0)'; this.style.boxShadow='none';">
                Mark as Contrast
              </button>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0;">
            <button id="copy-rephrase" style="
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
            onmouseover="this.style.backgroundColor='rgba(98, 179, 189, 0.15)'; this.style.color='#62b3bd'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.08)';"
            onmouseout="this.style.backgroundColor='transparent'; this.style.color='hsl(222.2 47.4% 11.2%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none';"
            onmousedown="this.style.transform='scale(0.98)';"
            onmouseup="this.style.transform='scale(1)';">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
          </div>
        </div>
        <div style="padding: 8px; box-sizing: border-box;">
          ${optionsHtml}
        </div>
      </div>
    `;
  }

  attachEventListeners(container: HTMLElement): void {
    // Add event listeners for option buttons
    const optionButtons = container.querySelectorAll('.rephrase-option');
    optionButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        if (this.config.onSelect) {
          this.config.onSelect(this.config.options[index], index);
        }
      });
    });

    // Add copy button listener
    const copyBtn = container.querySelector('#copy-rephrase');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        // Copy the first option to clipboard (there should only be one when showing rephrased result)
        const textToCopy = this.config.options[0];
        try {
          await navigator.clipboard.writeText(textToCopy);
          // Change button text to show feedback
          copyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
          `;
          // Revert after 1.5 seconds
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            `;
          }, 1500);

          if (this.config.onCopy) {
            this.config.onCopy(textToCopy);
          }
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
    }

    // Add action button listeners
    const rephraseBtn = container.querySelector('#rephrase-result-btn');
    if (rephraseBtn && this.config.onRephrase) {
      rephraseBtn.addEventListener('click', () => {
        this.config.onRephrase!(this.config.options[0]);
      });
    }

    const translateBtn = container.querySelector('#translate-result-btn');
    if (translateBtn && this.config.onTranslate) {
      translateBtn.addEventListener('click', () => {
        this.config.onTranslate!(this.config.options[0]);
      });
    }

    const editBtn = container.querySelector('#edit-result-btn');
    if (editBtn && this.config.onEdit) {
      editBtn.addEventListener('click', () => {
        this.config.onEdit!(this.config.options[0]);
      });
    }

    const replyBtn = container.querySelector('#reply-result-btn');
    if (replyBtn && this.config.onReply) {
      replyBtn.addEventListener('click', () => {
        this.config.onReply!(this.config.options[0]);
      });
    }

    // Add marks dropdown hover behavior
    const marksBtn = container.querySelector('#marks-result-btn');
    const marksDropdown = container.querySelector('#marks-result-dropdown');

    if (marksBtn && marksDropdown) {
      const dropdown = marksDropdown as HTMLElement;
      const button = marksBtn as HTMLElement;

      button.addEventListener('mouseenter', () => {
        dropdown.style.display = 'block';
      });

      const hideDropdown = () => {
        dropdown.style.display = 'none';
      };

      button.addEventListener('mouseleave', (e) => {
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!dropdown.contains(relatedTarget)) {
          hideDropdown();
        }
      });

      dropdown.addEventListener('mouseenter', () => {
        dropdown.style.display = 'block';
      });

      dropdown.addEventListener('mouseleave', (e) => {
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!button.contains(relatedTarget)) {
          hideDropdown();
        }
      });

      // Mark options
      const markOptions = marksDropdown.querySelectorAll('.mark-result-option');
      markOptions.forEach((option) => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const markType = (option as HTMLElement).dataset.mark || '';
          console.log('Mark selected:', markType);
          // TODO: Implement mark functionality
          dropdown.style.display = 'none';
        });
      });
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private formatWithTranslations(text: string): string {
    // Remove leading/trailing spaces
    const trimmed = text.trim();

    // First escape HTML to prevent XSS
    const escaped = this.escapeHtml(trimmed);

    // Then format text with Chinese translations highlighted
    // Pattern matches single words or multi-word phrases followed by (中文)
    // e.g., "algorithm (算法)" or "take advantage of (利用)"
    const formatted = escaped.replace(
      /([a-zA-Z][\w\s'-]*?)\s*\(([^\)]+)\)/g,
      '<strong>$1</strong> <span style="color: rgba(102, 126, 234, 0.85); font-size: 11px; font-style: italic;">($2)</span>'
    );

    // Wrap in a div with proper paragraph spacing (1.15 line spacing already set in button style)
    return `<div style="margin: 0; padding: 0;">${formatted}</div>`;
  }
}