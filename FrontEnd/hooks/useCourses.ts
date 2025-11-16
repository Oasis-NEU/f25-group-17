import { useState, useCallback } from 'react';

interface UseCoursesReturn {
  courses: Array<{ courseName: string }>;
  courseSearch: string[];
  showCourseDropdown: boolean[];
  isSelectingCourse: boolean[];
  addEmptyCourseInput: () => void;
  removeCourseInput: (index: number) => void;
  removeAllCourses: () => void;
  handleCourseNameInputChange: (index: number, value: string) => void;
  handleCourseSelectionIndex: (index: number, courseName: string) => void;
  handleCourseFocus: (index: number) => void;
  handleCourseBlur: (index: number, classNames: string[]) => void;
  closeDropdown: (index: number) => void;
}

export function useCourses(initialCourses: string[] = []): UseCoursesReturn {
  const [courses, setCourses] = useState([{ courseName: "" }]);
  const [courseSearch, setCourseSearch] = useState<string[]>([""]);
  const [showCourseDropdown, setShowCourseDropdown] = useState<boolean[]>([false]);
  const [isSelectingCourse, setIsSelectingCourse] = useState<boolean[]>([false]);

  const addEmptyCourseInput = useCallback(() => {
    setCourses(prev => [...prev, { courseName: "" }]);
    setCourseSearch(prev => [...prev, ""]);
    setShowCourseDropdown(prev => [...prev, false]);
    setIsSelectingCourse(prev => [...prev, false]);
  }, []);

  const removeCourseInput = useCallback((index: number) => {
    setCourses(prev => prev.filter((_, i) => i !== index));
    setCourseSearch(prev => prev.filter((_, i) => i !== index));
    setShowCourseDropdown(prev => prev.filter((_, i) => i !== index));
    setIsSelectingCourse(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeAllCourses = useCallback(() => {
    setCourses([{ courseName: "" }]);
    setCourseSearch([""]);
    setShowCourseDropdown([false]);
    setIsSelectingCourse([false]);
  }, []);

  const handleCourseNameInputChange = useCallback((index: number, value: string) => {
    // Update search state (this controls the input display)
    setCourseSearch(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    
    // Update courses state
    setCourses(prev => {
      const next = [...prev];
      next[index].courseName = value;
      return next;
    });
    
    // Show dropdown when typing
    setShowCourseDropdown(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, []);

  const handleCourseSelectionIndex = useCallback((index: number, courseName: string) => {
    setIsSelectingCourse(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    
    setCourseSearch(prev => {
      const next = [...prev];
      next[index] = courseName;
      return next;
    });
    
    setCourses(prev => {
      const next = [...prev];
      next[index].courseName = courseName;
      return next;
    });
    
    setShowCourseDropdown(prev => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  }, []);

  const handleCourseFocus = useCallback((index: number) => {
    const previousValue = courseSearch[index];
    
    if (!window.previousSearchValues) {
      window.previousSearchValues = {};
    }
    window.previousSearchValues[index] = previousValue;
    
    setCourseSearch(prev => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
    
    setShowCourseDropdown(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    
    setIsSelectingCourse(prev => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  }, [courseSearch]);

  const handleCourseBlur = useCallback((index: number, classNames: string[]) => {
    setTimeout(() => {
      const search = courseSearch[index];
      
      if (!search || search.trim() === "") {
        const previousValue = window.previousSearchValues?.[index] || "";
        setCourseSearch(prev => {
          const next = [...prev];
          next[index] = previousValue;
          return next;
        });
        setCourses(prev => {
          const next = [...prev];
          next[index].courseName = previousValue;
          return next;
        });
        setShowCourseDropdown(prev => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
        return;
      }

      const filtered = classNames.filter(c =>
        c.toLowerCase().includes(search.toLowerCase())
      );
      
      if (filtered.length > 0 && search !== courses[index].courseName) {
        handleCourseSelectionIndex(index, filtered[0]);
      }
      
      setShowCourseDropdown(prev => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
      
      setIsSelectingCourse(prev => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }, 150);
  }, [courseSearch, courses, handleCourseSelectionIndex]);

  const closeDropdown = useCallback((index: number) => {
    setShowCourseDropdown(prev => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  }, []);

  return {
    courses,
    courseSearch,
    showCourseDropdown,
    isSelectingCourse,
    addEmptyCourseInput,
    removeCourseInput,
    removeAllCourses,
    handleCourseNameInputChange,
    handleCourseSelectionIndex,
    handleCourseFocus,
    handleCourseBlur,
    closeDropdown,
  };
}
