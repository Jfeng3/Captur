/**
 * Google Docs Floating Selector
 * 
 * Runs in top page and in editor iframes (all_frames: true)
 * Uses clipboard fallback when getSelection() is unreliable in Google Docs
 */

export function initializeGoogleDocsFloatingSelector(callbacks: {
  onSave?: (text: string) => void;
  onRephrase?: (text: string) => void;
} = {}) {

  // Create a single floating button per frame document
  const createButton = (text: string, isPrimary = false) => {
    const btn = document.createElement('button');
    btn.className = 'docs-inline-action hidden';
    btn.textContent = text;
    btn.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      padding: ${isPrimary ? '8px 12px' : '6px 10px'};
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
      cursor: pointer;
      user-select: none;
      transition: all 200ms ease;
      box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.25);
      ${isPrimary 
        ? 'background: hsl(222.2 47.4% 11.2%); color: white;' 
        : 'background: white; color: hsl(222.2 47.4% 11.2%); border: 1px solid rgba(0,0,0,0.1);'
      }
    `;
    
    btn.style.setProperty('pointer-events', 'auto');
    return btn;
  };

  const rephraseBtn = createButton('Rephrase');
  const saveBtn = createButton('Save', true);
  
  // Add both buttons to document
  document.documentElement.appendChild(rephraseBtn);
  document.documentElement.appendChild(saveBtn);

  let hideTimer: number | null = null;

  function hideButtonSoon(ms = 1200) {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => { 
      rephraseBtn.classList.add('hidden');
      saveBtn.classList.add('hidden');
    }, ms);
  }

  function getSelectionTextLoose() {
    const sel = window.getSelection && window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
      const text = sel.toString();
      if (text && text.trim().length) return text;
    }
    return '';
  }

  async function getSelectionTextViaClipboard() {
    // Requires a user gesture to succeed in most cases
    try {
      // Trigger Docs to populate the clipboard with *true* selection text
      const ok = document.execCommand('copy'); // still works on Docs
      if (!ok) return '';
      // Now read it back (needs clipboardRead + user gesture)
      const text = await navigator.clipboard.readText();
      return (text || '').trim();
    } catch (e) {
      return '';
    }
  }

  async function readSelectedText() {
    // Strategy: DOM selection first; if empty, clipboard fallback
    const direct = getSelectionTextLoose();
    if (direct) return direct;

    return await getSelectionTextViaClipboard();
  }

  function positionButtonNearSelection() {
    const sel = window.getSelection && window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      rephraseBtn.classList.add('hidden');
      saveBtn.classList.add('hidden');
      return;
    }
    
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Some Docs selections return zero rects; try endContainer caret rect
    let left = rect.left, top = rect.top;
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      const alt = range.endContainer?.parentElement?.getBoundingClientRect?.();
      if (alt) { left = alt.left; top = alt.top; }
    }
    
    if (Number.isFinite(left) && Number.isFinite(top)) {
      // Position buttons side by side above the selection
      const rephraseLeft = Math.max(8, left + 4);
      const saveLeft = rephraseLeft + 80; // offset save button to the right
      const buttonTop = Math.max(8, top - 40); // float above selection
      
      rephraseBtn.style.left = rephraseLeft + 'px';
      rephraseBtn.style.top = buttonTop + 'px';
      saveBtn.style.left = saveLeft + 'px';
      saveBtn.style.top = buttonTop + 'px';
      
      rephraseBtn.classList.remove('hidden');
      saveBtn.classList.remove('hidden');
      
      hideButtonSoon(); // auto-hide after a bit of inactivity
    } else {
      rephraseBtn.classList.add('hidden');
      saveBtn.classList.add('hidden');
    }
  }

  // Show/hide button on selection changes
  function onSelectionActivity() {
    positionButtonNearSelection();
  }

  // Wire up listeners—Docs re-renders a lot, so keep it simple + throttled
  let rafPending = false;
  const schedule = () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      onSelectionActivity();
    });
  };

  ['mouseup', 'keyup', 'selectionchange'].forEach(evt =>
    document.addEventListener(evt, schedule, { capture: true })
  );

  // If the editor lives in an iframe, scrolling that iframe changes viewport
  document.addEventListener('scroll', schedule, { capture: true, passive: true });

  // Action when buttons are clicked
  rephraseBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hideTimer) clearTimeout(hideTimer);

    const text = await readSelectedText();
    if (!text) {
      alert('No text captured (Docs sometimes hides selection). Try clicking again with selection active.');
      return;
    }

    if (callbacks.onRephrase) {
      callbacks.onRephrase(text);
      console.log('🔄 Rephrase action from Google Docs floating selector:', text.substring(0, 50));
    }

    hideButtonSoon(200);
  });

  saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hideTimer) clearTimeout(hideTimer);

    const text = await readSelectedText();
    if (!text) {
      alert('No text captured (Docs sometimes hides selection). Try clicking again with selection active.');
      return;
    }

    if (callbacks.onSave) {
      callbacks.onSave(text);
      console.log('📝 Save action from Google Docs floating selector:', text.substring(0, 50));
    }

    hideButtonSoon(200);
  });

  // Add hover effects
  rephraseBtn.addEventListener('mouseover', () => {
    rephraseBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
  });
  rephraseBtn.addEventListener('mouseout', () => {
    rephraseBtn.style.backgroundColor = 'white';
  });

  saveBtn.addEventListener('mouseover', () => {
    saveBtn.style.backgroundColor = 'hsl(222.2 47.4% 20%)';
  });
  saveBtn.addEventListener('mouseout', () => {
    saveBtn.style.backgroundColor = 'hsl(222.2 47.4% 11.2%)';
  });

  // Also reposition on window resize
  window.addEventListener('resize', schedule, { passive: true });

  // Hide on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      rephraseBtn.classList.add('hidden');
      saveBtn.classList.add('hidden');
    }
  }, true);

  // Add CSS for hidden class
  const style = document.createElement('style');
  style.textContent = `
    .docs-inline-action.hidden {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}