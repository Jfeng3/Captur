import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NativeHighlightTooltip, NativeHighlightTooltipOptions } from './NativeHighlightTooltip';

describe('NativeHighlightTooltip', () => {
  let tooltip: NativeHighlightTooltip;
  let mockOnTranslate: () => void;

  beforeEach(() => {
    // Mock requestAnimationFrame to execute immediately
    globalThis.requestAnimationFrame = vi.fn((cb) => {
      cb(0);
      return 0;
    }) as any;

    mockOnTranslate = vi.fn() as () => void;
    tooltip = new NativeHighlightTooltip({ onTranslate: mockOnTranslate });
  });

  afterEach(() => {
    tooltip.destroy();
    vi.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should create instance with default options', () => {
      const defaultTooltip = new NativeHighlightTooltip();
      expect(defaultTooltip).toBeInstanceOf(NativeHighlightTooltip);
      expect(defaultTooltip.getElement()).toBeNull();
    });

    it('should create instance with custom options', () => {
      const customCallback = vi.fn() as () => void;
      const customOptions: NativeHighlightTooltipOptions = {
        onTranslate: customCallback,
      };
      const customTooltip = new NativeHighlightTooltip(customOptions);
      expect(customTooltip).toBeInstanceOf(NativeHighlightTooltip);
    });

    it('should initialize with empty selected text', () => {
      expect(tooltip.getSelectedText()).toBe('');
    });
  });

  describe('Selected Text Management', () => {
    it('should set selected text', () => {
      const testText = 'Hello World';
      tooltip.setSelectedText(testText);
      expect(tooltip.getSelectedText()).toBe(testText);
    });

    it('should get selected text', () => {
      tooltip.setSelectedText('Test text');
      expect(tooltip.getSelectedText()).toBe('Test text');
    });

    it('should update selected text multiple times', () => {
      tooltip.setSelectedText('First');
      expect(tooltip.getSelectedText()).toBe('First');

      tooltip.setSelectedText('Second');
      expect(tooltip.getSelectedText()).toBe('Second');
    });

    it('should handle empty string', () => {
      tooltip.setSelectedText('');
      expect(tooltip.getSelectedText()).toBe('');
    });

    it('should handle special characters', () => {
      const specialText = 'Hello! @#$% 中文 测试';
      tooltip.setSelectedText(specialText);
      expect(tooltip.getSelectedText()).toBe(specialText);
    });
  });

  describe('Tooltip Element Creation', () => {
    it('should create tooltip element', () => {
      const element = tooltip.create();
      expect(element).toBeInstanceOf(HTMLDivElement);
      expect(element.id).toBe('captur-native-highlight-tooltip');
    });

    it('should return the same element on multiple calls to getElement', () => {
      tooltip.create();
      const element1 = tooltip.getElement();
      const element2 = tooltip.getElement();
      expect(element1).toBe(element2);
    });

    it('should create element with correct initial styles', () => {
      const element = tooltip.create();
      const styles = element.style;

      expect(styles.position).toBe('absolute');
      expect(styles.width).toBe('8px');
      expect(styles.height).toBe('8px');
      expect(styles.background).toBe('#62b3bd'); // Teal color
      expect(styles.borderRadius).toBe('50%');
      expect(styles.cursor).toBe('pointer');
      expect(styles.opacity).toBe('0');
    });

    it('should have maximum z-index for visibility', () => {
      const element = tooltip.create();
      expect(element.style.zIndex).toBe('2147483647');
    });
  });

  describe('Tooltip Positioning', () => {
    let mockSelection: Selection;
    let mockRange: Range;

    beforeEach(() => {
      // Create a mock range with getBoundingClientRect
      mockRange = {
        getBoundingClientRect: vi.fn(() => ({
          top: 100,
          left: 200,
          right: 300,
          bottom: 120,
          width: 100,
          height: 20,
          x: 200,
          y: 100,
        } as DOMRect)),
      } as any;

      // Create a mock selection
      mockSelection = {
        getRangeAt: vi.fn(() => mockRange),
      } as any;

      // Mock window scroll values
      window.scrollX = 50;
      window.scrollY = 100;
    });

    it('should position tooltip at the end of selected text', () => {
      const element = tooltip.create();
      tooltip.position(mockSelection);

      // Expected calculations:
      // top = 100 (rect.top) + 100 (scrollY) + 10 (height/2) - 4 = 206px
      // left = 300 (rect.right) + 50 (scrollX) + 4 = 354px
      expect(element.style.top).toBe('206px');
      expect(element.style.left).toBe('354px');
    });

    it('should fade in the tooltip after positioning', () => {
      const element = tooltip.create();
      tooltip.position(mockSelection);

      // requestAnimationFrame is mocked to execute immediately
      expect(element.style.opacity).toBe('1');
    });

    it('should handle positioning without element', () => {
      // Should not throw error
      expect(() => tooltip.position(mockSelection)).not.toThrow();
    });

    it('should call getRangeAt on selection', () => {
      tooltip.create();
      tooltip.position(mockSelection);
      expect(mockSelection.getRangeAt).toHaveBeenCalledWith(0);
    });

    it('should call getBoundingClientRect on range', () => {
      tooltip.create();
      tooltip.position(mockSelection);
      expect(mockRange.getBoundingClientRect).toHaveBeenCalled();
    });
  });

  describe('Hover Interactions', () => {
    it('should trigger onTranslate callback on mouse enter', () => {
      const element = tooltip.create();

      // Simulate mouseenter event
      const mouseEnterEvent = new Event('mouseenter');
      element.dispatchEvent(mouseEnterEvent);

      expect(mockOnTranslate).toHaveBeenCalledTimes(1);
    });

    it('should apply hover styles on mouse enter', () => {
      const element = tooltip.create();

      // Simulate mouseenter
      element.dispatchEvent(new Event('mouseenter'));

      expect(element.style.transform).toBe('scale(1.2)');
      expect(element.style.boxShadow).toBe('0 3px 8px rgba(98, 179, 189, 0.6)');
    });

    it('should reset styles on mouse leave', () => {
      const element = tooltip.create();

      // First enter
      element.dispatchEvent(new Event('mouseenter'));

      // Then leave
      element.dispatchEvent(new Event('mouseleave'));

      expect(element.style.transform).toBe('scale(1)');
      expect(element.style.boxShadow).toBe('0 2px 6px rgba(98, 179, 189, 0.4)');
    });

    it('should not throw if onTranslate is not provided', () => {
      const tooltipWithoutCallback = new NativeHighlightTooltip();
      const element = tooltipWithoutCallback.create();

      expect(() => {
        element.dispatchEvent(new Event('mouseenter'));
      }).not.toThrow();
    });
  });

  describe('Translation Result Display', () => {
    it('should display translation result', () => {
      const element = tooltip.create();
      const translatedText = 'Hello (你好) World (世界)';

      tooltip.showTranslationResult(translatedText);

      // Check that styles changed to full tooltip view
      expect(element.style.background).toBe('rgba(255, 255, 255, 0.95)');
      expect(element.style.borderRadius).toBe('12px');
      expect(element.style.maxWidth).toBe('500px');
    });

    it('should show translated text content', () => {
      const element = tooltip.create();
      const translatedText = 'Algorithm (算法) is important';

      tooltip.showTranslationResult(translatedText);

      // Find the translation container
      const container = element.querySelector('div');
      expect(container).toBeTruthy();
      expect(container?.textContent).toBe(translatedText);
    });

    it('should apply backdrop blur effect', () => {
      const element = tooltip.create();
      tooltip.showTranslationResult('Test');

      // Happy-dom may not support backdrop-filter, check if cssText contains it
      const cssText = element.style.cssText;
      expect(cssText).toContain('backdrop-filter');
      expect(cssText).toContain('blur');
    });

    it('should clear previous content before showing result', () => {
      const element = tooltip.create();

      // Add some initial content
      element.innerHTML = '<span>Old content</span>';

      tooltip.showTranslationResult('New translation');

      // Old content should be gone
      expect(element.querySelector('span')).toBeNull();
    });

    it('should handle empty translation text', () => {
      const element = tooltip.create();

      expect(() => {
        tooltip.showTranslationResult('');
      }).not.toThrow();

      const container = element.querySelector('div');
      expect(container?.textContent).toBe('');
    });

    it('should not throw if element is null', () => {
      expect(() => {
        tooltip.showTranslationResult('Test');
      }).not.toThrow();
    });

    it('should display translation with special characters', () => {
      const element = tooltip.create();
      const complexText = 'Machine learning (机器学习) & AI (人工智能)!';

      tooltip.showTranslationResult(complexText);

      const container = element.querySelector('div');
      expect(container?.textContent).toBe(complexText);
    });
  });

  describe('Loading State', () => {
    it('should set loading state to true', () => {
      const element = tooltip.create();
      tooltip.setLoading(true);

      expect(element.style.background).toBe('#9ca3af'); // Gray color
      expect(element.style.cursor).toBe('wait');
    });

    it('should set loading state to false', () => {
      const element = tooltip.create();
      tooltip.setLoading(false);

      expect(element.style.background).toBe('#62b3bd'); // Teal color
      expect(element.style.cursor).toBe('pointer');
    });

    it('should toggle loading state multiple times', () => {
      const element = tooltip.create();

      tooltip.setLoading(true);
      expect(element.style.cursor).toBe('wait');

      tooltip.setLoading(false);
      expect(element.style.cursor).toBe('pointer');

      tooltip.setLoading(true);
      expect(element.style.cursor).toBe('wait');
    });

    it('should not throw if element is null', () => {
      expect(() => {
        tooltip.setLoading(true);
      }).not.toThrow();
    });
  });

  describe('Tooltip Destruction', () => {
    it('should remove element from DOM', () => {
      const element = tooltip.create();
      document.body.appendChild(element);

      expect(document.body.contains(element)).toBe(true);

      tooltip.destroy();

      expect(document.body.contains(element)).toBe(false);
    });

    it('should set element to null after destroy', () => {
      tooltip.create();
      expect(tooltip.getElement()).not.toBeNull();

      tooltip.destroy();
      expect(tooltip.getElement()).toBeNull();
    });

    it('should be safe to call destroy multiple times', () => {
      tooltip.create();

      expect(() => {
        tooltip.destroy();
        tooltip.destroy();
        tooltip.destroy();
      }).not.toThrow();
    });

    it('should not throw if called without creating element', () => {
      expect(() => {
        tooltip.destroy();
      }).not.toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete translation workflow', () => {
      // 1. Set selected text
      tooltip.setSelectedText('Machine learning');
      expect(tooltip.getSelectedText()).toBe('Machine learning');

      // 2. Create tooltip
      const element = tooltip.create();
      expect(element).toBeInstanceOf(HTMLDivElement);

      // 3. Position tooltip
      const mockSelection = {
        getRangeAt: vi.fn(() => ({
          getBoundingClientRect: () => ({
            top: 100, left: 200, right: 300, bottom: 120,
            width: 100, height: 20, x: 200, y: 100,
          }),
        })),
      } as any;
      tooltip.position(mockSelection);

      // 4. Set loading state
      tooltip.setLoading(true);
      expect(element.style.cursor).toBe('wait');

      // 5. Show translation result
      tooltip.showTranslationResult('Machine learning (机器学习)');
      expect(element.querySelector('div')?.textContent).toBe('Machine learning (机器学习)');

      // 6. Clear loading state
      tooltip.setLoading(false);

      // 7. Destroy tooltip
      tooltip.destroy();
      expect(tooltip.getElement()).toBeNull();
    });

    it('should handle user hovering before translation completes', () => {
      const element = tooltip.create();
      tooltip.setSelectedText('Test');

      // User hovers
      element.dispatchEvent(new Event('mouseenter'));
      expect(mockOnTranslate).toHaveBeenCalled();

      // Loading starts
      tooltip.setLoading(true);
      expect(element.style.cursor).toBe('wait');

      // Translation completes
      tooltip.showTranslationResult('Test (测试)');
      expect(element.querySelector('div')).toBeTruthy();
    });

    it('should maintain selected text through tooltip lifecycle', () => {
      const testText = 'Persistent text';
      tooltip.setSelectedText(testText);

      tooltip.create();
      expect(tooltip.getSelectedText()).toBe(testText);

      tooltip.showTranslationResult('Translation');
      expect(tooltip.getSelectedText()).toBe(testText);

      tooltip.destroy();
      expect(tooltip.getSelectedText()).toBe(testText);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long translation text', () => {
      const element = tooltip.create();
      const longText = 'This is a very long translation text '.repeat(50);

      expect(() => {
        tooltip.showTranslationResult(longText);
      }).not.toThrow();

      // Max-width should limit the display
      expect(element.style.maxWidth).toBe('500px');
    });

    it('should handle unicode and emoji characters', () => {
      const element = tooltip.create();
      const unicodeText = '🚀 Rocket (火箭) 🌟 Star (星星) 💡 Idea (想法)';

      tooltip.showTranslationResult(unicodeText);
      const container = element.querySelector('div');
      expect(container?.textContent).toBe(unicodeText);
    });

    it('should handle positioning with zero dimensions', () => {
      tooltip.create();
      const mockSelection = {
        getRangeAt: vi.fn(() => ({
          getBoundingClientRect: () => ({
            top: 0, left: 0, right: 0, bottom: 0,
            width: 0, height: 0, x: 0, y: 0,
          }),
        })),
      } as any;

      expect(() => {
        tooltip.position(mockSelection);
      }).not.toThrow();
    });

    it('should handle rapid state changes', () => {
      const element = tooltip.create();

      // Rapid loading state changes
      for (let i = 0; i < 10; i++) {
        tooltip.setLoading(i % 2 === 0);
      }

      // Should end in non-loading state
      expect(element.style.cursor).toBe('pointer');
    });
  });
});
