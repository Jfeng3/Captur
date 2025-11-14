/**
 * WritingNotes - Yellow note editor that appears next to StickyNotes
 * Allows users to write custom notes while viewing takeaways
 */

interface NoteData {
  takeAways?: string[];
  markedSentences?: string[];
}

export function showWritingNotes(
  containerElement: HTMLElement,
  onSave?: (content: string) => void,
  noteData?: NoteData
) {
  console.log('Writing notes button clicked!');

  // Remove existing editor if any
  const existingEditor = document.getElementById('captur-note-editor');
  const existingDropdown = document.getElementById('captur-autocomplete-dropdown');
  if (existingEditor) {
    console.log('Removing existing editor');
    existingEditor.remove();
    existingDropdown?.remove();
    return;
  }

  // Get sticky notes position and height
  const stickyNotesRect = containerElement.getBoundingClientRect();
  const editorLeft = stickyNotesRect.right + 20; // 20px gap to the right
  const editorBottom = window.innerHeight - stickyNotesRect.bottom;
  const editorHeight = 300; // Fixed height of 300px

  console.log('Creating note editor at position:', { editorLeft, editorBottom, editorHeight, stickyNotesRect });

  // Create note editor container positioned to the right of sticky notes
  const editorContainer = document.createElement('div');
  editorContainer.id = 'captur-note-editor';
  editorContainer.style.cssText = `
    position: fixed !important;
    bottom: ${editorBottom}px !important;
    left: ${editorLeft}px !important;
    width: 360px !important;
    height: ${editorHeight}px !important;
    background: #fef9c3 !important;
    border-radius: 10px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    z-index: 10 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    display: flex !important;
    flex-direction: column !important;
    animation: slideIn 0.3s ease-out !important;
  `;

  // Editor header
  const editorHeader = document.createElement('div');
  editorHeader.style.cssText = `
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 12px 16px !important;
    border-bottom: 1px solid #e5e7eb !important;
  `;

  const editorTitle = document.createElement('h3');
  editorTitle.textContent = '📝 Note';
  editorTitle.style.cssText = `
    margin: 0 !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    color: #1f2937 !important;
  `;

  const editorCloseBtn = document.createElement('button');
  editorCloseBtn.innerHTML = '×';
  editorCloseBtn.title = 'Close';
  editorCloseBtn.style.cssText = `
    background: transparent !important;
    border: none !important;
    color: #6b7280 !important;
    font-size: 24px !important;
    cursor: pointer !important;
    width: 28px !important;
    height: 28px !important;
    border-radius: 6px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: background 0.2s !important;
  `;
  editorCloseBtn.onmouseover = () => {
    editorCloseBtn.style.background = '#f3f4f6 !important';
  };
  editorCloseBtn.onmouseout = () => {
    editorCloseBtn.style.background = 'transparent !important';
  };
  editorCloseBtn.onclick = () => {
    const content = textarea.value.trim();
    if (content && onSave) {
      console.log('Saving note content:', content);
      onSave(content);
    }
    editorContainer.remove();
    dropdown.remove();
  };

  editorHeader.appendChild(editorTitle);
  editorHeader.appendChild(editorCloseBtn);

  // Textarea for note content
  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Start typing your note... (Type @ to insert takeaways/sentences)';
  textarea.style.cssText = `
    flex: 1 !important;
    border: none !important;
    outline: none !important;
    padding: 16px !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
    color: #1f2937 !important;
    background: transparent !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    resize: none !important;
  `;

  // Autocomplete dropdown
  const dropdown = document.createElement('div');
  dropdown.id = 'captur-autocomplete-dropdown';
  dropdown.style.cssText = `
    position: fixed !important;
    background: white !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    height: ${editorHeight}px !important;
    overflow-y: auto !important;
    display: none !important;
    z-index: 20 !important;
    min-width: 300px !important;
  `;

  // Append dropdown to body (not inside editor) for better positioning
  document.body.appendChild(dropdown);

  let selectedIndex = -1;
  let autocompleteItems: string[] = [];

  // Handle @ trigger
  textarea.addEventListener('input', () => {
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1 && cursorPos - lastAtSymbol <= 50) {
      const query = textBeforeCursor.substring(lastAtSymbol + 1).toLowerCase();

      // Build autocomplete list with truncated text (first 60 chars)
      autocompleteItems = [];
      if (noteData?.takeAways) {
        autocompleteItems.push(...noteData.takeAways.map(t => {
          const cleanText = t.replace(/<[^>]*>/g, ''); // Remove HTML tags
          const truncated = cleanText.length > 60 ? cleanText.substring(0, 60) + '...' : cleanText;
          return `💡 ${truncated}`;
        }));
      }
      if (noteData?.markedSentences) {
        autocompleteItems.push(...noteData.markedSentences.map(s => {
          const truncated = s.length > 60 ? s.substring(0, 60) + '...' : s;
          return `📌 ${truncated}`;
        }));
      }

      // Filter by query
      const filtered = autocompleteItems.filter(item =>
        item.toLowerCase().includes(query)
      );

      if (filtered.length > 0) {
        showDropdown(filtered);
      } else {
        hideDropdown();
      }
    } else {
      hideDropdown();
    }
  });

  // Handle keyboard navigation
  textarea.addEventListener('keydown', (e) => {
    if (dropdown.style.display === 'none') return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, dropdown.children.length - 1);
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection();
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      selectItem(selectedIndex);
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  function showDropdown(items: string[]) {
    dropdown.innerHTML = '';
    selectedIndex = -1;

    items.forEach((item, index) => {
      const option = document.createElement('div');
      option.textContent = item;
      option.style.cssText = `
        padding: 8px 12px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        color: #1f2937 !important;
        transition: background 0.2s !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      `;
      option.onmouseover = () => {
        option.style.background = '#f3f4f6 !important';
      };
      option.onmouseout = () => {
        if (selectedIndex !== index) {
          option.style.background = 'white !important';
        }
      };
      option.onclick = () => selectItem(index);
      dropdown.appendChild(option);
    });

    // Position dropdown above the @ symbol
    const textareaRect = textarea.getBoundingClientRect();
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Get position of cursor for more accurate placement
    // Create a temporary div to measure text dimensions
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = textarea.style.cssText;
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.wordWrap = 'break-word';
    tempDiv.style.width = textarea.clientWidth + 'px';
    tempDiv.textContent = text.substring(0, cursorPos);
    document.body.appendChild(tempDiv);

    const lines = tempDiv.textContent?.split('\n').length || 1;
    const lineHeight = 22; // Approximate line height
    document.body.removeChild(tempDiv);

    // Position dropdown's bottom slightly above @ symbol
    const atSymbolTop = textareaRect.top + 16 + (lines - 1) * lineHeight;
    const dropdownBottom = window.innerHeight - atSymbolTop + 10; // 10px above @ symbol
    dropdown.style.left = `${textareaRect.left + 16}px`;
    dropdown.style.bottom = `${dropdownBottom}px`;
    dropdown.style.top = 'auto';
    dropdown.style.display = 'block';
  }

  function hideDropdown() {
    dropdown.style.display = 'none';
    selectedIndex = -1;
  }

  function updateSelection() {
    Array.from(dropdown.children).forEach((child, index) => {
      const elem = child as HTMLElement;
      elem.style.background = index === selectedIndex ? '#f3f4f6 !important' : 'white !important';
    });
    if (selectedIndex >= 0 && dropdown.children[selectedIndex]) {
      dropdown.children[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function selectItem(index: number) {
    const item = dropdown.children[index]?.textContent;
    if (!item) return;

    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    // Remove emoji prefix for insertion
    const cleanItem = item.replace(/^[💡📌]\s/, '');

    // Replace @ and query with selected item
    const newText = text.substring(0, lastAtSymbol) + cleanItem + text.substring(cursorPos);
    textarea.value = newText;
    textarea.selectionStart = textarea.selectionEnd = lastAtSymbol + cleanItem.length;

    hideDropdown();
    textarea.focus();
  }

  // Assemble editor
  editorContainer.appendChild(editorHeader);
  editorContainer.appendChild(textarea);
  document.body.appendChild(editorContainer);

  console.log('Note editor added to DOM:', editorContainer);
  console.log('Editor final styles:', {
    position: editorContainer.style.position,
    bottom: editorContainer.style.bottom,
    left: editorContainer.style.left,
    width: editorContainer.style.width,
    background: editorContainer.style.background,
    zIndex: editorContainer.style.zIndex,
    display: editorContainer.style.display
  });

  // Focus textarea
  textarea.focus();
}
