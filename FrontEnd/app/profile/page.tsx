"use client";

import React from "react";
import '../globals.css'
import StaggeredMenu from '../../components/StaggeredMenu';
import PageTransition from '../../components/PageTransition';
import { Avatar, Box, Heading, Text, Stack, CardRoot, CardBody, Input, Button, SimpleGrid } from '@chakra-ui/react';
import { supabase } from "../../../supabase/lib/supabase";
import { useRouter } from "next/navigation";


export default function Profile() {
  const router = useRouter();

  const [isEditing, setIsEditing] = React.useState(false);
  const [fullName, setFullName] = React.useState("John Doe");
  const [major, setMajor] = React.useState("Computer Science");
  const [email, setEmail] = React.useState("john.doe@northeastern.edu");
  const [year, setYear] = React.useState("Junior");
  const [loading, setLoading] = React.useState(true);

  // Store original values for cancel functionality
  const [originalFullName, setOriginalFullName] = React.useState("John Doe");
  const [originalMajor, setOriginalMajor] = React.useState("Computer Science");
  const [originalEmail, setOriginalEmail] = React.useState("john.doe@northeastern.edu");
  const [originalYear, setOriginalYear] = React.useState("Junior");

  // Fetch user profile data on component mount
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Auth error:', authError);
          setLoading(false);
          router.push("/login"); //preventing them from access this page if they arent the user and not logged in 
          return;
        }

        // Fetch user profile from UserData table
        const { data, error } = await supabase
          .from('UserData')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
          return;
        }

        if (data && typeof data === 'object') {
          const userData = data as any;
          const fullNameValue = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
          const emailValue = userData.email || '';
          const majorValue = userData.major || '';
          const yearValue = userData.year || '';

          // Set current values
          setFullName(fullNameValue);
          setEmail(emailValue);
          setMajor(majorValue);
          setYear(yearValue);

          // Store original values for cancel functionality
          setOriginalFullName(fullNameValue);
          setOriginalEmail(emailValue);
          setOriginalMajor(majorValue);
          setOriginalYear(yearValue);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
    { label: 'Study', ariaLabel: 'View our services', link: '/study' },
    { label: 'Profile', ariaLabel: 'View your profile', link: '/profile' }
  ];

  const socialItems = [
    { label: 'Twitter', link: 'https://twitter.com' },
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' }
  ];

  // Check if required fields are filled
  const canSave = fullName.trim() !== "" && major.trim() !== "";

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
    if (!canSave) return;

    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        return;
      }

      // Parse full name into first and last name
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

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

      if (updateError) {
        console.error('Error updating user data:', updateError);
        return;
      }

      setIsEditing(false);
      console.log('Profile updated successfully');
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    setFullName(originalFullName);
    setMajor(originalMajor);
    setEmail(originalEmail);
    setYear(originalYear);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        return;
      }

      // Clear any stored courses on sign out
      localStorage.removeItem('userCourses');
      
      // Redirect to home
      router.push('/login');
    } catch (err) {
      console.error('Unexpected error signing out:', err);
    }
  };

  return (
    <PageTransition>
      <main className="relative flex flex-col min-h-screen bg-gray-900 text-white overflow-auto">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)] z-0" />

        {/* Staggered Menu */}
        <div className="absolute top-0 left-0">
          <div style={{ height: '100vh', background: '#1a1a1a' }}>
            <StaggeredMenu
              isFixed={true}
              position="left"
              items={menuItems}
              socialItems={socialItems}
              displaySocials={false}
              displayItemNumbering={true}
              menuButtonColor="#fff"
              openMenuButtonColor="#fff"
              changeMenuColorOnOpen={true}
              colors={['#FF0000', '#FF8A8A']}
              logoUrl="https://www.svgrepo.com/show/499592/close-x.svg"
              accentColor="#ff6b6b"
            />
          </div>
        </div>

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
            <SimpleGrid columns={[1, 1, 2]} gap={6}>
              {/* Profile Info Card */}
              <CardRoot
                bg="rgba(17, 24, 39, 0.9)"
                backdropFilter="blur(20px)"
                shadow="lg"
                rounded="xl"
                border="1px solid rgba(255,255,255,0.2)"
                color="white"
              >
                <CardBody p={6}>
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
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
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
                    
                    {/* The display of the year */}
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                        YEAR
                      </Text>
                      <Input
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
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
                  </Stack>
                </CardBody>
              </CardRoot>

              {/* Academic Info Card */}
              <CardRoot
                bg="rgba(17, 24, 39, 0.9)"
                backdropFilter="blur(20px)"
                shadow="lg"
                rounded="xl"
                border="1px solid rgba(255,255,255,0.2)"
                color="white"
              >
                <CardBody p={6}>
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
                      <Input
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
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
                  </Stack>
                </CardBody>
              </CardRoot>
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

            {/* Stats Cards - After Social Links */}
            <SimpleGrid columns={[1, 1, 2, 3]} gap={6} mt={6}>
              {/* Stats Card 1 */}
              <CardRoot
                bg="rgba(17, 24, 39, 0.9)"
                backdropFilter="blur(20px)"
                shadow="lg"
                rounded="xl"
                border="1px solid rgba(255,255,255,0.2)"
                color="white"
                p={6}
              >
                <Text fontSize="sm" color="gray.400" mb={2} fontWeight="bold">STUDY SESSIONS</Text>
                <Heading size="3xl" color="red.400" mb={1}>42</Heading>
                <Text fontSize="sm" color="green.400">↑ 12% from last month</Text>
              </CardRoot>

              {/* Stats Card 2 */}
              <CardRoot
                bg="rgba(17, 24, 39, 0.9)"
                backdropFilter="blur(20px)"
                shadow="lg"
                rounded="xl"
                border="1px solid rgba(255,255,255,0.2)"
                color="white"
                p={6}
              >
                <Text fontSize="sm" color="gray.400" mb={2} fontWeight="bold">TOTAL HOURS</Text>
                <Heading size="3xl" color="red.400" mb={1}>87h</Heading>
                <Text fontSize="sm" color="green.400">↑ 8% from last month</Text>
              </CardRoot>

              {/* Stats Card 3 */}
              <CardRoot
                bg="rgba(17, 24, 39, 0.9)"
                backdropFilter="blur(20px)"
                shadow="lg"
                rounded="xl"
                border="1px solid rgba(255,255,255,0.2)"
                color="white"
                p={6}
              >
                <Text fontSize="sm" color="gray.400" mb={2} fontWeight="bold">FAVORITE SPOTS</Text>
                <Heading size="3xl" color="red.400" mb={1}>12</Heading>
                <Text fontSize="sm" color="gray.400">Saved locations</Text>
              </CardRoot>
            </SimpleGrid>

            {/* Recent Activity Card */}
            <CardRoot
              mt={6}
              bg="rgba(17, 24, 39, 0.9)"
              backdropFilter="blur(20px)"
              shadow="lg"
              rounded="xl"
              border="1px solid rgba(255,255,255,0.2)"
              color="white"
            >
              <CardBody p={6}>
                <Heading size="lg" color="white" mb={6}>Recent Study Sessions</Heading>
                <Stack gap={4}>
                  {[
                    { location: "Snell Library", room: "Room 302", time: "2 hours ago", duration: "3h 20m" },
                    { location: "Curry Student Center", room: "Study Pod 12", time: "1 day ago", duration: "2h 15m" },
                    { location: "Marino Recreation", room: "Study Area", time: "2 days ago", duration: "1h 45m" },
                    { location: "Snell Library", room: "Room 450", time: "3 days ago", duration: "4h 10m" },
                  ].map((session, i) => (
                    <Box
                      key={i}
                      p={4}
                      bg="rgba(0,0,0,0.3)"
                      rounded="lg"
                      border="1px solid rgba(255,255,255,0.1)"
                      _hover={{ borderColor: "red.500", transform: "translateX(4px)" }}
                      transition="all 0.2s"
                    >
                      <Stack direction="row" justify="space-between" align="center">
                        <Box>
                          <Text fontSize="md" fontWeight="bold" color="white">{session.location}</Text>
                          <Text fontSize="sm" color="gray.400">{session.room}</Text>
                        </Box>
                        <Box textAlign="right">
                          <Text fontSize="sm" color="red.400" fontWeight="bold">{session.duration}</Text>
                          <Text fontSize="xs" color="gray.500">{session.time}</Text>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardBody>
            </CardRoot>
          </Box>
        </div>
      </main>
    </PageTransition>
  );
}
