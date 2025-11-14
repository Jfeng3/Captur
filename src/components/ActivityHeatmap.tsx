import React from 'react';

interface ActivityDay {
  date: Date;
  count: number;
}

interface ActivityHeatmapProps {
  data: ActivityDay[];
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const weeks = 12; // Show last 12 weeks
  const daysOfWeek = 7;
  const cellSize = 12;
  const cellGap = 3;
  
  // Generate grid of last 12 weeks
  const grid: (ActivityDay | null)[][] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate the first day (12 weeks ago), align to the start of the week (Monday)
  const startDate = new Date(today);
  const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Monday ... 6 = Sunday
  startDate.setDate(startDate.getDate() - (weeks * 7) - dayOfWeek);
  
  // Create a map for quick lookup
  const dataMap = new Map<string, number>();
  data.forEach(day => {
    const key = day.date.toISOString().split('T')[0];
    dataMap.set(key, day.count);
  });
  
  // Fill the grid
  for (let week = 0; week < weeks; week++) {
    const weekData: (ActivityDay | null)[] = [];
    for (let day = 0; day < daysOfWeek; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (week * 7) + day);
      
      if (currentDate <= today) {
        const key = currentDate.toISOString().split('T')[0];
        const count = dataMap.get(key) || 0;
        weekData.push({ date: currentDate, count });
      } else {
        weekData.push(null);
      }
    }
    grid.push(weekData);
  }
  
  const getColor = (count: number) => {
    if (count === 0) return '#E5E5EA';
    if (count === 1) return '#B8B8C0';
    if (count === 2) return '#71717A';
    return '#000000';
  };
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        {/* Day labels aligned with heatmap rows */}
        <div
          className="w-5 text-xs text-[#71717A]"
          style={{ paddingTop: 20 }}
        >
          {Array.from({ length: daysOfWeek }).map((_, index) => (
            <div
              key={index}
              style={{
                height: cellSize,
                marginBottom: index === daysOfWeek - 1 ? 0 : cellGap,
                fontSize: 10,
                lineHeight: `${cellSize}px`,
              }}
            >
              {(index === 1 || index === 3 || index === 5) ? days[index] : ''}
            </div>
          ))}
        </div>
        <svg width={weeks * (cellSize + cellGap)} height={daysOfWeek * (cellSize + cellGap) + 20}>
          {/* Month labels */}
          {grid.map((week, weekIndex) => {
            const firstDay = week[0];
            if (firstDay && firstDay.date.getDate() <= 7 && weekIndex > 0) {
              return (
                <text
                  key={weekIndex}
                  x={weekIndex * (cellSize + cellGap)}
                  y={10}
                  className="text-xs fill-[#71717A]"
                  style={{ fontSize: '10px' }}
                >
                  {months[firstDay.date.getMonth()]}
                </text>
              );
            }
            return null;
          })}
          
          {/* Grid */}
          {grid.map((week, weekIndex) => (
            <g key={weekIndex}>
              {week.map((day, dayIndex) => {
                if (!day) return null;
                return (
                  <rect
                    key={`${weekIndex}-${dayIndex}`}
                    x={weekIndex * (cellSize + cellGap)}
                    y={dayIndex * (cellSize + cellGap) + 20}
                    width={cellSize}
                    height={cellSize}
                    fill={getColor(day.count)}
                    rx={2}
                    className="cursor-pointer hover:opacity-80"
                  >
                    <title>{`${day.date.toLocaleDateString()}: ${day.count} posts`}</title>
                  </rect>
                );
              })}
            </g>
          ))}
        </svg>
      </div>
      
      
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-[#71717A]">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getColor(level) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}