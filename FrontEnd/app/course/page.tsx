"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../supabase/lib/supabase";
import Link from "next/link";

// Extend Window interface to include previousCourseValues
declare global {
  interface Window {
    previousCourseValues?: { [key: number]: string };
  }
}


export default function OnboardingCourses() {
  const router = useRouter();

  const [courses, setCourses] = useState([{ courseName: "" }]);
  const [savedCourses, setSavedCourses] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [classNames, setClassNames] = useState<string[]>([]);
  const [courseSearch, setCourseSearch] = useState<string[]>([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState<boolean[]>([false]);
  const [isSelectingCourse, setIsSelectingCourse] = useState<boolean[]>([false]);

  // Fetch class names from ClassTime_Data table
  useEffect(() => {
    const fetchClassNames = async () => {
      try {
        console.log("Fetching unique courseName from ClassTime_Data...");
        
        // Fetch all data with pagination to get everything
        let allCourses: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while(hasMore) {
          const { data, error } = await supabase
            .from("ClassTime_Data")
            .select("courseName")
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if(error) {
            console.error("Error fetching classes:", error);
            hasMore = false;
            break;
          }

          if(!data || data.length === 0) {
            hasMore = false;
          } else {
            allCourses = [...allCourses, ...data];
            page++;
            if(data.length < pageSize) hasMore = false;
          }
        }

        console.log("Raw data from database:", allCourses);
        console.log(`Total records fetched: ${allCourses.length}`);

        // Extract unique course names using Set and sort alphabetically
        const uniqueCoursesSet = new Set<string>();
        allCourses.forEach((item: any) => {
          if(item.courseName && item.courseName.trim()) {
            uniqueCoursesSet.add(item.courseName.trim());
          }
        });
        
        const uniqueClasses = Array.from(uniqueCoursesSet).sort();
        console.log("Unique classes:", uniqueClasses);
        console.log("Total unique courses:", uniqueClasses.length);
        
        setClassNames(uniqueClasses);
      } catch (err) {
        console.error("Unexpected error fetching classes:", err);
      }
    };

    fetchClassNames();
  }, []);

  // Load saved courses from localStorage on component mount
  useEffect(() => {
    try {
      const savedCourses = localStorage.getItem("userCourses");
      if(savedCourses) {
        const parsedCourses = JSON.parse(savedCourses);
        if(Array.isArray(parsedCourses) && parsedCourses.length > 0) {
          // Store the saved courses separately
          setSavedCourses(parsedCourses);
          
          // Set initial edit form with saved courses + one empty field
          const courseObjects = parsedCourses.map((courseName: string) => ({ courseName }));
          courseObjects.push({ courseName: "" });
          setCourses(courseObjects);
          
          // Set search values to match
          setCourseSearch([...parsedCourses, ""]);
          
          console.log("Loaded courses from localStorage:", parsedCourses);
        }
      }
    } catch (err) {
      console.error("Error loading courses from localStorage:", err);
    }
  }, []);

  const addCourse = () => {
    setCourses((prev) => [...prev, { courseName: "" }]);
    setCourseSearch((prev) => [...prev, ""]);
    setShowCourseDropdown((prev) => [...prev, false]);
    setIsSelectingCourse((prev) => [...prev, false]);
  };

  const removeCourse = (index: number) => {
    setCourses((prev) => prev.filter((_, i) => i !== index));
    setCourseSearch((prev) => prev.filter((_, i) => i !== index));
    setShowCourseDropdown((prev) => prev.filter((_, i) => i !== index));
    setIsSelectingCourse((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCourse = (index: number, value: string) => {
    setCourses((prev) => {
      const next = [...prev];
      next[index] = { courseName: value };
      return next;
    });
  };

  const handleCourseSelect = (index: number, courseName: string) => {
    setIsSelectingCourse((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    updateCourse(index, courseName);
    setCourseSearch((prev) => {
      const next = [...prev];
      next[index] = courseName;
      return next;
    });
    setShowCourseDropdown((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  const handleCourseFocus = (index: number) => {
    // Store the previous value before clearing
    const previousValue = courseSearch[index];
    
    // Clear the input for a clean slate
    setCourseSearch((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
    
    // Store previous value in a way we can access it on blur
    if(!window.previousCourseValues) {
      window.previousCourseValues = {};
    }
    window.previousCourseValues[index] = previousValue;
    
    setShowCourseDropdown((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setIsSelectingCourse((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  const handleCourseBlur = (index: number) => {
    setTimeout(() => {
      const search = courseSearch[index];
      
      // If search is empty, revert to previous value
      if(!search || search.trim() === "") {
        const previousValue = window.previousCourseValues?.[index] || "";
        setCourseSearch((prev) => {
          const next = [...prev];
          next[index] = previousValue;
          return next;
        });
        updateCourse(index, previousValue);
        setShowCourseDropdown((prev) => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
        return;
      }

      // If there's text, get filtered list and auto-select first match
      const filtered = classNames.filter((c) =>
        c.toLowerCase().includes(search.toLowerCase())
      );
      
      if(filtered.length > 0 && search !== courses[index].courseName) {
        handleCourseSelect(index, filtered[0]);
      }
      
      setShowCourseDropdown((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
      setIsSelectingCourse((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }, 150);
  };

  const handleSave = async () => {
    setError("");

    // Filter out empty courses
    const nonEmptyCourses = courses.filter((c) => c.courseName.trim() !== "");
    
    // If user has entered courses, check for duplicates
    if(nonEmptyCourses.length > 0) {
      const courseNames = nonEmptyCourses.map((c) => c.courseName.trim());
      const duplicates = courseNames.filter((name, index) => courseNames.indexOf(name) !== index);
      
      if(duplicates.length > 0) {
        setError(`Duplicate courses found: ${duplicates.join(", ")}. Each course must be unique.`);
        return;
      }

      setIsSaving(true);

      try {
        // Save only non-empty courses to local storage as JSON
        localStorage.setItem("userCourses", JSON.stringify(courseNames));
        // Update savedCourses state to display
        setSavedCourses(courseNames);
        console.log("Courses saved to local storage:", courseNames);

        await new Promise((res) => setTimeout(res, 400));
        router.push("/signup");
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An error occurred while saving courses.");
        setIsSaving(false);
      }
    } else {
      // User chose not to add any courses - save empty array
      setIsSaving(true);

      try {
        localStorage.setItem("userCourses", JSON.stringify([]));
        setSavedCourses([]);
        console.log("No courses saved - user chose to skip");

        await new Promise((res) => setTimeout(res, 400));
        router.push("/signup");
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An error occurred while saving.");
        setIsSaving(false);
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-center bg-gray-900 min-h-screen">
      <div className="w-screen min-h-screen flex items-center justify-center py-20 px-6 bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)]">
        <div className="relative z-10 w-full max-w-2xl mx-auto p-[1px] rounded-3xl bg-gradient-to-br from-red-600/30 via-gray-700/20 to-red-900/30">
          <div className="relative bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 rounded-3xl p-10 backdrop-blur-sm shadow-[0_0_100px_rgba(15,23,42,0.8)]">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white">Add your courses</h1>
              <p className="text-gray-400 text-sm mt-2">
                Add the classes you&apos;re taking this term so we can tailor your space.
              </p>
            </div>

            {/* Saved Courses Display */}
            {savedCourses.length > 0 && (
              <div className="mb-6 p-4 bg-gray-900/40 border border-gray-700/40 rounded-xl">
                <h3 className="text-red-400 text-xs font-semibold mb-3">CURRENTLY SAVED</h3>
                <div className="flex flex-wrap gap-2">
                  {savedCourses.map((course, idx) => (
                    <span key={`saved-${idx}`} className="px-3 py-1 bg-red-600/20 border border-red-600/50 text-red-300 text-sm rounded-full">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Course list */}
            <div className="flex flex-col gap-4 mb-6">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4 flex flex-col gap-3"
                >
                <div className="relative course-dropdown-container">
                    <label className="block text-red-400 text-xs font-semibold mb-1">
                      Class name
                    </label>
                    <Input
                      placeholder="Search your class"
                      value={courseSearch[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCourseSearch((prev) => {
                          const next = [...prev];
                          next[index] = value;
                          return next;
                        });
                      }}
                      onFocus={() => handleCourseFocus(index)}
                      onBlur={() => handleCourseBlur(index)}
                      onKeyDown={(e) => {
                        if(e.key === "Enter") {
                          e.preventDefault();
                          const search = courseSearch[index];
                          
                          if(!search || search.trim() === "") {
                            setCourseSearch((prev) => {
                              const next = [...prev];
                              next[index] = "";
                              return next;
                            });
                            updateCourse(index, "");
                            return;
                          }

                          const filtered = classNames.filter((c) =>
                            c.toLowerCase().includes(search.toLowerCase())
                          );
                          
                          if(filtered.length > 0) {
                            handleCourseSelect(index, filtered[0]);
                          }
                        }
                      }}
                      className="text-white"
                    />

                    {/* Dropdown list */}
                    {showCourseDropdown[index] && classNames.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-gray-900/95 border border-red-600/30 rounded-lg shadow-[0_0_30px_rgba(220,20,60,0.2)] backdrop-blur-md">
                        {[...new Set(classNames.filter((c) =>
                          c.toLowerCase().includes((courseSearch[index] || "").toLowerCase())
                        ))].length > 0 ? (
                          [...new Set(classNames.filter((c) =>
                            c.toLowerCase().includes((courseSearch[index] || "").toLowerCase())
                          ))].map((cls, clsIndex) => {
                            // Check if this course is already selected in another field
                            const isAlreadySelected = courses.some((course, courseIndex) => 
                              courseIndex !== index && course.courseName === cls
                            );
                            
                            return (
                              <button
                                key={`${cls}-${clsIndex}`}
                                type="button"
                                disabled={isAlreadySelected}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  if(!isAlreadySelected) {
                                    handleCourseSelect(index, cls);
                                  }
                                }}
                                className={`w-full px-4 py-3 text-left border-b border-gray-800/50 last:border-b-0 transition-colors ${
                                  isAlreadySelected
                                    ? 'text-gray-500 bg-gray-900/50 cursor-not-allowed'
                                    : 'text-white hover:bg-red-600/20 cursor-pointer'
                                }`}
                              >
                                {cls}
                                {isAlreadySelected && <span className="text-xs text-gray-600 ml-2">(already selected)</span>}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-4 py-3 text-gray-400 text-sm">
                            No classes found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {courses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCourse(index)}
                      className="text-xs text-red-300 hover:text-red-200 self-end"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add more */}
            <button
              type="button"
              onClick={addCourse}
              className="text-sm text-red-300 hover:text-red-100 mb-6"
            >
              + Add another course
            </button>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full transition-all disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save courses"}
            </button>

            {/* Link to home */}
            <div className="mt-4 text-center">
              <Link href="/signup" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                ← Back to Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
