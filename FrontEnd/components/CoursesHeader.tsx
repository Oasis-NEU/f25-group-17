import React from 'react';

export function CoursesHeader() {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-1 bg-linear-to-r from-transparent via-red-500 to-transparent rounded-full mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-white">Add your courses</h1>
      <p className="text-gray-300 text-sm mt-2">
        Add the classes you&apos;re taking this term so we can tailor your space.
      </p>
    </div>
  );
}
