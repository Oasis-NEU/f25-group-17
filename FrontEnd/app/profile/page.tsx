"use client";

import React from "react";
import '../globals.css'
import StaggeredMenu from '../../components/StaggeredMenu';
import PageTransition from '../../components/PageTransition';
import { Avatar, Box, Heading, Text, Stack, CardRoot, CardBody, Input, Button, SimpleGrid } from '@chakra-ui/react';
import { supabase } from "../../../supabase/lib/supabase";
import { useRouter } from "next/navigation";
import json from "../../../Data/combineMajor.json";
import SideBar from "@/components/SideBar";

export default function Profile() {
  const router = useRouter();

  const FullMajorOption = json

  const [isEditing, setIsEditing] = React.useState(false);
  const [fullName, setFullName] = React.useState("John Doe");
  const [major, setMajor] = React.useState("Computer Science");
  const [majorSearch, setMajorSearch] = React.useState("");
  const [showMajorDropdown, setShowMajorDropdown] = React.useState(false);
  const [email, setEmail] = React.useState("john.doe@northeastern.edu");
  const [year, setYear] = React.useState("Junior");
  const [yearSearch, setYearSearch] = React.useState("");
  const [showYearDropdown, setShowYearDropdown] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [courses, setCourses] = React.useState<any[]>([]);

  // Year options
  const YearOptions = ["Freshmen", "Sophmore", "Junior", "Senior", "Fifth Year", "Graduate Student"];

  // Store original values for cancel functionality
  const [originalFullName, setOriginalFullName] = React.useState("John Doe");
  const [originalMajor, setOriginalMajor] = React.useState("Computer Science");
  const [originalEmail, setOriginalEmail] = React.useState("john.doe@northeastern.edu");
  const [originalYear, setOriginalYear] = React.useState("Junior");

  React.useEffect(() => {
  (async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if(authError || !user) {
        router.push("/profile");
        return;
      }

    const { data: userData, error: userError } = await (supabase as any)
      .from("UserData")
      .select("*")
      .eq("user_id", user.id)
      .single();

      if(userError || !userData) return;

      const fullName = `${(userData as any).firstName || ""} ${(userData as any).lastName || ""}`.trim();
      setFullName(fullName);
      setEmail((userData as any).email || "");
      setMajor((userData as any).major || "");
      setYear((userData as any).year || "");
      setOriginalFullName(fullName);
      setOriginalEmail((userData as any).email || "");
      setOriginalMajor((userData as any).major || "");
      setOriginalYear((userData as any).year || "");

      let allClasses: any[] = [];
      for(let page = 0, pageSize = 1000, more = true; more; page++) {
        const { data } = await supabase
          .from("ClassTime_Data")
          .select("courseName, building, beginTime, endTime")
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .neq("courseName", null);
        if(!data?.length) more = false;
        else allClasses.push(...data);
      }

      const courses = Array.isArray((userData as any).courses)
        ? allClasses.filter(c => (userData as any).courses.includes(c.courseName))
        : [];

      const uniqueCourses = Array.from(
        new Map(courses.map(c => [c.courseName, c])).values()
      );

      setCourses(
        uniqueCourses.length
          ? uniqueCourses
          : (userData as any).courses?.map((n: string) => ({ courseName: n })) || []
      );
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  })();
}, [router]);

  // Save editing state and form data to localStorage
  React.useEffect(() => {
    const editingStateData = {
      isEditing,
      fullName,
      email,
      major,
      majorSearch,
      year,
      yearSearch,
      showMajorDropdown,
      showYearDropdown
    };
    localStorage.setItem("profileEditingState", JSON.stringify(editingStateData));
  }, [isEditing, fullName, email, major, majorSearch, year, yearSearch, showMajorDropdown, showYearDropdown]);

  // Restore editing state from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("profileEditingState");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.isEditing) {
          setIsEditing(true);
          setFullName(data.fullName);
          setMajor(data.major);
          setMajorSearch(data.majorSearch);
          setYear(data.year);
          setYearSearch(data.yearSearch);
          setShowMajorDropdown(data.showMajorDropdown);
          setShowYearDropdown(data.showYearDropdown);
        }
      }
    } catch (err) {
      console.error("Error restoring editing state:", err);
    }
  }, []);

  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
    { label: 'Study', ariaLabel: 'View our services', link: '/study' },
    { label: 'Profile', ariaLabel: 'View your profile', link: '/profile' }
  ];

  // Filter majors based on search
  const filteredMajors = FullMajorOption.filter((m) =>
    m.toLowerCase().includes(majorSearch.toLowerCase())
  );

  const handleMajorSelect = (selectedMajor: string) => {
    setMajor(selectedMajor);
    setMajorSearch(selectedMajor);
    setShowMajorDropdown(false);
  };

  const handleMajorFocus = () => {
    setMajorSearch("");
    setShowMajorDropdown(true);
  };

  const handleMajorBlur = () => {
    setTimeout(() => {
      const search = majorSearch;
      
      // If search is empty, revert to previous value
      if(!search || search.trim() === "") {
        setMajorSearch(major);
        setShowMajorDropdown(false);
        return;
      }

      // If there's text, get filtered list and auto-select first match
      const filtered = filteredMajors;
      
      if(filtered.length > 0 && search !== major) {
        handleMajorSelect(filtered[0]);
      }
      
      setShowMajorDropdown(false);
    }, 150);
  };

  // Filter years based on search
  const filteredYears = YearOptions.filter((y) =>
    y.toLowerCase().includes(yearSearch.toLowerCase())
  );

  const handleYearSelect = (selectedYear: string) => {
    setYear(selectedYear);
    setYearSearch(selectedYear);
    setShowYearDropdown(false);
  };

  const handleYearFocus = () => {
    setYearSearch("");
    setShowYearDropdown(true);
  };

  const handleYearBlur = () => {
    setTimeout(() => {
      const search = yearSearch;
      
      // If search is empty, revert to previous value
      if(!search || search.trim() === "") {
        setYearSearch(year);
        setShowYearDropdown(false);
        return;
      }

      // If there's text, get filtered list and auto-select first match
      const filtered = filteredYears;
      
      if(filtered.length > 0 && search !== year) {
        handleYearSelect(filtered[0]);
      }
      
      setShowYearDropdown(false);
    }, 150);
  };

  // Check if required fields are filled
  const canSave = fullName.trim() !== "" && fullName.trim().split(' ').length >= 2 && major.trim() !== "";

  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    if(!canSave) return;

    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if(authError || !user) {
        console.error('Auth error:', authError);
        return;
      }

      // Parse full name into first and last name
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Reconstruct full name with proper spacing
      const fullNameFormatted = lastName ? `${firstName} ${lastName}` : firstName;

      // Update user data in UserData table
      const updates: Record<string, string> = {
        firstName,
        lastName,
        email,
        major,
        year
      };

      const { error: updateError } = await supabase
        .from('UserData')
        // @ts-ignore - Supabase type inference issue
        .update(updates)
        .eq('user_id', user.id);

      if(updateError) {
        console.error('Error updating user data:', updateError);
        return;
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    setFullName(originalFullName);
    setMajor(originalMajor);
    setMajorSearch(originalMajor); // Keep the search in sync
    setShowMajorDropdown(false);
    setEmail(originalEmail);
    setYear(originalYear);
    setYearSearch(originalYear); // Keep the search in sync
    setShowYearDropdown(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if(error) {
        console.error('Error signing out:', error);
        return;
      }

      // Clear any stored courses on sign out
      localStorage.removeItem('userCourses');
      
      // Redirect to home
      router.push('/profile');
    } catch (err) {
      console.error('Unexpected error signing out:', err);
    }
  };

  return (
    <PageTransition>
      <main className="relative flex flex-col min-h-screen bg-gray-900 text-white overflow-auto">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)] z-0" />

        <SideBar/>

        {/* Page content - Dashboard Layout */}
        <div className="relative z-10 w-full pt-24 px-8 pb-20">
          {/* Header */}
          <Box maxW="7xl" mx="auto" mb={8}>
            <Stack direction="row" justify="space-between" align="center" mb={2}>
              <Box>
                <Heading as="h1" size="2xl" color="white" mb={2}>
                  Dashboard
                </Heading>
                <Text color="gray.400" fontSize="lg">Welcome back, {fullName}</Text>
              </Box>
              <Stack direction="row" gap={3}>
                {!isEditing && (
                  <Button
                    bg="red.600"
                    color="white"
                    _hover={{ bg: "red.700" }}
                    size="lg"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
                <Button
                  bg="gray.700"
                  color="white"
                  _hover={{ bg: "gray.600" }}
                  size="lg"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Dashboard Grid */}
          <Box maxW="7xl" mx="auto">
            <SimpleGrid columns={[1, 1, 2]} gap={6} alignItems="start">
              {/* Profile Info Card Container */}
              <Box minH={isEditing && showYearDropdown ? "675px" : "auto"}>
              {/* Profile Info Card */}
              <CardRoot
                bg="rgba(17, 24, 39, 0.9)"
                backdropFilter="blur(20px)"
                shadow="lg"
                rounded="xl"
                border="1px solid rgba(255,255,255,0.2)"
                color="white"
                minH={isEditing && showYearDropdown ? "675px" : "auto"}
              >
                <CardBody p={6} overflow="visible">
                  <Stack direction="row" justify="space-between" align="center" mb={6}>
                    <Heading size="lg" color="white">Profile Information</Heading>
                    {isEditing && (
                      <Text fontSize="sm" color="red.400">● Editing</Text>
                    )}
                  </Stack>

                  {/* Avatar Section */}
                  <Stack direction="row" gap={4} mb={6} align="center" pb={6} borderBottom="1px solid rgba(255,255,255,0.1)">
                    <Avatar.Root
                      size="xl"
                      bg="red.600"
                      color="white"
                      title="User Avatar"
                    >
                      <Avatar.Fallback>{getInitials(fullName)}</Avatar.Fallback>
                    </Avatar.Root>
                    <Box>
                      <Heading size="md" mb={1} color="white">{fullName}</Heading>
                      <Text fontSize="sm" color="red.400" mt={1}>Major: {major}</Text>
                    </Box>
                  </Stack>

                  {/* Editable Fields */}
                  <Stack gap={4}>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                        FULL NAME <Text as="span" color="red.400">*</Text>
                      </Text>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        variant="outline"
                        bg="rgba(0,0,0,0.3)"
                        color="white"
                        border="1px solid rgba(255,255,255,0.1)"
                        _hover={{ borderColor: isEditing ? "red.500" : "rgba(255,255,255,0.1)" }}
                        _focus={{ borderColor: "red.600", boxShadow: "0 0 0 1px rgba(220,20,60,0.5)" }}
                        size="md"
                        readOnly={!isEditing}
                        cursor={!isEditing ? "default" : "text"}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                        EMAIL
                      </Text>
                      <Input
                        value={email}
                        type="email"
                        variant="outline"
                        bg="rgba(0,0,0,0.3)"
                        color="white"
                        border="1px solid rgba(255,255,255,0.1)"
                        _hover={{ borderColor: "rgba(255,255,255,0.1)" }}
                        _focus={{ borderColor: "rgba(255,255,255,0.1)" }}
                        size="md"
                        readOnly={true}
                        cursor="default"
                      />
                    </Box>
                    
                    {/* The display of the year */}
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                        YEAR
                      </Text>
                      <Box position="relative">
                        <Input
                          value={isEditing ? yearSearch : year}
                          onChange={(e) => {
                            if(isEditing) {
                              setYearSearch(e.target.value);
                            }
                          }}
                          onFocus={() => isEditing && handleYearFocus()}
                          onBlur={() => isEditing && handleYearBlur()}
                          onKeyDown={(e) => {
                            if(isEditing && e.key === "Enter") {
                              e.preventDefault();
                              const search = yearSearch;
                              
                              if(!search || search.trim() === "") {
                                setYearSearch(year);
                                setShowYearDropdown(false);
                                return;
                              }

                              const filtered = YearOptions.filter((y) =>
                                y.toLowerCase().includes(search.toLowerCase())
                              );
                              
                              if(filtered.length > 0) {
                                handleYearSelect(filtered[0]);
                              }
                              setShowYearDropdown(false);
                            }
                          }}
                          variant="outline"
                          bg="rgba(0,0,0,0.3)"
                          color="white"
                          border="1px solid rgba(255,255,255,0.1)"
                          _hover={{ borderColor: isEditing ? "red.500" : "rgba(255,255,255,0.1)" }}
                          _focus={{ borderColor: "red.600", boxShadow: "0 0 0 1px rgba(220,20,60,0.5)" }}
                          size="md"
                          readOnly={!isEditing}
                          cursor={!isEditing ? "default" : "text"}
                          placeholder={isEditing ? "Search your year" : ""}
                        />
                        
                        {/* Dropdown list */}
                        {isEditing && showYearDropdown && filteredYears.length > 0 && (
                          <Box
                            position="absolute"
                            top="100%"
                            left={0}
                            right={0}
                            mt={2}
                            maxH="60"
                            overflowY="auto"
                            bg="rgba(17, 24, 39, 0.95)"
                            border="1px solid rgba(220,20,60,0.3)"
                            borderRadius="lg"
                            boxShadow="0 0 30px rgba(220,20,60,0.2)"
                            backdropFilter="blur(12px)"
                            zIndex={50}
                          >
                            {filteredYears.map((yr, idx) => (
                              <Box
                                key={idx}
                                px={4}
                                py={3}
                                color="white"
                                borderBottom="1px solid rgba(255,255,255,0.1)"
                                _last={{ borderBottom: "none" }}
                                _hover={{ bg: "rgba(220,20,60,0.2)", cursor: "pointer" }}
                                transition="all 0.2s"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleYearSelect(yr);
                                }}
                              >
                                {yr}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Stack>
                </CardBody>
              </CardRoot>
              </Box>

              {/* Academic Info Card Container */}
              <Box minH={isEditing && showMajorDropdown ? "650px" : "auto"}>
              <CardRoot
                bg="rgba(17, 24, 39, 0.9)"
                backdropFilter="blur(20px)"
                shadow="lg"
                rounded="xl"
                border="1px solid rgba(255,255,255,0.2)"
                color="white"
              >
                <CardBody p={6} overflow="visible">
                  <Stack direction="row" justify="space-between" align="center" mb={6}>
                    <Heading size="lg" color="white">Academic Information</Heading>
                    {isEditing && (
                      <Text fontSize="sm" color="red.400">● Editing</Text>
                    )}
                  </Stack>

                  <Stack gap={4}>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                        MAJOR <Text as="span" color="red.400">*</Text>
                      </Text>
                      <Box position="relative">
                        <Input
                          value={isEditing ? majorSearch : major}
                          onChange={(e) => {
                            if(isEditing) {
                              setMajorSearch(e.target.value);
                            }
                          }}
                          onFocus={() => isEditing && handleMajorFocus()}
                          onBlur={() => isEditing && handleMajorBlur()}
                          onKeyDown={(e) => {
                            if(isEditing && e.key === "Enter") {
                              e.preventDefault();
                              const search = majorSearch;
                              
                              if(!search || search.trim() === "") {
                                setMajorSearch(major);
                                setShowMajorDropdown(false);
                                return;
                              }

                              const filtered = FullMajorOption.filter((m) =>
                                m.toLowerCase().includes(search.toLowerCase())
                              );
                              
                              if(filtered.length > 0) {
                                handleMajorSelect(filtered[0]);
                              }
                              setShowMajorDropdown(false);
                            }
                          }}
                          variant="outline"
                          bg="rgba(0,0,0,0.3)"
                          color="white"
                          border="1px solid rgba(255,255,255,0.1)"
                          _hover={{ borderColor: isEditing ? "red.500" : "rgba(255,255,255,0.1)" }}
                          _focus={{ borderColor: "red.600", boxShadow: "0 0 0 1px rgba(220,20,60,0.5)" }}
                          size="md"
                          readOnly={!isEditing}
                          cursor={!isEditing ? "default" : "text"}
                          placeholder={isEditing ? "Search your major" : ""}
                        />
                        
                        {/* Dropdown list */}
                        {isEditing && showMajorDropdown && filteredMajors.length > 0 && (
                          <Box
                            position="absolute"
                            top="100%"
                            left={0}
                            right={0}
                            mt={2}
                            maxH="60"
                            overflowY="auto"
                            bg="rgba(17, 24, 39, 0.95)"
                            border="1px solid rgba(220,20,60,0.3)"
                            borderRadius="lg"
                            boxShadow="0 0 30px rgba(220,20,60,0.2)"
                            backdropFilter="blur(12px)"
                            zIndex={50}
                          >
                            {filteredMajors.map((maj, idx) => (
                              <Box
                                key={idx}
                                px={4}
                                py={3}
                                color="white"
                                borderBottom="1px solid rgba(255,255,255,0.1)"
                                _last={{ borderBottom: "none" }}
                                _hover={{ bg: "rgba(220,20,60,0.2)", cursor: "pointer" }}
                                transition="all 0.2s"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleMajorSelect(maj);
                                }}
                              >
                                {maj}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Box mt={isEditing && showMajorDropdown ? "250px" : "0"}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={3}>
                        ENROLLED COURSES ({courses.length})
                      </Text>
                      {courses.length > 0 ? (
                        <Stack gap={2}>
                          {courses.map((course: any, idx: number) => (
                            <Box
                              key={idx}
                              p={2.5}
                              bg="rgba(0,0,0,0.3)"
                              rounded="lg"
                              border="1px solid rgba(255,255,255,0.1)"
                              _hover={{ borderColor: "red.500", bg: "rgba(0,0,0,0.4)" }}
                              transition="all 0.2s"
                            >
                              <Text fontSize="xs" fontWeight="600" color="white" mb={1}>
                                {course.courseName || 'Unknown Course'}
                              </Text>
                              {course.building && (
                                <Text fontSize="xs" color="gray.400">
                                  📍 {course.building}
                                </Text>
                              )}
                              {course.beginTime && course.endTime && (
                                <Text fontSize="xs" color="gray.400">
                                  🕐 {course.beginTime} - {course.endTime}
                                </Text>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Text fontSize="xs" color="gray.400">No courses enrolled yet</Text>
                      )}
                      {isEditing && (
                        <Button
                          size="sm"
                          bg="rgba(220,20,60,0.2)"
                          color="red.400"
                          border="1px solid rgba(220,20,60,0.5)"
                          _hover={{ bg: "rgba(220,20,60,0.3)" }}
                          mt={4}
                          onClick={() => router.push('/course')}
                        >
                          Edit Courses
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </CardBody>
              </CardRoot>
              </Box>
            </SimpleGrid>

            {/* Action Buttons - Single location for all edits */}
            {isEditing && (
              <Box mt={6} display="flex" justifyContent="flex-end" gap={4}>
                <Button
                  variant="outline"
                  colorScheme="red"
                  color="white"
                  borderColor="red.500"
                  _hover={{ bg: "rgba(220,20,60,0.2)" }}
                  size="lg"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  bg={canSave ? "red.600" : "gray.600"}
                  color="white"
                  _hover={canSave ? { bg: "red.700" } : { bg: "gray.600" }}
                  size="lg"
                  onClick={handleSave}
                  disabled={!canSave}
                  cursor={!canSave ? "not-allowed" : "pointer"}
                  opacity={!canSave ? 0.5 : 1}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Box>
        </div>
      </main>
    </PageTransition>
  );
}
