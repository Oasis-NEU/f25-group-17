"use client";

import React, { useState } from "react";
import { Input } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function OnboardingCourses() {
  const router = useRouter();

  const [courses, setCourses] = useState([{ courseCode: "" }]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const addCourse = () => {
    setCourses((prev) => [...prev, { courseCode: "" }]);
  };

  const removeCourse = (index: number) => {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCourse = (index: number, value: string) => {
    setCourses((prev) => {
      const next = [...prev];
      next[index] = { courseCode: value };
      return next;
    });
  };

  const handleSave = async () => {
    setError("");

    // Remove empty rows
    const cleaned = courses.filter((c) => c.courseCode.trim() !== "");

    console.log("Courses user entered:", cleaned);

    if (cleaned.length === 0) {
      setError("Please add at least one course, or skip.");
      return;
    }

    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 400));
    setIsSaving(false);

    router.push("/profile");
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

            {/* Course list */}
            <div className="flex flex-col gap-4 mb-6">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4 flex flex-col gap-3"
                >
                  <div>
                    <label className="block text-red-400 text-xs font-semibold mb-1">
                      Course code
                    </label>
                    <Input
                      placeholder="e.g. CS1800"
                      value={course.courseCode}
                      onChange={(e) => updateCourse(index, e.target.value)}
                      className="text-white"
                    />
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
          </div>
        </div>
      </div>
    </main>
  );
}
