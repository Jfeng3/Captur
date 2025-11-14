import { useState } from 'react';
import { API_URL } from '../../config';

interface ActionButtonsProps {
  selectedText: string;
  onResult: (result: string) => void;
}

export function ActionButtons({ selectedText, onResult }: ActionButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [showMarksDropdown, setShowMarksDropdown] = useState(false);

  const handleAction = async (action: string, endpoint: string) => {
    if (!selectedText.trim()) {
      alert('Please select some text first!');
      return;
    }

    setLoading(action);
    setActiveButton(action);

    try {
      const response = await fetch(`${API_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: selectedText }),
      });

      if (!response.ok) {
        throw new Error(`${action} failed`);
      }

      const data = await response.json();

      // Extract result based on endpoint
      let result = '';
      if (endpoint === 'rephrase' && data.alternatives) {
        result = data.alternatives[0];
      } else if (endpoint === 'translate' && data.translated) {
        result = data.translated;
      } else if (endpoint === 'edit' && data.edited) {
        result = data.edited;
      } else if (endpoint === 'reply' && data.reply) {
        result = data.reply;
      }

      onResult(result);
    } catch (error) {
      console.error(`${action} error:`, error);
      alert(`${action} failed. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  const getButtonStyle = (isActive: boolean, isLoading: boolean) => ({
    background: isActive ? 'oklch(0.52 0.15 210)' : 'transparent',
    color: isActive ? 'oklch(1 0 0)' : 'oklch(0.145 0 0)',
    border: 'none',
    height: '36px',
    padding: '0 12px',
    borderRadius: '8px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 200ms ease',
    boxShadow: isActive ? 'none' : 'inset 0 0 0 1px oklch(0.922 0 0)',
    opacity: isLoading ? '0.5' : '1',
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px',
      marginBottom: '16px',
    }}>
      <button
        onClick={() => handleAction('Voice', 'rephrase')}
        disabled={loading !== null}
        style={getButtonStyle(activeButton === 'Voice', loading === 'Voice')}
        onMouseOver={(e) => {
          if (activeButton !== 'Voice' && loading === null) {
            e.currentTarget.style.backgroundColor = 'oklch(0.97 0 0)';
          }
        }}
        onMouseOut={(e) => {
          if (activeButton !== 'Voice') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 20-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        {loading === 'Voice' ? 'Voicing...' : 'Voice'}
      </button>

      <button
        onClick={() => handleAction('Translate', 'translate')}
        disabled={loading !== null}
        style={getButtonStyle(activeButton === 'Translate', loading === 'Translate')}
        onMouseOver={(e) => {
          if (activeButton !== 'Translate' && loading === null) {
            e.currentTarget.style.backgroundColor = 'oklch(0.97 0 0)';
          }
        }}
        onMouseOut={(e) => {
          if (activeButton !== 'Translate') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4"/>
        </svg>
        {loading === 'Translate' ? 'Translating...' : 'Translate'}
      </button>

      <button
        onClick={() => handleAction('Simplify', 'edit')}
        disabled={loading !== null}
        style={getButtonStyle(activeButton === 'Simplify', loading === 'Simplify')}
        onMouseOver={(e) => {
          if (activeButton !== 'Simplify' && loading === null) {
            e.currentTarget.style.backgroundColor = 'oklch(0.97 0 0)';
          }
        }}
        onMouseOut={(e) => {
          if (activeButton !== 'Simplify') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        {loading === 'Simplify' ? 'Simplifying...' : 'Simplify'}
      </button>

      <button
        onClick={() => handleAction('Reply', 'reply')}
        disabled={loading !== null}
        style={getButtonStyle(activeButton === 'Reply', loading === 'Reply')}
        onMouseOver={(e) => {
          if (activeButton !== 'Reply' && loading === null) {
            e.currentTarget.style.backgroundColor = 'oklch(0.97 0 0)';
          }
        }}
        onMouseOut={(e) => {
          if (activeButton !== 'Reply') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        {loading === 'Reply' ? 'Replying...' : 'Reply'}
      </button>

      <div
        style={{ position: 'relative', gridColumn: 'span 2' }}
        onMouseEnter={() => setShowMarksDropdown(true)}
        onMouseLeave={() => setShowMarksDropdown(false)}
      >
        <button
          disabled={loading !== null}
          style={{...getButtonStyle(false, loading !== null), width: '100%', justifyContent: 'center'}}
          onMouseEnter={(e) => {
            if (loading === null) {
              e.currentTarget.style.backgroundColor = 'oklch(0.97 0 0)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16M4 12h16M4 17h16"/>
          </svg>
          Marks
        </button>
        {showMarksDropdown && (
          <div style={{
            position: 'absolute',
            top: '34px',
            left: '0',
            right: '0',
            background: 'oklch(1 0 0)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.15)',
            border: '1px solid oklch(0.922 0 0)',
            padding: '4px',
            zIndex: 10001,
          }}>
            {['thesis', 'statement', 'story', 'case_study', 'contrast'].map((mark) => (
              <button
                key={mark}
                onClick={() => {
                  console.log('Mark selected:', mark);
                  setShowMarksDropdown(false);
                  // TODO: Implement mark functionality
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  color: 'oklch(0.145 0 0)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 150ms ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'oklch(0.52 0.15 210)';
                  e.currentTarget.style.color = 'oklch(1 0 0)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'oklch(0.145 0 0)';
                }}
              >
                Mark as {mark === 'case_study' ? 'Case Study' : mark.charAt(0).toUpperCase() + mark.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
