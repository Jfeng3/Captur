import React from 'react';

interface SaveButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ isLoading, onClick }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={isLoading}
      className="save-button"
    >
      {isLoading ? 'Saving...' : 'Save Note'}
    </button>
  );
};