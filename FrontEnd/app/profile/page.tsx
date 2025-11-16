"use client";

import React, { useState, useEffect } from "react";
import '../globals.css'
import PageTransition from '../../components/PageTransition';
import { Avatar, Box, Heading, Text, Stack, CardRoot, CardBody, Input, Button, SimpleGrid } from '@chakra-ui/react';
import { supabase } from "../../../supabase/lib/supabase";
import { useRouter } from "next/navigation";
import json from "../../../Data/combineMajor.json";
import SideBar from "@/components/SideBar";
import { SearchableDropdown } from "@/components/SearchableDropdown";
import { useSearchableList } from "@/hooks/useSearchableList";
import { useFetchData } from "@/hooks/useFetchData";

interface ClassTimeData {
  courseName: string;
  building?: string;
  beginTime?: string;
  endTime?: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  major: string;
  year: string;
  courses?: string[];
}

export default function Profile() {
  const router = useRouter();
  const FullMajorOption = json;
  const YearOptions = ["Freshmen", "Sophmore", "Junior", "Senior", "Fifth Year", "Graduate Student"];

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@northeastern.edu");
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<ClassTimeData[]>([]);
  const [originalData, setOriginalData] = useState<UserData | null>(null);

  // Dropdowns
  const { items: majorItems, searchValues: majorSearchValues, showDropdowns: majorShowDropdowns, handleItemValueChange: handleMajorValueChange, handleItemSelection: handleMajorSelection, handleItemFocus: handleMajorFocus, handleItemBlur: handleMajorBlur, closeDropdown: closeMajorDropdown } = useSearchableList();
  const { items: yearItems, searchValues: yearSearchValues, showDropdowns: yearShowDropdowns, handleItemValueChange: handleYearValueChange, handleItemSelection: handleYearSelection, handleItemFocus: handleYearFocus, handleItemBlur: handleYearBlur, closeDropdown: closeYearDropdown } = useSearchableList();

  // Data fetching
  const { data: classNamesData } = useFetchData<ClassTimeData>();

  // Derived values
  const major = majorItems[0]?.value || originalData?.major || "";
  const year = yearItems[0]?.value || originalData?.year || "";
  const majorSearch = majorSearchValues[0];
  const yearSearch = yearSearchValues[0];
  const showMajorDropdown = majorShowDropdowns[0] || false;
  const showYearDropdown = yearShowDropdowns[0] || false;

  // Helper functions
  const getInitials = (name: string) => name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const loadUserData = async (userId: string) => {
    try {
      const { data: userData, error } = await (supabase as any).from("UserData").select("*").eq("user_id", userId).single();
      if (error || !userData) return;

      const fullNameValue = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
      const userDataObj: UserData = { firstName: userData.firstName, lastName: userData.lastName, email: userData.email, major: userData.major, year: userData.year, courses: userData.courses };

      setFullName(fullNameValue);
      setEmail(userData.email);
      setOriginalData(userDataObj);
      handleMajorSelection(0, userData.major);
      handleYearSelection(0, userData.year);

      await loadCourses(userData.courses);
      console.log(userData.courses)
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  };

  const loadCourses = async (courseNames: string[] | undefined) => {
    if (!courseNames || courseNames.length === 0) {
      setCourses([]);
      return;
    }

    try {
      let allClasses: ClassTimeData[] = [];
      for (let page = 0, pageSize = 1000, more = true; more; page++) {
        const { data } = await supabase.from("ClassTime_Data").select("courseName, building, beginTime, endTime").range(page * pageSize, (page + 1) * pageSize - 1).neq("courseName", null);
        if (!data?.length) more = false;
        else allClasses.push(...data);
      }

      const userCourses = allClasses.filter(c => courseNames.includes(c.courseName));
      const uniqueCourses = Array.from(new Map(userCourses.map(c => [c.courseName, c])).values());
      setCourses(uniqueCourses.length ? uniqueCourses : courseNames.map((n: string) => ({ courseName: n })));
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  };

  // Fetch user data on mount
  useEffect(() => {
    (async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/login");
          return;
        }
        await loadUserData(user.id);
      } catch (err) {
        console.error("Error fetching user data:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Validation
  const canSave = fullName.trim() !== "" && fullName.trim().split(' ').length >= 2 && major.trim() !== "";

  // Handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, options: string[], handleSelection: (idx: number, val: string) => void, closeDropdown: (idx: number) => void) => {
    if (isEditing && e.key === "Enter") {
      e.preventDefault();
      const search = e.currentTarget.value;
      if (!search || search.trim() === "") {
        closeDropdown(0);
        return;
      }
      const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
      if (filtered.length > 0) {
        handleSelection(0, filtered[0]);
      }
      closeDropdown(0);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return;
      }

      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Load current courses from localStorage
      const courseNames = courses.map(c => c.courseName);

      const updates = { firstName, lastName, email, major, year};

      const { error: updateError } = await (supabase as any).from('UserData').update(updates).eq('email', email);

      if (updateError) {
        console.error('Error updating user data:', updateError);
        return;
      }

      setOriginalData(updates);
      setIsEditing(false);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (originalData) {
      const fullNameValue = `${originalData.firstName} ${originalData.lastName}`;
      setFullName(fullNameValue);
      setEmail(originalData.email);
      handleMajorSelection(0, originalData.major);
      handleYearSelection(0, originalData.year);
      closeMajorDropdown(0);
      closeYearDropdown(0);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userCourses');
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <PageTransition>
      <main className="relative flex flex-col min-h-screen bg-gray-900 text-white overflow-auto">
        <div className="absolute inset-0 bg-linear-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)] z-0" />
        <SideBar />
        <div className="relative z-10 w-full pt-24 px-8 pb-20">
          <Box maxW="7xl" mx="auto" mb={8}>
            <Stack direction="row" justify="space-between" align="center" mb={2}>
              <Box>
                <Heading as="h1" size="2xl" color="white" mb={2}>Dashboard</Heading>
                <Text color="gray.400" fontSize="lg">Welcome back, {fullName}</Text>
              </Box>
              <Stack direction="row" gap={3}>
                {!isEditing && <Button bg="red.600" color="white" _hover={{ bg: "red.700" }} size="lg" onClick={() => setIsEditing(true)}>Edit Profile</Button>}
                <Button bg="gray.700" color="white" _hover={{ bg: "gray.600" }} size="lg" onClick={handleSignOut}>Sign Out</Button>
              </Stack>
            </Stack>
          </Box>

          <Box maxW="7xl" mx="auto">
            <SimpleGrid columns={[1, 1, 2]} gap={6} alignItems="start">
              {/* Profile Info Card */}
              <Box minH={isEditing && showYearDropdown ? "675px" : "auto"}>
                <CardRoot bg="rgba(17, 24, 39, 0.9)" backdropFilter="blur(20px)" shadow="lg" rounded="xl" border="1px solid rgba(255,255,255,0.2)" color="white">
                  <CardBody p={6} overflow="visible">
                    <Stack direction="row" justify="space-between" align="center" mb={6}>
                      <Heading size="lg" color="white">Profile Information</Heading>
                      {isEditing && <Text fontSize="sm" color="red.400">● Editing</Text>}
                    </Stack>
                    <Stack direction="row" gap={4} mb={6} align="center" pb={6} borderBottom="1px solid rgba(255,255,255,0.1)">
                      <Avatar.Root size="xl" bg="red.600" color="white">
                        <Avatar.Fallback>{getInitials(fullName)}</Avatar.Fallback>
                      </Avatar.Root>
                      <Box>
                        <Heading size="md" mb={1} color="white">{fullName}</Heading>
                        <Text fontSize="sm" color="red.400" mt={1}>Major: {major}</Text>
                      </Box>
                    </Stack>
                    <Stack gap={4}>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>FULL NAME <Text as="span" color="red.400">*</Text></Text>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} variant="outline" bg="rgba(0,0,0,0.3)" color="white" border="1px solid rgba(255,255,255,0.1)" _hover={{ borderColor: isEditing ? "red.500" : "rgba(255,255,255,0.1)" }} _focus={{ borderColor: "red.600", boxShadow: "0 0 0 1px rgba(220,20,60,0.5)" }} size="md" readOnly={!isEditing} cursor={!isEditing ? "default" : "text"} />
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>EMAIL</Text>
                        <Input value={email} type="email" variant="outline" bg="rgba(0,0,0,0.3)" color="white" border="1px solid rgba(255,255,255,0.1)" size="md" readOnly cursor="default" />
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>YEAR</Text>
                        <SearchableDropdown value={year} searchValue={yearSearch} options={YearOptions} placeholder="Search your year" isEditing={isEditing} showDropdown={showYearDropdown} onChange={(value) => handleYearValueChange(0, value)} onFocus={() => isEditing && handleYearFocus(0)} onBlur={() => isEditing && handleYearBlur(0, YearOptions)} onKeyDown={(e) => handleKeyDown(e, YearOptions, handleYearSelection, closeYearDropdown)} onSelect={(option) => handleYearSelection(0, option)} sortAlphabetically={false} />
                      </Box>
                    </Stack>
                  </CardBody>
                </CardRoot>
              </Box>

              {/* Academic Info Card */}
              <Box minH={isEditing && showMajorDropdown ? "650px" : "auto"}>
                <CardRoot bg="rgba(17, 24, 39, 0.9)" backdropFilter="blur(20px)" shadow="lg" rounded="xl" border="1px solid rgba(255,255,255,0.2)" color="white">
                  <CardBody p={6} overflow="visible">
                    <Stack direction="row" justify="space-between" align="center" mb={6}>
                      <Heading size="lg" color="white">Academic Information</Heading>
                      {isEditing && <Text fontSize="sm" color="red.400">● Editing</Text>}
                    </Stack>
                    <Stack gap={4}>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>MAJOR <Text as="span" color="red.400">*</Text></Text>
                        <SearchableDropdown value={major} searchValue={majorSearch} options={FullMajorOption} placeholder="Search your major" isEditing={isEditing} showDropdown={showMajorDropdown} onChange={(value) => handleMajorValueChange(0, value)} onFocus={() => isEditing && handleMajorFocus(0)} onBlur={() => isEditing && handleMajorBlur(0, FullMajorOption)} onKeyDown={(e) => handleKeyDown(e, FullMajorOption, handleMajorSelection, closeMajorDropdown)} onSelect={(option) => handleMajorSelection(0, option)} />
                      </Box>
                      <Box mt={isEditing && showMajorDropdown ? "250px" : "0"}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={3}>ENROLLED COURSES ({courses.length})</Text>
                        {courses.length > 0 ? (
                          <Stack gap={2}>
                            {courses.map((course: any, idx: number) => (
                              <Box key={idx} p={2.5} bg="rgba(0,0,0,0.3)" rounded="lg" border="1px solid rgba(255,255,255,0.1)" _hover={{ borderColor: "red.500", bg: "rgba(0,0,0,0.4)" }} transition="all 0.2s">
                                <Text fontSize="xs" fontWeight="600" color="white" mb={1}>{course.courseName || 'Unknown Course'}</Text>
                                {course.building && <Text fontSize="xs" color="gray.400">📍 {course.building}</Text>}
                                {course.beginTime && course.endTime && <Text fontSize="xs" color="gray.400">🕐 {course.beginTime} - {course.endTime}</Text>}
                              </Box>
                            ))}
                          </Stack>
                        ) : (
                          <Text fontSize="xs" color="gray.400">No courses enrolled yet</Text>
                        )}
                        {isEditing && <Button size="sm" bg="rgba(220,20,60,0.2)" color="red.400" border="1px solid rgba(220,20,60,0.5)" _hover={{ bg: "rgba(220,20,60,0.3)" }} mt={4} onClick={() => router.push('/course')}>Edit Courses</Button>}
                      </Box>
                    </Stack>
                  </CardBody>
                </CardRoot>
              </Box>
            </SimpleGrid>

            {isEditing && (
              <Box mt={6} display="flex" justifyContent="flex-end" gap={4}>
                <Button variant="outline" colorScheme="red" color="white" borderColor="red.500" _hover={{ bg: "rgba(220,20,60,0.2)" }} size="lg" onClick={handleCancel}>Cancel</Button>
                <Button bg={canSave ? "red.600" : "gray.600"} color="white" _hover={canSave ? { bg: "red.700" } : { bg: "gray.600" }} size="lg" onClick={handleSave} disabled={!canSave} cursor={!canSave ? "not-allowed" : "pointer"} opacity={!canSave ? 0.5 : 1}>Save Changes</Button>
              </Box>
            )}
          </Box>
        </div>
      </main>
    </PageTransition>
  );
}
