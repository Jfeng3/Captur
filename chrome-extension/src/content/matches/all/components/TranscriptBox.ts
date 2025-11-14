/**
 * TranscriptBox - YouTube transcript viewer with auto-scroll and current segment highlighting
 *
 * Features:
 * - Auto-scrolls to follow video playback
 * - Highlights currently playing segment
 * - Detects user scroll and pauses auto-scroll
 * - "Jump to Current" button to resume auto-scroll
 * - Double line spacing for readability
 */

interface TranscriptSegment {
  text: string;
  start: number; // seconds
  duration: number;
}

interface TranscriptBoxConfig {
  videoId: string;
  onCopy?: () => void;
}

export class TranscriptBox {
  private container: HTMLDivElement;
  private contentDiv: HTMLDivElement;
  private headerDiv: HTMLDivElement;
  private copyButton: HTMLButtonElement;
  private autoScrollButton: HTMLButtonElement;
  private jumpToCurrentButton: HTMLButtonElement;

  private transcript: TranscriptSegment[] = [];
  private currentTime: number = 0;
  private autoScroll: boolean = true;
  private lastUserScrollTime: number = 0;
  private scrollTimeout: number | null = null;
  private currentSegmentElement: HTMLDivElement | null = null;

  private videoElement: HTMLVideoElement | null = null;
  private timeUpdateHandler: (() => void) | null = null;

  constructor(_config: TranscriptBoxConfig) {
    this.container = this.createContainer();
    this.headerDiv = this.createHeader();
    this.copyButton = this.createCopyButton();
    this.autoScrollButton = this.createAutoScrollButton();
    this.jumpToCurrentButton = this.createJumpToCurrentButton();
    this.contentDiv = this.createContent();

    this.setupHeader();
    this.container.appendChild(this.headerDiv);
    this.container.appendChild(this.jumpToCurrentButton);
    this.container.appendChild(this.contentDiv);

    this.setupScrollListener();
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'captur-youtube-transcript';
    container.style.cssText = `
      position: relative !important;
      width: 100% !important;
      box-sizing: border-box !important;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%) !important;
      border: 1px solid rgba(102, 126, 234, 0.3) !important;
      border-radius: 12px !important;
      margin: 0 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
    `;
    return container;
  }

  private createHeader(): HTMLDivElement {
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 16px 20px 12px 20px !important;
      flex-shrink: 0 !important;
      border-bottom: 1px solid rgba(102, 126, 234, 0.1) !important;
    `;
    return header;
  }

  private createCopyButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'captur-copy-transcript-btn';
    button.textContent = '📋 Copy';
    button.style.cssText = `
      background: #62b3bd !important;
      color: white !important;
      border: none !important;
      padding: 6px 12px !important;
      border-radius: 6px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      margin-left: 8px !important;
    `;
    button.onmouseover = () => {
      button.style.background = '#4e9ca6 !important';
    };
    button.onmouseout = () => {
      button.style.background = '#62b3bd !important';
    };
    button.onclick = () => this.handleCopy();
    return button;
  }

  private createAutoScrollButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'captur-autoscroll-btn';
    button.innerHTML = '👁️ Auto';
    button.style.cssText = `
      background: #62b3bd !important;
      color: white !important;
      border: none !important;
      padding: 6px 12px !important;
      border-radius: 6px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      margin-left: 8px !important;
    `;
    button.onclick = () => this.toggleAutoScroll();
    return button;
  }

  private createJumpToCurrentButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'captur-jump-current-btn';
    button.innerHTML = '⬇ Jump to Current';
    button.style.cssText = `
      position: absolute !important;
      top: 60px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: #62b3bd !important;
      color: white !important;
      border: none !important;
      padding: 8px 16px !important;
      border-radius: 8px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
      z-index: 10 !important;
      display: none !important;
      transition: all 0.3s !important;
    `;
    button.onclick = () => this.jumpToCurrent();
    return button;
  }

  private createContent(): HTMLDivElement {
    const content = document.createElement('div');
    content.id = 'captur-transcript-content';
    content.style.cssText = `
      font-size: 14px !important;
      line-height: 2.0 !important;
      color: #333 !important;
      overflow-y: auto !important;
      padding: 20px !important;
      background: white !important;
      border-radius: 0 0 8px 8px !important;
      flex: 1 !important;
      scroll-behavior: smooth !important;
    `;
    content.textContent = '⏳ Loading transcript...';
    return content;
  }

  private setupHeader(): void {
    const leftSection = document.createElement('div');
    leftSection.style.cssText = 'display: flex !important; align-items: center !important;';

    const title = document.createElement('h3');
    title.textContent = '📝 Video Transcript';
    title.style.cssText = `
      margin: 0 !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #62b3bd !important;
    `;

    leftSection.appendChild(title);

    const rightSection = document.createElement('div');
    rightSection.style.cssText = 'display: flex !important; align-items: center !important;';
    rightSection.appendChild(this.autoScrollButton);
    rightSection.appendChild(this.copyButton);

    this.headerDiv.appendChild(leftSection);
    this.headerDiv.appendChild(rightSection);
  }

  private setupScrollListener(): void {
    this.contentDiv.addEventListener('scroll', () => this.handleUserScroll());
  }

  private handleUserScroll(): void {
    const now = Date.now();
    // Only consider it user scroll if enough time has passed since last programmatic scroll
    if (now - this.lastUserScrollTime > 300) {
      if (this.autoScroll) {
        this.autoScroll = false;
        this.updateAutoScrollButton();
        this.jumpToCurrentButton.style.display = 'block';

        // Clear existing timeout
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }

        // Re-enable auto-scroll after 8 seconds of inactivity
        this.scrollTimeout = window.setTimeout(() => {
          this.autoScroll = true;
          this.updateAutoScrollButton();
          this.jumpToCurrentButton.style.display = 'none';
          this.scrollToCurrent(true);
        }, 8000);
      }
    }
  }

  private toggleAutoScroll(): void {
    this.autoScroll = !this.autoScroll;
    this.updateAutoScrollButton();

    if (this.autoScroll) {
      this.jumpToCurrentButton.style.display = 'none';
      this.scrollToCurrent(true);
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
    } else {
      this.jumpToCurrentButton.style.display = 'block';
    }
  }

  private updateAutoScrollButton(): void {
    if (this.autoScroll) {
      this.autoScrollButton.innerHTML = '👁️ Auto';
      this.autoScrollButton.style.background = '#667eea !important';
    } else {
      this.autoScrollButton.innerHTML = '👁️‍🗨️ Manual';
      this.autoScrollButton.style.background = '#999 !important';
    }
  }

  private jumpToCurrent(): void {
    this.autoScroll = true;
    this.updateAutoScrollButton();
    this.jumpToCurrentButton.style.display = 'none';
    this.scrollToCurrent(true);
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  private handleCopy(): void {
    const text = this.transcript.map(seg => seg.text).join(' ');
    navigator.clipboard.writeText(text).then(() => {
      this.copyButton.textContent = '✅ Copied!';
      setTimeout(() => {
        this.copyButton.textContent = '📋 Copy';
      }, 2000);
    }).catch((err) => {
      console.error('Failed to copy transcript:', err);
      this.copyButton.textContent = '❌ Failed';
      setTimeout(() => {
        this.copyButton.textContent = '📋 Copy';
      }, 2000);
    });
  }

  public setTranscript(transcript: TranscriptSegment[]): void {
    // Use the provided transcript segments with actual timestamps
    this.transcript = transcript;
    this.renderTranscript();
  }

  private renderTranscript(): void {
    this.contentDiv.innerHTML = '';

    this.transcript.forEach((segment, index) => {
      const segmentDiv = document.createElement('div');
      segmentDiv.dataset.segmentIndex = index.toString();
      segmentDiv.dataset.start = segment.start.toString();
      segmentDiv.dataset.duration = segment.duration.toString();
      segmentDiv.style.cssText = `
        padding: 8px 12px !important;
        margin: 4px 0 !important;
        border-radius: 8px !important;
        transition: all 0.2s !important;
        cursor: pointer !important;
      `;

      const textElement = document.createElement('p');
      textElement.style.cssText = `
        margin: 0 !important;
        color: #666 !important;
        font-size: 14px !important;
        line-height: 2.0 !important;
      `;
      textElement.textContent = segment.text;

      segmentDiv.appendChild(textElement);

      // Click to jump to this timestamp in video
      segmentDiv.onclick = () => this.seekToSegment(segment.start);

      this.contentDiv.appendChild(segmentDiv);
    });
  }

  private getCurrentSegmentIndex(): number {
    if (this.currentTime === 0) return -1;

    // Find all segments that contain the current time
    const matchingIndices: number[] = [];
    this.transcript.forEach((segment, index) => {
      if (this.currentTime >= segment.start && this.currentTime < segment.start + segment.duration) {
        matchingIndices.push(index);
      }
    });

    // If no matches, return -1
    if (matchingIndices.length === 0) return -1;

    // If only one match, return it
    if (matchingIndices.length === 1) return matchingIndices[0];

    // If multiple matches, return the one whose start time is closest to current time
    return matchingIndices.reduce((closest, current) => {
      const closestDiff = Math.abs(this.transcript[closest].start - this.currentTime);
      const currentDiff = Math.abs(this.transcript[current].start - this.currentTime);
      return currentDiff < closestDiff ? current : closest;
    });
  }

  private highlightCurrentSegment(): void {
    const currentIndex = this.getCurrentSegmentIndex();

    // Remove previous highlight
    if (this.currentSegmentElement) {
      this.currentSegmentElement.style.background = 'transparent';
      const textElement = this.currentSegmentElement.querySelector('p');
      if (textElement) {
        textElement.style.color = '#666';
        textElement.style.fontWeight = 'normal';
      }
    }

    // Add new highlight
    if (currentIndex >= 0) {
      const segmentDiv = this.contentDiv.querySelector(`[data-segment-index="${currentIndex}"]`) as HTMLDivElement;
      if (segmentDiv) {
        this.currentSegmentElement = segmentDiv;
        segmentDiv.style.background = 'rgba(102, 126, 234, 0.1)';
        const textElement = segmentDiv.querySelector('p');
        if (textElement) {
          textElement.style.color = '#333';
          textElement.style.fontWeight = '600';
        }

        // Auto-scroll if enabled
        if (this.autoScroll) {
          this.scrollToElement(segmentDiv);
        }
      }
    }
  }

  private scrollToElement(element: HTMLElement): void {
    const containerRect = this.contentDiv.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    // Calculate if element is outside the "sweet spot" (top 25-40% of viewport)
    const topThreshold = containerRect.top + containerRect.height * 0.25;
    const bottomThreshold = containerRect.top + containerRect.height * 0.40;

    const isOutOfView = elementRect.bottom < containerRect.top || elementRect.top > containerRect.bottom;

    if (isOutOfView || elementRect.top < topThreshold || elementRect.bottom > bottomThreshold) {
      this.scrollToCurrent(true);
    }
  }

  private scrollToCurrent(smooth: boolean = true): void {
    if (!this.currentSegmentElement) return;

    const elementRect = this.currentSegmentElement.getBoundingClientRect();
    const containerRect = this.contentDiv.getBoundingClientRect();
    const relativeTop = elementRect.top - containerRect.top + this.contentDiv.scrollTop;

    // Position element in top 1/3 of viewport
    const scrollPosition = relativeTop - (containerRect.height / 3);

    // Mark as programmatic scroll to avoid triggering user scroll detection
    this.lastUserScrollTime = Date.now() + 500;

    this.contentDiv.scrollTo({
      top: Math.max(0, scrollPosition),
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  public setVideoElement(video: HTMLVideoElement): void {
    this.videoElement = video;
    this.attachVideoListeners();
  }

  private attachVideoListeners(): void {
    if (!this.videoElement) return;

    this.timeUpdateHandler = () => {
      if (this.videoElement) {
        this.currentTime = this.videoElement.currentTime;
        this.highlightCurrentSegment();
      }
    };

    this.videoElement.addEventListener('timeupdate', this.timeUpdateHandler);
  }

  private seekToSegment(time: number): void {
    if (this.videoElement) {
      this.videoElement.currentTime = time;
    }
  }

  public updateHeight(height: number): void {
    this.container.style.height = `${height}px`;
    this.container.style.minHeight = `${height}px`;
    this.container.style.maxHeight = `${height}px`;
  }

  public getElement(): HTMLDivElement {
    return this.container;
  }

  public destroy(): void {
    if (this.videoElement && this.timeUpdateHandler) {
      this.videoElement.removeEventListener('timeupdate', this.timeUpdateHandler);
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    this.container.remove();
  }
}
