import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ActivityHeatmap from './ActivityHeatmap';
import { useNotesStore } from '../stores/notesStore';

export default function Sidebar() {
  const {
    notes,
    filterStatus,
    filterTag,
    sidebarCollapsed,
    setFilterStatus,
    setFilterTag,
    setSidebarCollapsed
  } = useNotesStore();

  const [activityData, setActivityData] = useState<{ date: Date; count: number }[]>([]);
  
  // Calculate activity data from all notes
  useEffect(() => {
    const activityMap = new Map<string, number>();
    
    notes.forEach(note => {
      // Ensure we have a valid date
      if (!note.updatedAt) return;
      
      const date = new Date(note.updatedAt);
      // Check if date is valid
      if (isNaN(date.getTime())) return;
      
      date.setHours(0, 0, 0, 0);
      const key = date.toISOString().split('T')[0];
      activityMap.set(key, (activityMap.get(key) || 0) + 1);
    });
    
    const data = Array.from(activityMap.entries()).map(([dateStr, count]) => ({
      date: new Date(dateStr),
      count
    }));
    
    setActivityData(data);
  }, [notes]);
  
  // Calculate tag counts
  const tagCounts = notes.reduce((acc, note) => {
    acc[note.tag] = (acc[note.tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const allTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  
  // Calculate counts for filters
  const draftCount = notes.filter(n => n.status === 'draft').length;
  
  if (sidebarCollapsed) {
    return (
      <div className="bg-white border-r border-[#E5E5EA] w-12 flex flex-col items-center py-4">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="text-[#71717A] hover:text-black p-2"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white border-r border-[#E5E5EA] w-64 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E5EA] flex items-center justify-between">
        <h2 className="font-semibold text-black">Navigation</h2>
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="text-[#71717A] hover:text-black p-1"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Activity Heatmap */}
        <div className="p-4 border-b border-[#E5E5EA]">
          <h3 className="text-sm font-medium text-black mb-3">Activity</h3>
          <div className="overflow-x-auto">
            <ActivityHeatmap data={activityData} />
          </div>
        </div>
        
        {/* X Post Filters */}
        <div className="p-4 border-b border-[#E5E5EA]">
          <h3 className="text-sm font-medium text-black mb-3">X Posts</h3>
          <div className="space-y-2">
            <button
              onClick={() => setFilterStatus('draft')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between
                ${filterStatus === 'draft' ? 'bg-[#fffef9] text-black font-medium' : 'text-[#71717A] hover:bg-[#fffef9]'}`}
            >
              <span>Drafts</span>
              <span className="text-xs">{draftCount}</span>
            </button>
          </div>
        </div>
        
        {/* Tags */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-black mb-3">Tags</h3>
          <div className="space-y-1">
            {allTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between
                  ${filterTag === tag ? 'bg-[#fffef9] text-black font-medium' : 'text-[#71717A] hover:bg-[#fffef9]'}`}
              >
                <span>#{tag}</span>
                <span className="text-xs">({count})</span>
              </button>
            ))}
            {allTags.length === 0 && (
              <p className="text-[#71717A] text-sm">No tags yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}