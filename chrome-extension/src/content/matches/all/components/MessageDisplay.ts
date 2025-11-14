export type MessageType = 'success' | 'error' | 'info';

export interface MessageConfig {
  message: string;
  type: MessageType;
  autoDismiss?: boolean;
  dismissDelay?: number;
  onDismiss?: () => void;
}

export class MessageDisplay {
  private config: MessageConfig;
  private timeoutId: number | null = null;

  constructor(config: MessageConfig) {
    this.config = {
      autoDismiss: true,
      dismissDelay: 3000,
      ...config
    };
  }

  render(): string {
    const { icon, styles } = this.getStylesAndIcon();
    
    return `
      <div style="${styles}">
        ${icon}
        <span style="margin-left: 8px;">${this.escapeHtml(this.config.message)}</span>
      </div>
    `;
  }

  private getStylesAndIcon(): { icon: string; styles: string } {
    const baseStyles = `
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
      text-align: center;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 200ms ease;
      line-height: 1.5;
    `;

    switch (this.config.type) {
      case 'success':
        return {
          icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
            <path d="M20 6L9 17l-5-5"/>
          </svg>`,
          styles: baseStyles + `
            background: hsl(142.1 76.2% 36.3%);
            color: hsl(0 0% 100%);
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
          `
        };
      case 'error':
        return {
          icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>`,
          styles: baseStyles + `
            background: hsl(0 84.2% 60.2%);
            color: hsl(0 0% 100%);
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
          `
        };
      case 'info':
        return {
          icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>`,
          styles: baseStyles + `
            background: hsl(217.2 91.2% 59.8%);
            color: hsl(0 0% 100%);
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
          `
        };
      default:
        return {
          icon: '',
          styles: baseStyles + `
            background: hsl(215.4 16.3% 46.9%);
            color: hsl(0 0% 100%);
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
          `
        };
    }
  }

  attachBehavior(): void {
    if (this.config.autoDismiss && this.config.onDismiss) {
      this.timeoutId = window.setTimeout(() => {
        if (this.config.onDismiss) {
          this.config.onDismiss();
        }
      }, this.config.dismissDelay);
    }
  }

  cleanup(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Static factory methods for common message types
  static success(message: string, onDismiss?: () => void): MessageDisplay {
    return new MessageDisplay({
      message,
      type: 'success',
      dismissDelay: 2000,
      onDismiss
    });
  }

  static error(message: string, onDismiss?: () => void): MessageDisplay {
    return new MessageDisplay({
      message,
      type: 'error',
      dismissDelay: 3000,
      onDismiss
    });
  }

  static info(message: string, onDismiss?: () => void): MessageDisplay {
    return new MessageDisplay({
      message,
      type: 'info',
      dismissDelay: 2500,
      onDismiss
    });
  }
}