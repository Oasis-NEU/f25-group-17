import React from 'react';

interface CourseActionsProps {
  coursesLength: number;
  onAddCourse: () => void;
  onRemoveAllCourses: () => void;
}

export function CourseActions({
  coursesLength,
  onAddCourse,
  onRemoveAllCourses,
}: CourseActionsProps) {
  return (
    <div className="flex gap-3 mb-6">
      <button
        type="button"
        onClick={onAddCourse}
        className="text-sm text-red-300 hover:text-red-100"
      >
        + Add another course
      </button>
      {coursesLength > 1 && (
        <button
          type="button"
          onClick={onRemoveAllCourses}
          className="text-sm text-red-300 hover:text-red-100 ml-auto"
        >
          Remove all courses
        </button>
      )}
    </div>
  );
}
