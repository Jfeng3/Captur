
import React from 'react';
import { MessageCircle, Play, Pause, RotateCcw, RotateCw, Scissors, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolbarProps {
  isChatOpen: boolean;
  onToggleChat: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ isChatOpen, onToggleChat }) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Chat Toggle */}
          {!isChatOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleChat}
              className="text-gray-400 hover:text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          )}
          
          {/* Project Title */}
          <h1 className="text-xl font-bold text-white">VideoEdit Pro</h1>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Play className="w-4 h-4 mr-2" />
            Play
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Scissors className="w-4 h-4 mr-2" />
            Cut
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <RotateCw className="w-4 h-4 mr-2" />
            Redo
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};
