import { useEffect, useState } from 'react';

interface UseLoadCoursesReturn {
  savedCourses: string[];
  setSavedCourses: (courses: string[]) => void;
  loadCourses: (onLoad: (courses: string[]) => void) => void;
}

export function useLoadCourses(): UseLoadCoursesReturn {
  const [savedCourses, setSavedCourses] = useState<string[]>([]);

  const loadCourses = (onLoad: (courses: string[]) => void) => {
    try {
      const saved = localStorage.getItem("signupFormData");
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedUserCourses = parsed.courses || [];
        
        if (Array.isArray(savedUserCourses) && savedUserCourses.length > 0) {
          setSavedCourses(savedUserCourses);
          onLoad(savedUserCourses);
        }
      }
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  };

  return {
    savedCourses,
    setSavedCourses,
    loadCourses,
  };
}
