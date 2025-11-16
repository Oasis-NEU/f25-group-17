import React from 'react';

interface SavedCoursesBannerProps {
  savedCourses: string[];
}

export function SavedCoursesBanner({ savedCourses }: SavedCoursesBannerProps) {
  if (savedCourses.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-gray-900/40 border border-gray-700/40 rounded-xl">
      <h3 className="text-red-400 text-xs font-semibold mb-3">CURRENTLY SAVED</h3>
      <div className="flex flex-wrap gap-2">
        {savedCourses.map((course, idx) => (
          <span 
            key={`saved-${idx}`} 
            className="px-3 py-1 bg-red-600/20 border border-red-600/50 text-red-300 text-sm rounded-full"
          >
            {course}
          </span>
        ))}
      </div>
    </div>
  );
}
