import { Tooltip } from './Tooltip';
import { RephraseOptions } from './RephraseOptions';
import { MessageDisplay, MessageType } from './MessageDisplay';

export interface TooltipManagerOptions {
  onRephrase?: () => void;
  onTranslate?: () => void;
  onSynonym?: () => void;
  onEdit?: () => void;
  onReply?: () => void;
  // REMOVED: onSave - no longer saving to writing_notes table
  onRephraseSelect?: (option: string, index: number) => void;
  onTextReplace?: (newText: string) => void;
}

export class TooltipManager {
  private tooltip: Tooltip | null = null;
  private currentMessageDisplay: MessageDisplay | null = null;
  private options: TooltipManagerOptions;
  private selectionWidth: number = 0;

  constructor(options: TooltipManagerOptions = {}) {
    this.options = options;
  }

  show(selection: Selection): void {
    this.hide(); // Remove any existing tooltip

    // Store the selection width for later use in result view
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    this.selectionWidth = rect.width;

    this.tooltip = new Tooltip({
      onRephrase: this.options.onRephrase,
      onTranslate: this.options.onTranslate,
      onSynonym: this.options.onSynonym,
      onEdit: this.options.onEdit,
      onReply: this.options.onReply,
      // REMOVED: onSave - no longer needed
      onDestroy: () => {
        this.cleanup();
      }
    });

    const tooltipElement = this.tooltip.create();
    document.body.appendChild(tooltipElement);
    this.tooltip.position(selection);

    console.log('✅ Tooltip created and positioned');
  }

  hide(): void {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
    this.cleanup();
  }

  showRephraseOptions(options: string[]): void {
    if (!this.tooltip) return;

    const rephraseOptions = new RephraseOptions({
      options,
      maxWidth: this.selectionWidth || 600,
      onSelect: (option, index) => {
        if (this.options.onRephraseSelect) {
          this.options.onRephraseSelect(option, index);
        }
        if (this.options.onTextReplace) {
          this.options.onTextReplace(option);
        }
        this.hide();
      },
      onCancel: () => {
        this.hide();
      },
      onRephrase: this.options.onRephrase,
      onTranslate: this.options.onTranslate,
      onEdit: this.options.onEdit,
      onReply: this.options.onReply,
    });

    const html = rephraseOptions.render();
    this.tooltip.updateContent(html);

    // Attach event listeners
    const tooltipElement = this.tooltip.getElement();
    if (tooltipElement) {
      rephraseOptions.attachEventListeners(tooltipElement);
    }
  }

  showMessage(message: string, type: MessageType = 'info'): void {
    if (!this.tooltip) return;

    // Cleanup previous message
    this.cleanup();

    this.currentMessageDisplay = new MessageDisplay({
      message,
      type,
      autoDismiss: true,
      dismissDelay: type === 'success' ? 2000 : 3000,
      onDismiss: () => {
        this.hide();
      }
    });

    const html = this.currentMessageDisplay.render();
    this.tooltip.updateContent(html);
    this.currentMessageDisplay.attachBehavior();
  }

  showSuccess(message: string): void {
    this.showMessage(message, 'success');
  }

  showError(message: string): void {
    this.showMessage(message, 'error');
  }

  setButtonLoading(buttonId: string, loading: boolean): void {
    if (!this.tooltip) return;

    if (loading) {
      let loadingText = 'Loading...';
      if (buttonId === 'rephrase-btn') loadingText = 'Voicing...';
      else if (buttonId === 'translate-btn') loadingText = 'Translating...';
      else if (buttonId === 'synonym-btn') loadingText = 'Finding...';
      else if (buttonId === 'edit-btn') loadingText = 'Simplifying...';
      else if (buttonId === 'reply-btn') loadingText = 'Replying...';
      else if (buttonId === 'save-btn') loadingText = 'Saving...';

      this.tooltip.setButtonState(buttonId, loadingText, true);
    } else {
      let normalText = 'Button';
      if (buttonId === 'rephrase-btn') normalText = 'Voice';
      else if (buttonId === 'translate-btn') normalText = 'Translate';
      else if (buttonId === 'synonym-btn') normalText = 'Synonym';
      else if (buttonId === 'edit-btn') normalText = 'Simplify';
      else if (buttonId === 'reply-btn') normalText = 'Reply';
      else if (buttonId === 'save-btn') normalText = 'Save to Notes';

      this.tooltip.setButtonState(buttonId, normalText, false);
    }
  }

  showSynonyms(synonyms: string[]): void {
    if (!this.tooltip) return;
    this.tooltip.showSynonyms(synonyms);
  }

  contains(target: Node): boolean {
    return this.tooltip ? this.tooltip.contains(target) : false;
  }

  isVisible(): boolean {
    return this.tooltip !== null;
  }

  private cleanup(): void {
    if (this.currentMessageDisplay) {
      this.currentMessageDisplay.cleanup();
      this.currentMessageDisplay = null;
    }
  }
}