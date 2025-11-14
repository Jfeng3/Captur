
import React, { useState } from 'react';
import { VideoPreview } from '@/components/VideoPreview';
import { Timeline } from '@/components/Timeline';
import { PropertiesPanel } from '@/components/PropertiesPanel';

export const VideoEditor: React.FC = () => {
  const [selectedClip, setSelectedClip] = useState<number | null>(null);

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Video Preview */}
        <div className="flex-1 p-6">
          <VideoPreview />
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700">
          <PropertiesPanel selectedClip={selectedClip} />
        </div>
      </div>

      {/* Timeline */}
      <div className="h-48 bg-gray-800 border-t border-gray-700">
        <Timeline onClipSelect={setSelectedClip} selectedClip={selectedClip} />
      </div>
    </div>
  );
};
