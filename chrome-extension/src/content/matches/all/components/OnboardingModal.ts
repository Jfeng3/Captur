/**
 * OnboardingModal - Interactive onboarding flow for new users
 *
 * Shows a 4-step walkthrough:
 * 1. Welcome + Sign In Required
 * 2. Feature 1: Hover to Translate
 * 3. Feature 2: Double-Shift AI Tools
 * 4. Feature 3: Key Takeaways Widget
 * 5. Feature 4: One-Click Flashcards
 */

import { openAuthPage } from '../../../../lib/auth';

export class OnboardingModal {
  private currentStep = 0;
  private totalSteps = 5;
  private modal: HTMLElement | null = null;
  private onComplete?: () => void;

  constructor(options?: { onComplete?: () => void }) {
    this.onComplete = options?.onComplete;
  }

  async show() {
    // Check if already authenticated
    const result = await chrome.storage.local.get(['onboardingCompleted']);
    if (result.onboardingCompleted) {
      console.log('Onboarding already completed, skipping');
      return;
    }

    this.createModal();
    this.renderStep(0);
  }

  private createModal() {
    // Remove existing modal if any
    const existing = document.getElementById('captur-onboarding-modal');
    if (existing) {
      existing.remove();
    }

    // Create modal container
    this.modal = document.createElement('div');
    this.modal.id = 'captur-onboarding-modal';
    this.modal.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 420px !important;
      max-height: 600px !important;
      background: white !important;
      color: #202124 !important;
      padding: 0 !important;
      border-radius: 16px !important;
      border: 1px solid #e5e7eb !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1) !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      animation: slideInUp 0.4s ease-out !important;
      overflow: hidden !important;
    `;

    // Add animation keyframes
    if (!document.getElementById('captur-onboarding-style')) {
      const style = document.createElement('style');
      style.id = 'captur-onboarding-style';
      style.textContent = `
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(this.modal);
  }

  private renderStep(step: number) {
    if (!this.modal) return;

    this.currentStep = step;
    this.modal.innerHTML = '';

    switch (step) {
      case 0:
        this.renderWelcomeStep();
        break;
      case 1:
        this.renderTranslateStep();
        break;
      case 2:
        this.renderDoubleShiftStep();
        break;
      case 3:
        this.renderKeyTakeawaysStep();
        break;
      case 4:
        this.renderFlashcardsStep();
        break;
      default:
        this.close();
    }
  }

  private renderWelcomeStep() {
    if (!this.modal) return;

    const container = document.createElement('div');
    container.style.cssText = `
      padding: 40px 32px !important;
      text-align: center !important;
    `;

    // Header with icon
    const header = document.createElement('div');
    header.style.cssText = `margin-bottom: 24px !important;`;
    header.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
      <h2 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700; color: #202124;">
        Welcome to Captur!
      </h2>
      <p style="margin: 0; font-size: 16px; color: #5f6368; line-height: 1.5;">
        Build vocabulary from content you love<br/>
        <strong style="color: #62b3bd;">30x faster</strong> than traditional methods
      </p>
    `;

    // Sign in button
    const signInBtn = document.createElement('button');
    signInBtn.textContent = 'Sign in with Google';
    signInBtn.style.cssText = `
      width: 100% !important;
      padding: 16px 24px !important;
      background: #62b3bd !important;
      color: white !important;
      border: none !important;
      border-radius: 12px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      margin: 24px 0 16px 0 !important;
      box-shadow: 0 4px 12px rgba(98, 179, 189, 0.3) !important;
    `;
    signInBtn.onmouseover = () => {
      signInBtn.style.background = '#56a0a9';
      signInBtn.style.transform = 'translateY(-2px)';
      signInBtn.style.boxShadow = '0 6px 16px rgba(98, 179, 189, 0.4)';
    };
    signInBtn.onmouseout = () => {
      signInBtn.style.background = '#62b3bd';
      signInBtn.style.transform = 'translateY(0)';
      signInBtn.style.boxShadow = '0 4px 12px rgba(98, 179, 189, 0.3)';
    };
    signInBtn.onclick = async () => {
      await openAuthPage();
      // Show waiting message
      this.renderWaitingForAuth();
    };

    // Info text
    const info = document.createElement('p');
    info.textContent = 'Required to save your flashcards & notes';
    info.style.cssText = `
      margin: 0 !important;
      font-size: 14px !important;
      color: #5f6368 !important;
    `;

    // Skip link (for testing only - remove in production)
    const skipLink = document.createElement('a');
    skipLink.textContent = 'Continue without signing in (Demo)';
    skipLink.href = '#';
    skipLink.style.cssText = `
      display: block !important;
      margin-top: 20px !important;
      font-size: 13px !important;
      color: #62b3bd !important;
      text-decoration: none !important;
    `;
    skipLink.onclick = (e) => {
      e.preventDefault();
      this.renderStep(1); // Skip to feature tour
    };

    container.appendChild(header);
    container.appendChild(signInBtn);
    container.appendChild(info);
    container.appendChild(skipLink);
    this.modal!.appendChild(container);
  }

  private renderWaitingForAuth() {
    if (!this.modal) return;

    this.modal.innerHTML = '';

    const container = document.createElement('div');
    container.style.cssText = `
      padding: 60px 32px !important;
      text-align: center !important;
    `;

    // Spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 48px !important;
      height: 48px !important;
      border: 4px solid #e5e7eb !important;
      border-top-color: #62b3bd !important;
      border-radius: 50% !important;
      margin: 0 auto 24px auto !important;
      animation: spin 1s linear infinite !important;
    `;

    // Add spin animation if not exists
    if (!document.getElementById('captur-spin-animation')) {
      const style = document.createElement('style');
      style.id = 'captur-spin-animation';
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    const title = document.createElement('h3');
    title.textContent = 'Waiting for sign in...';
    title.style.cssText = `
      margin: 0 0 12px 0 !important;
      font-size: 20px !important;
      font-weight: 600 !important;
      color: #202124 !important;
    `;

    const subtitle = document.createElement('p');
    subtitle.innerHTML = 'Complete sign in on the opened tab<br/>This popup will automatically continue';
    subtitle.style.cssText = `
      margin: 0 !important;
      font-size: 14px !important;
      color: #5f6368 !important;
      line-height: 1.5 !important;
    `;

    container.appendChild(spinner);
    container.appendChild(title);
    container.appendChild(subtitle);
    this.modal!.appendChild(container);

    // Poll for auth completion
    this.pollForAuth();
  }

  private async pollForAuth() {
    const checkInterval = setInterval(async () => {
      const result = await chrome.storage.local.get(['awaitingAuth']);

      // If awaiting auth flag is cleared, user is authenticated
      if (!result.awaitingAuth) {
        clearInterval(checkInterval);
        // Move to next step
        this.renderStep(1);
      }
    }, 1000);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 300000);
  }

  private renderTranslateStep() {
    if (!this.modal) return;

    this.modal.innerHTML = '';

    const container = document.createElement('div');
    container.style.cssText = `padding: 32px !important;`;

    // Header
    const header = this.createStepHeader(
      'Step 1/4: Instant Translation',
      'Select any word, hover over the teal dot'
    );

    // Feature illustration
    const illustration = document.createElement('div');
    illustration.style.cssText = `
      width: 100% !important;
      height: 200px !important;
      background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%) !important;
      border-radius: 12px !important;
      margin: 24px 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;
      overflow: hidden !important;
    `;

    // Mock selection with teal dot
    const mockSelection = document.createElement('div');
    mockSelection.innerHTML = `
      <div style="position: relative; display: inline-block;">
        <span style="background: #fef3c7; padding: 4px 8px; border-radius: 4px; font-size: 16px; font-weight: 600;">
          revolutionize
        </span>
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          width: 12px;
          height: 12px;
          background: #62b3bd;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 0 4px rgba(98, 179, 189, 0.3);
        "></div>
      </div>
      <div style="
        margin-top: 16px;
        padding: 12px 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        font-size: 14px;
        color: #374151;
      ">
        <strong>revolutionize</strong> (彻底改变)<br/>
        <span style="font-size: 12px; color: #6b7280;">to change something completely</span>
      </div>
    `;
    illustration.appendChild(mockSelection);

    // Benefits list
    const benefits = this.createBenefitsList([
      'Select any difficult word',
      'Hover over teal dot',
      'See instant translation',
      '<strong style="color: #62b3bd;">30x faster</strong> than dictionary!'
    ]);

    // Navigation
    const nav = this.createNavigation(1, 4, false, true);

    container.appendChild(header);
    container.appendChild(illustration);
    container.appendChild(benefits);
    container.appendChild(nav);
    this.modal!.appendChild(container);
  }

  private renderDoubleShiftStep() {
    if (!this.modal) return;

    this.modal.innerHTML = '';

    const container = document.createElement('div');
    container.style.cssText = `padding: 32px !important;`;

    const header = this.createStepHeader(
      'Step 2/4: AI Writing Tools',
      'Press Shift twice for powerful AI features'
    );

    // Feature illustration
    const illustration = document.createElement('div');
    illustration.style.cssText = `
      width: 100% !important;
      min-height: 180px !important;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
      border-radius: 12px !important;
      margin: 24px 0 !important;
      padding: 24px !important;
      position: relative !important;
    `;

    illustration.innerHTML = `
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="font-size: 32px; font-weight: 700; color: #202124; margin-bottom: 8px;">
          ⇧⇧
        </div>
        <div style="font-size: 13px; color: #5f6368;">Press Shift twice</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
        <div style="background: white; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center;">
          🎤 Voice
        </div>
        <div style="background: white; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center;">
          🌐 Translate
        </div>
        <div style="background: white; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center;">
          📚 Synonym
        </div>
        <div style="background: white; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center;">
          ✏️ Simplify
        </div>
        <div style="background: white; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center;">
          💬 Reply
        </div>
        <div style="background: white; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center;">
          ⭐ Mark
        </div>
      </div>
    `;

    const benefits = this.createBenefitsList([
      'Select any text',
      'Press <strong>Shift</strong> twice',
      'Get AI-powered tools instantly'
    ]);

    const nav = this.createNavigation(2, 4, true, true);

    container.appendChild(header);
    container.appendChild(illustration);
    container.appendChild(benefits);
    container.appendChild(nav);
    this.modal!.appendChild(container);
  }

  private renderKeyTakeawaysStep() {
    if (!this.modal) return;

    this.modal.innerHTML = '';

    const container = document.createElement('div');
    container.style.cssText = `padding: 32px !important;`;

    const header = this.createStepHeader(
      'Step 3/4: Extract Key Insights',
      'AI-powered takeaways from any article or video'
    );

    // Feature illustration - use actual screenshot if available
    const illustration = document.createElement('div');
    illustration.style.cssText = `
      width: 100% !important;
      height: 200px !important;
      background: url('/key-takeaways.png') center/cover !important;
      border-radius: 12px !important;
      margin: 24px 0 !important;
      border: 1px solid #e5e7eb !important;
    `;

    // Fallback if image doesn't load
    illustration.onerror = () => {
      illustration.style.background = 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)';
      illustration.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #62b3bd;">
          <div style="font-size: 48px; margin-bottom: 12px;">✨</div>
          <div style="font-size: 14px; font-weight: 600;">Key Takeaways Widget</div>
        </div>
      `;
    };

    const benefits = this.createBenefitsList([
      'Click the <strong>teal circle ◉</strong> in bottom-left',
      'AI extracts key takeaways',
      'Save marked sentences',
      'Write reflections'
    ]);

    const nav = this.createNavigation(3, 4, true, true);

    container.appendChild(header);
    container.appendChild(illustration);
    container.appendChild(benefits);
    container.appendChild(nav);
    this.modal!.appendChild(container);
  }

  private renderFlashcardsStep() {
    if (!this.modal) return;

    this.modal.innerHTML = '';

    const container = document.createElement('div');
    container.style.cssText = `padding: 32px !important;`;

    const header = this.createStepHeader(
      'Step 4/4: One-Click Flashcards',
      'Build vocabulary with spaced repetition'
    );

    // Feature illustration
    const illustration = document.createElement('div');
    illustration.style.cssText = `
      width: 100% !important;
      min-height: 180px !important;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
      border-radius: 12px !important;
      margin: 24px 0 !important;
      padding: 24px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
    `;

    illustration.innerHTML = `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: 1.5px solid #d1d5db;
        border-radius: 8px;
        background: white;
        margin-bottom: 20px;
      ">
        <strong style="background: #fef3c7; padding: 4px 8px; border-radius: 4px;">revolutionize</strong>
        <span style="color: #6b7280; font-size: 13px; font-style: italic;">(彻底改变)</span>
        <span style="color: #10b981; font-size: 18px; font-weight: bold;">✓</span>
      </div>
      <div style="text-align: center; color: #374151;">
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
          Click = Instant Flashcard
        </div>
        <div style="font-size: 13px; color: #6b7280;">
          <strong style="color: #62b3bd;">600x faster</strong> than manual creation<br/>
          <strong style="color: #10b981;">80%+ retention</strong> guaranteed
        </div>
      </div>
    `;

    const benefits = this.createBenefitsList([
      'Click any highlighted word',
      'Instantly saved as flashcard',
      'Auto spaced repetition: 1d, 3d, 1w, 2w, 1m',
      'Review on captur.academy dashboard'
    ]);

    const nav = this.createNavigation(4, 4, true, false);
    nav.querySelector('.next-btn')!.textContent = 'Start Using Captur →';

    container.appendChild(header);
    container.appendChild(illustration);
    container.appendChild(benefits);
    container.appendChild(nav);
    this.modal!.appendChild(container);
  }

  private createStepHeader(title: string, subtitle: string): HTMLElement {
    const header = document.createElement('div');
    header.style.cssText = `margin-bottom: 16px !important;`;

    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      margin: 0 0 8px 0 !important;
      font-size: 20px !important;
      font-weight: 600 !important;
      color: #202124 !important;
    `;

    const subtitleEl = document.createElement('p');
    subtitleEl.textContent = subtitle;
    subtitleEl.style.cssText = `
      margin: 0 !important;
      font-size: 14px !important;
      color: #5f6368 !important;
    `;

    header.appendChild(titleEl);
    header.appendChild(subtitleEl);
    return header;
  }

  private createBenefitsList(items: string[]): HTMLElement {
    const list = document.createElement('ul');
    list.style.cssText = `
      margin: 0 !important;
      padding-left: 0 !important;
      list-style: none !important;
    `;

    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `• ${item}`;
      li.style.cssText = `
        margin-bottom: 8px !important;
        font-size: 14px !important;
        color: #374151 !important;
        line-height: 1.5 !important;
      `;
      list.appendChild(li);
    });

    return list;
  }

  private createNavigation(current: number, total: number, showBack: boolean, showNext: boolean): HTMLElement {
    const nav = document.createElement('div');
    nav.style.cssText = `
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      margin-top: 24px !important;
      padding-top: 24px !important;
      border-top: 1px solid #e5e7eb !important;
    `;

    // Back button
    const backBtn = document.createElement('button');
    backBtn.textContent = '← Back';
    backBtn.style.cssText = `
      padding: 10px 20px !important;
      background: transparent !important;
      color: #5f6368 !important;
      border: none !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      ${showBack ? '' : 'visibility: hidden !important;'}
    `;
    backBtn.onmouseover = () => {
      backBtn.style.background = '#f3f4f6';
    };
    backBtn.onmouseout = () => {
      backBtn.style.background = 'transparent';
    };
    backBtn.onclick = () => {
      this.renderStep(this.currentStep - 1);
    };

    // Progress dots
    const dots = document.createElement('div');
    dots.style.cssText = `
      display: flex !important;
      gap: 8px !important;
    `;
    for (let i = 1; i <= total; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 8px !important;
        height: 8px !important;
        border-radius: 50% !important;
        background: ${i === current ? '#62b3bd' : '#e5e7eb'} !important;
        transition: all 0.2s !important;
      `;
      dots.appendChild(dot);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'next-btn';
    nextBtn.textContent = 'Next →';
    nextBtn.style.cssText = `
      padding: 10px 20px !important;
      background: #62b3bd !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      ${showNext ? '' : 'visibility: hidden !important;'}
    `;
    nextBtn.onmouseover = () => {
      nextBtn.style.background = '#56a0a9';
      nextBtn.style.transform = 'translateX(2px)';
    };
    nextBtn.onmouseout = () => {
      nextBtn.style.background = '#62b3bd';
      nextBtn.style.transform = 'translateX(0)';
    };
    nextBtn.onclick = async () => {
      if (this.currentStep === this.totalSteps - 1) {
        // Last step - complete onboarding
        await this.completeOnboarding();
      } else {
        this.renderStep(this.currentStep + 1);
      }
    };

    nav.appendChild(backBtn);
    nav.appendChild(dots);
    nav.appendChild(nextBtn);
    return nav;
  }

  private async completeOnboarding() {
    // Mark onboarding as completed
    await chrome.storage.local.set({
      onboardingCompleted: true,
      showOnboarding: false
    });

    // Show success message briefly
    if (this.modal) {
      this.modal.innerHTML = '';

      const success = document.createElement('div');
      success.style.cssText = `
        padding: 60px 32px !important;
        text-align: center !important;
      `;

      success.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
        <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #202124;">
          You're all set!
        </h2>
        <p style="margin: 0; font-size: 14px; color: #5f6368;">
          Start building your vocabulary now
        </p>
      `;

      this.modal.appendChild(success);

      // Auto-close after 2 seconds
      setTimeout(() => {
        this.close();
      }, 2000);
    }
  }

  close() {
    if (this.modal) {
      this.modal.style.animation = 'slideInUp 0.3s ease-in reverse';
      setTimeout(() => {
        this.modal?.remove();
        this.modal = null;
        if (this.onComplete) {
          this.onComplete();
        }
      }, 300);
    }
  }
}
