"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../supabase/lib/supabase";
import Link from "next/link";
import { stringify } from "querystring";

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
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/signup");

  // Check if user is signed in and set redirect path
  useEffect(() => {
    async function checkAuth() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setIsSignedIn(true);
        setRedirectPath("/profile");
      } else {
        setIsSignedIn(false);
        setRedirectPath("/signup");
      }
    }
    checkAuth();
  }, []);

  // Fetch class names from ClassTime_Data table
  useEffect(() => {
    async function fetchClassNames(pageSize = 1000) {
      //Declare what a record would look like 
      type ClassTimeRow = {
        courseName: string | null;
      };

      let allCourses = [];
      let page = 0;
      let hasMore = true;

      //Calling supabase and extracting all the course name from the database 
      while (hasMore) {
        const { data, error } = await supabase
        .from("ClassTime_Data")
        .select("courseName")
        .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) throw new Error(error.message);
        if (!data?.length) break;

        const typedData = data as ClassTimeRow[];

        allCourses.push(
          ...typedData
            .map(d => d.courseName?.trim())
            .filter((name): name is string => Boolean(name))
        );

        hasMore = data.length === pageSize;
        page++;
      }

      const uniqueCourses = [...new Set(allCourses)].sort();
      setClassNames(uniqueCourses)
    }

    fetchClassNames().catch(err =>
    console.error("Error fetching class names:", err)
  );
  }, []);

  // Load saved courses from localStorage on component mount
  useEffect(() => {
    console.log("📂 Loading courses from localStorage...");
    
    try {
      const saved = localStorage.getItem("signupFormData");
      if(saved) {
        const parsed = JSON.parse(saved);
        const savedUserCourses = parsed.courses || [];
        
        console.log("✅ Loaded courses from signupFormData:", savedUserCourses);
        
        if(Array.isArray(savedUserCourses) && savedUserCourses.length > 0) {
          setSavedCourses(savedUserCourses);
          // Load courses with one empty field at the end
          setCourses([
            ...savedUserCourses.map((c: string) => ({ courseName: c })), 
            { courseName: "" }
          ]);
          setCourseSearch([...savedUserCourses, ""]);
          setShowCourseDropdown(Array(savedUserCourses.length + 1).fill(false));
          setIsSelectingCourse(Array(savedUserCourses.length + 1).fill(false));
          
          console.log("✅ Initialized form with", savedUserCourses.length, "courses");
        } else {
          console.log("⚠️ No courses found in signupFormData");
        }
      }
    } catch (err) {
      console.error("❌ Error loading courses:", err);
    }
  }, []);

  const addEmptyCourseInput = () => {
  setCourses(prev => [...prev, { 
    courseName: "", 
    searchValue: "", 
    showDropdown: false, 
    isSelecting: false 
    }]);
  };

  const removeCourseInput = (index: number) => {
    setCourses(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllCourses = () => {
    setCourses([{ courseName: "" }]);
    setCourseSearch([""]);
    setShowCourseDropdown([false]);
    setIsSelectingCourse([false]);
    setSavedCourses([]);
    console.log("🗑️ Removed all courses");
  };

  const handleCourseNameInputChange = (index: number, value: string) => {
    setCourses(prev => {
      const next = [...prev];
      next[index].courseName = value;
      return next;
    });
  };

  // Handles what happens when a user selects a course from the dropdown at a given index
  const handleCourseSelectionIndex = (index: number, courseName: string) => {
    // Marks the course at the given index as currently being selected by setting its flag to true.
    setIsSelectingCourse((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    // Updates the main course name data at the given index with the newly selected course.
    handleCourseNameInputChange(index, courseName);

    // Updates the search bar or input field text for this index to display the selected course name.
    setCourseSearch((prev) => {
      const next = [...prev];
      next[index] = courseName;
      return next;
    });
    
    // Closes the dropdown menu for the selected course by setting its visibility to false.
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
    if (!window.previousCourseValues) {
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
      if (!search || search.trim() === "") {
        const previousValue = window.previousCourseValues?.[index] || "";
        setCourseSearch((prev) => {
          const next = [...prev];
          next[index] = previousValue;
          return next;
        });
        handleCourseNameInputChange(index, previousValue);
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
      
      if (filtered.length > 0 && search !== courses[index].courseName) {
        handleCourseSelectionIndex(index, filtered[0]);
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
    const nonEmptyCourses = courses
      .map(c => c.courseName.trim())
      .filter(name => name !== "");

    const hasCourses = nonEmptyCourses.length > 0;

    // Check for duplicates if courses exist
    if (hasCourses) {
      const duplicates = nonEmptyCourses.filter(
        (name, index) => nonEmptyCourses.indexOf(name) !== index
      );
      if (duplicates.length > 0) {
        setError(`Duplicate courses found: ${duplicates.join(", ")}. Each course must be unique.`);
        return;
      }
    }

    setIsSaving(true);

    try {
      // Update both userCourses and signupFormData with courses
      localStorage.setItem("userCourses", JSON.stringify(hasCourses ? nonEmptyCourses : []));
      
      // Also update the courses in signupFormData
      const saved = localStorage.getItem("signupFormData");
      if(saved) {
        const parsed = JSON.parse(saved);
        parsed.courses = hasCourses ? nonEmptyCourses : [];
        localStorage.setItem("signupFormData", JSON.stringify(parsed));
        console.log("✅ Updated signupFormData with courses:", parsed.courses);
      }
      
      setSavedCourses(hasCourses ? nonEmptyCourses : []);
      console.log("💾 Saved courses:", hasCourses ? nonEmptyCourses : []);

      await new Promise(res => setTimeout(res, 400));
      router.push(redirectPath);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An error occurred while saving courses.");
      } finally {
        setIsSaving(false);
      }
  };

  return (
    <main className="flex flex-col items-center justify-center bg-gray-900 min-h-screen">
      <div className="w-screen min-h-screen flex items-center justify-center py-20 px-6 bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)]">
        <div className="relative z-10 w-full max-w-2xl mx-auto p-[1px] rounded-3xl bg-gradient-to-br from-red-600/30 via-gray-700/20 to-red-900/30">
          <div className="relative bg-gradient-to-br from-black-900/90 via-gray-800/90 to-black-700/90 rounded-3xl p-10 backdrop-blur-sm shadow-[0_0_100px_rgba(15,23,42,0.8)]">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white">Add your courses</h1>
              <p className="text-gray-300 text-sm mt-2">
              <p className="text-gray-300 text-sm mt-2">
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
                      Course {index + 1} {index < savedCourses.length && <span className="text-gray-400">(Saved)</span>}
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
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const search = courseSearch[index];
                          
                          if (!search || search.trim() === "") {
                            setCourseSearch((prev) => {
                              const next = [...prev];
                              next[index] = "";
                              return next;
                            });
                            handleCourseNameInputChange(index, "");
                            return;
                          }

                          const filtered = classNames.filter((c) =>
                            c.toLowerCase().includes(search.toLowerCase())
                          );
                          
                          if (filtered.length > 0) {
                            handleCourseSelectionIndex(index, filtered[0]);
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
                                  if (!isAlreadySelected) {
                                    handleCourseSelectionIndex(index, cls);
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
                      onClick={() => removeCourseInput(index)}
                      className="text-xs text-red-300 hover:text-red-200 self-end"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add more */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={addEmptyCourseInput}
                className="text-sm text-red-300 hover:text-red-100"
              >
                + Add another course
              </button>
              {courses.length > 1 && (
                <button
                  type="button"
                  onClick={removeAllCourses}
                  className="text-sm text-red-300 hover:text-red-100 ml-auto"
                >
                  Remove all courses
                </button>
              )}
            </div>

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
              <Link href={redirectPath} className="text-gray-200 hover:text-gray-300 text-sm transition-colors">
                ← {isSignedIn ? "Back to Profile" : "Back to Sign Up"}
              <Link href="/signup" className="text-gray-200 hover:text-gray-300 text-sm transition-colors">
                ← Back to Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
