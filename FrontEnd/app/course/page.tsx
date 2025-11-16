"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MoveTo from "@/hooks/useRedirect";
import { useSearchableList } from "@/hooks/useSearchableList";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useFetchData } from "@/hooks/useFetchData";
import { SearchableInput } from "@/components/SearchableInput";
import { SavedCoursesBanner } from "@/components/SavedCoursesBanner";
import { ItemActions } from "@/components/ItemActions";
import { CoursesHeader } from "@/components/CoursesHeader";

interface ClassTimeData {
  courseName: string;
}

export default function OnboardingCourses() {
  const router = useRouter();
  const { handleRedirect } = MoveTo({ LoginPush: "/about" });

  const { items, searchValues, showDropdowns, addEmptyItem, removeItem, removeAllItems, handleItemValueChange, handleItemSelection, handleItemFocus, handleItemBlur, closeDropdown } = useSearchableList();
  const { redirectPath } = useAuth("/signup");
  const { data: classNamesData, fetchData: fetchClassNames } = useFetchData<ClassTimeData>();
  const { data: savedCourses, setData: setSavedCourses, loadData: loadCourses, saveData: saveCourses } = useLocalStorage<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [coursesToLoad, setCoursesToLoad] = useState<string[]>([]);
  const hasInitialized = useRef(false);

  // Fetch class names
  useEffect(() => {
    fetchClassNames("ClassTime_Data", "courseName").catch(err =>
      console.error("Error fetching class names:", err)
    );
  }, [fetchClassNames]);

  // Load saved courses from localStorage on mount
  useEffect(() => {
    const userCourses = localStorage.getItem("userCourses");
    if (userCourses) {
      try {
        const courses = JSON.parse(userCourses);
        if (Array.isArray(courses) && courses.length > 0) {
          console.log("Loading courses from localStorage:", courses);
          setCoursesToLoad(courses);
          return;
        }
      } catch (err) {
        console.error("Error parsing userCourses:", err);
      }
    }
  }, []);

  // Initialize items when courses are loaded
  useEffect(() => {
    if (coursesToLoad.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      console.log("Creating items for courses:", coursesToLoad);
      
      // Add items to match course count
      for (let i = 0; i < coursesToLoad.length; i++) {
        if (items.length <= i) {
          addEmptyItem();
        }
      }
      
      // Now populate them
      setTimeout(() => {
        coursesToLoad.forEach((course, index) => {
          handleItemSelection(index, course);
        });
      }, 100);
    }
  }, [coursesToLoad, items.length, addEmptyItem, handleItemSelection]);

  // Update saved courses display whenever items change (but not during initialization)
  useEffect(() => {
    if (hasInitialized.current) {
      const nonEmptyCourses = items
        .map(c => c.value.trim())
        .filter(name => name !== "");
      setSavedCourses(nonEmptyCourses);
    } else if (coursesToLoad.length > 0) {
      // During initialization, use loaded courses
      setSavedCourses(coursesToLoad);
    }
  }, [items, coursesToLoad, setSavedCourses]);

  // Extract course names as strings
  const classNames = classNamesData.map(item => 
    typeof item === 'string' ? item : item.courseName
  ).filter(Boolean) as string[];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const search = searchValues[index];
      
      if (!search || search.trim() === "") {
        handleItemValueChange(index, "");
        closeDropdown(index);
        return;
      }

      const filtered = classNames
        .filter(c =>
          c.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => a.localeCompare(b));
      
      if (filtered.length > 0) {
        handleItemSelection(index, filtered[0]);
      }
      
      closeDropdown(index);
    }
  };

  const isAlreadySelected = (courseName: string, currentIndex: number): boolean => {
    return items.some((item, idx) => idx !== currentIndex && item.value === courseName);
  };

  const handleSave = async () => {
    setError("");
    const nonEmptyCourses = items
      .map(c => c.value.trim())
      .filter(name => name !== "");

    const hasCourses = nonEmptyCourses.length > 0;

    // Check for duplicates
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
      // Update saved courses immediately for display
      setSavedCourses(hasCourses ? nonEmptyCourses : []);
      
      // Save courses to userCourses localStorage
      localStorage.setItem("userCourses", JSON.stringify(hasCourses ? nonEmptyCourses : []));
      
      // Update signupFormData
      const saved = localStorage.getItem("signupFormData");
      if(saved) {
        const parsed = JSON.parse(saved);
        parsed.courses = hasCourses ? nonEmptyCourses : [];
        localStorage.setItem("signupFormData", JSON.stringify(parsed));
        console.log("Updated signupFormData with courses:", parsed.courses);
      }
      
      setSavedCourses(hasCourses ? nonEmptyCourses : []);
      console.log("Saved courses:", hasCourses ? nonEmptyCourses : []);

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
      <div className="w-screen min-h-screen flex items-center justify-center py-20 px-6 bg-linear-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)]">
        <div className="relative z-10 w-full max-w-2xl mx-auto p-px rounded-3xl bg-linear-to-br from-red-600/30 via-gray-700/20 to-red-900/30">
          <div className="relative bg-linear-to-br from-black-900/90 via-gray-800/90 to-black-700/90 rounded-3xl p-10 backdrop-blur-sm shadow-[0_0_100px_rgba(15,23,42,0.8)]">
            
            <CoursesHeader />

            <SavedCoursesBanner savedCourses={savedCourses} />

            <div className="flex flex-col gap-4 mb-6">
              {items.map((item, index) => (
                <SearchableInput
                  key={index}
                  index={index}
                  searchValue={searchValues[index] || ""}
                  showDropdown={showDropdowns[index] || false}
                  dataList={classNames}
                  itemCount={items.length}
                  label={`Course ${index + 1}`}
                  placeholder="Search your class"
                  isItemSelected={(courseName: string) => isAlreadySelected(courseName, index)}
                  onValueChange={handleItemValueChange}
                  onFocus={handleItemFocus}
                  onBlur={() => handleItemBlur(index, classNames)}
                  onKeyDown={handleKeyDown}
                  onItemSelect={handleItemSelection}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <ItemActions
              itemCount={items.length}
              onAddItem={addEmptyItem}
              onRemoveAllItems={removeAllItems}
              addButtonLabel="+ Add another course"
              removeAllButtonLabel="Remove all courses"
            />

            {error && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full transition-all disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save courses"}
            </button>

            <div className="mt-4 text-center">
              <Link href={redirectPath} className="text-gray-200 hover:text-gray-300 text-sm transition-colors">
                ← Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
