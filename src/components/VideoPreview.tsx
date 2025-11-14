
import React from 'react';
import { Play, Volume2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const VideoPreview: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-black rounded-lg flex items-center justify-center relative group">
        {/* Video Preview Area */}
        <div className="text-gray-500 text-center">
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-800 rounded-lg flex items-center justify-center">
            <Play className="w-12 h-12" />
          </div>
          <p className="text-lg">No video loaded</p>
          <p className="text-sm opacity-70">Import a video to start editing</p>
        </div>

        {/* Video Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Play className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Volume2 className="w-4 h-4" />
              </Button>
              <span className="text-white text-sm">00:00 / 00:00</span>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
            <div className="bg-blue-500 h-1 rounded-full w-0"></div>
          </div>
        </div>
      </div>

      {/* Preview Controls */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-gray-400 text-sm">Resolution: 1920x1080</span>
        <span className="text-gray-600">•</span>
        <span className="text-gray-400 text-sm">Frame Rate: 30fps</span>
        <span className="text-gray-600">•</span>
        <span className="text-gray-400 text-sm">Zoom: 100%</span>
      </div>
    </div>
  );
};
