
import React from 'react';
import { Video } from 'lucide-react';

interface TimelineProps {
  onClipSelect: (clipId: number | null) => void;
  selectedClip: number | null;
}

interface TimelineClip {
  id: number;
  name: string;
  duration: number;
  start: number;
  type: 'video' | 'audio';
  color: string;
}

export const Timeline: React.FC<TimelineProps> = ({ onClipSelect, selectedClip }) => {
  const clips: TimelineClip[] = [
    { id: 1, name: 'Intro.mp4', duration: 30, start: 0, type: 'video', color: 'bg-blue-600' },
    { id: 2, name: 'Main Content.mp4', duration: 120, start: 30, type: 'video', color: 'bg-purple-600' },
    { id: 3, name: 'Background Music.mp3', duration: 150, start: 0, type: 'audio', color: 'bg-green-600' },
  ];

  const timelineWidth = 800;
  const totalDuration = 150;

  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Timeline</h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>0:00</span>
          <div className="w-px h-4 bg-gray-600"></div>
          <span>2:30</span>
        </div>
      </div>

      <div className="space-y-2">
        {/* Video Track */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm w-16">Video</span>
          <div className="flex-1 h-12 bg-gray-700 rounded relative">
            {clips.filter(clip => clip.type === 'video').map((clip) => (
              <div
                key={clip.id}
                className={`absolute h-10 mt-1 rounded cursor-pointer transition-all hover:brightness-110 ${clip.color} ${
                  selectedClip === clip.id ? 'ring-2 ring-white' : ''
                }`}
                style={{
                  left: `${(clip.start / totalDuration) * 100}%`,
                  width: `${(clip.duration / totalDuration) * 100}%`,
                }}
                onClick={() => onClipSelect(clip.id)}
              >
                <div className="p-2 flex items-center gap-2 h-full">
                  <Video className="w-3 h-3 text-white" />
                  <span className="text-white text-xs truncate">{clip.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Track */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm w-16">Audio</span>
          <div className="flex-1 h-12 bg-gray-700 rounded relative">
            {clips.filter(clip => clip.type === 'audio').map((clip) => (
              <div
                key={clip.id}
                className={`absolute h-10 mt-1 rounded cursor-pointer transition-all hover:brightness-110 ${clip.color} ${
                  selectedClip === clip.id ? 'ring-2 ring-white' : ''
                }`}
                style={{
                  left: `${(clip.start / totalDuration) * 100}%`,
                  width: `${(clip.duration / totalDuration) * 100}%`,
                }}
                onClick={() => onClipSelect(clip.id)}
              >
                <div className="p-2 flex items-center gap-2 h-full">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-white text-xs truncate">{clip.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Playhead */}
      <div className="relative mt-2">
        <div className="absolute top-0 left-1/4 w-0.5 h-20 bg-red-500 z-10"></div>
        <div className="absolute top-0 left-1/4 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 z-10"></div>
      </div>
    </div>
  );
};
