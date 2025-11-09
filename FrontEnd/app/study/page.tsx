"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../supabase/lib/supabase";
import "../globals.css";
import StaggeredMenu from "../../components/StaggeredMenu";
import PageTransition from "../../components/PageTransition";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  CardRoot,
  Box,
  Dialog,
  Portal, 
  createOverlay
} from "@chakra-ui/react";

// Hook to fetch and filter available study spaces
const useAvailableSpaces = () => {
  const [availableSpaces, setAvailableSpaces] = React.useState<any[]>([]);
  const [spacesLoading, setSpacesLoading] = React.useState(true);
  const [spacesError, setSpacesError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAvailableSpaces = async () => {
      try {
        setSpacesLoading(true);
        
        // Get current day and time in EST
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const currentTime = now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Map JavaScript day (0-6) to day names for database columns
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDayName = dayNames[currentDay];

        // Fetch all time slots from ClassTime_Data
        const { data: timeSlots, error: fetchError } = await supabase
          .from('ClassTime_Data')
          .select('*');

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!timeSlots || timeSlots.length === 0) {
          setAvailableSpaces([]);
          return;
        }

        // Filter time slots: keep only those available today within current time
        const filtered = timeSlots.filter((slot: any) => {
          // Check if available on current day (boolean check)
          const isAvailableToday = slot[currentDayName];
          
          if (!isAvailableToday) {
            return false;
          }

          // Check if current time falls OUTSIDE the class time (room is FREE)
          const begin = slot.beginTime;    // Expected: "HH:MM"
          const end = slot.endTime;        // Expected: "HH:MM"

          // Return true if current time is NOT within the class time
          // (i.e., the room is available because the class is NOT happening now)
          return currentTime < begin || currentTime > end;
        });

        setAvailableSpaces(filtered);
        setSpacesError(null);
      } catch (err: any) {
        console.error('Error fetching available spaces:', err);
        setSpacesError(err.message || 'Failed to fetch spaces');
        setAvailableSpaces([]);
      } finally {
        setSpacesLoading(false);
      }
    };

    fetchAvailableSpaces();
  }, []);

  return { availableSpaces, spacesLoading, spacesError };
};

export default function Study() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [isMounted, setIsMounted] = React.useState(true);
  const [openDialogId, setOpenDialogId] = React.useState<number | null>(null);
  
  // Fetch available spaces from database
  const { availableSpaces, spacesLoading, spacesError } = useAvailableSpaces();

  const now = new Date();
  const timeEST = now.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour12: false
  });

  // Check if user is authenticated
  React.useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        
        if (authError || !user) {
          console.error('Auth error:', authError);
          router.push("/login");
          return;
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        if (isMounted) {
          router.push("/login");
        }
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const menuItems = [
    { label: "Home", ariaLabel: "Go to home page", link: "/" },
    { label: "About", ariaLabel: "Learn about us", link: "/about" },
    { label: "Study", ariaLabel: "View our services", link: "/study" },
    { label: "Profile", ariaLabel: "View your profile", link: "/profile" },
  ];

  const socialItems = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
  ];

  const building = [
  "Interdisciplinary Science & Engineering Complex (ISEC)", "Churchill Hall", "Mugar Life Sciences Building", "Ell Hall", "Richards Hall",
  "Dodge Hall", "International Village (IV)", "East Village (EV)", "Ryder Hall", "Shillman Hall","Khoury College", "Hastings Hall", "Smith Hall",
  "Hurtig Hall", "Lake Hall", "Holmes Hall", "Meserve Hall", "Knowles-Volpe Center", "Dockser Hall", "Stetson Hall", "Light Hall", "Kariotis Hall"
  ];


  // Function to close StaggeredMenu when dialog opens
  const closeStaggeredMenu = () => {
    const menuButton = document.querySelector('.sm-toggle');
    if (menuButton && menuButton.getAttribute('aria-expanded') === 'true') {
      (menuButton as HTMLElement).click();
    }
  };

  // Function to handle opening a dialog
  const handleOpenDialog = (cardId: number) => {
    setOpenDialogId(cardId);
    closeStaggeredMenu();
  };

  // Function to handle closing a dialog
  const handleCloseDialog = () => {
    setOpenDialogId(null);
  };

  // Function to handle joining a study space
  const handleJoinSpace = (spaceId: number) => {
    try {
      // TODO: Implement actual join functionality (e.g., API call)
      alert(`Joining study space at Location ${spaceId + 1}, Room ${100 + spaceId}!`);
      // You can add logic here to:
      // - Add to user's joined spaces
      // - Send notification to other users
      // - Update availability status
    } catch (err) {
      console.error('Error joining space:', err);
      alert('Failed to join space. Please try again.');
    }
  };

  // Function to handle viewing space details
  const handleViewSpace = (spaceId: number) => {
    handleOpenDialog(spaceId);
    // Additional view logic can be added here
  };

  return (
    <PageTransition>
      <main className="relative flex flex-col min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)] z-0" />

          {/* Staggered Menu */}
          <div className="position-sticky absolute top-0 left-0">
            <div style={{ height: '100vh', background: '#1a1a1a' }}>
              <StaggeredMenu
                isFixed={false}
                position="left"
                items={menuItems}
                socialItems={socialItems}
                displaySocials={false}
                displayItemNumbering={true}
                menuButtonColor="#fff"
                openMenuButtonColor="#fff"
                changeMenuColorOnOpen={true}
                colors={["#FF0000", "#FF8A8A"]}
                logoUrl="https://www.svgrepo.com/show/499592/close-x.svg"
                accentColor="#ff6b6b"
              />
            </div>
          </div>

        {/* Page content */}
        <div className="relative z-10 flex flex-col items-center justify-start w-full pt-28 px-8 overflow-y-auto">
          <Heading as="h1" size="7xl" mb={8} color="whiteAlpha.800" textAlign="center">
            EMPTY NEU
          </Heading>
          <Text fontSize="lg" maxW="3xl" textAlign="center" mb={10} color="gray.300">
            We help Northeastern students find open study spaces quickly and easily.
            Discover where you can focus, collaborate, or take a break across campus.
          </Text>

          {/* Add a small flex gird here for filtering data values */}
          <div className='flex flew-col'>
            <Text>yooo</Text>
            <div className="flex flew-row">
              <Text> hehe</Text>
            </div>
          </div>

          {/* Cards grid with clearer gaps */}
          <SimpleGrid columns={[1, 2, 3]} padding={24} gap={12} mb={12}>
            {availableSpaces.length > 0 ? (
              availableSpaces.map((space: any, i: number) => (
                <CardRoot
                  key={space.id}
                  bg="gray.900"
                  shadow={"lg"}
                  rounded={"2xl"}
                  border="2px solid rgba(241, 37, 37, 0.3)"
                  _hover={{ transform: "scale(1.1)", transition: "0.2s ease-out", zIndex: 999 }}
                  transition="all 0.2s ease-out"
                  color="white"
                  position="relative"
                >
                  <CardHeader>
                    <Stack direction="row" gap={4} align="center">
                      {/* Availability indicator - all are available since filtered */}
                      <Avatar.Root
                        bg="green"
                        title="Available"
                      />
                      <Box>
                        <Heading size="md" color="white">{space.building}</Heading>
                        <Text fontSize="sm" color="gray.400">Room {space.roomNumber}</Text>
                        <Text fontSize="xs" color="green.300">
                          {space.beginTime} - {space.endTime}
                        </Text>
                      </Box>
                    </Stack>
                  </CardHeader>

                  <CardBody>
                    <Text color="gray.300">
                      {space.courseName} (CRN: {space.crn})
                    </Text>
                  </CardBody>

                  <CardFooter justifyContent="flex-end" gap={3}>
                    <Button 
                      variant="outline" 
                      colorScheme="red"
                      onClick={() => handleViewSpace(i)}
                      color="white"
                      borderColor="red.500"
                      _hover={{ bg: "red.600", color: "white" }}
                    >
                      View 
                    </Button>
                    <Button 
                      colorScheme="red"
                      bg="red.600"
                      color="white"
                      _hover={{ bg: "red.700" }}
                      onClick={() => handleJoinSpace(i)}
                    >
                      Join
                    </Button>
                  </CardFooter>
                </CardRoot>
              ))
            ) : (
              <Box gridColumn="1 / -1" textAlign="center" py={12}>
                <Text fontSize="lg" color="gray.400">
                  {spacesError ? `Error: ${spacesError}` : 'No available study spaces at this time'}
                </Text>
              </Box>
            )}
          </SimpleGrid>
        </div>

        {/* Dialog for viewing space details */}
        {openDialogId !== null && availableSpaces[openDialogId] && (
          <Dialog.Root open={true} onOpenChange={(details) => {
            if (!details.open) {
              handleCloseDialog();
            }
          }}>
            <Dialog.Backdrop bg="blackAlpha.700" />
            <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
              <Dialog.Content 
                bg="gray.900" 
                border="2px solid" 
                borderColor="gray.700" 
                rounded="2xl" 
                maxW="2xl" 
                w="90%" 
                p={8}
                shadow="2xl"
              >
                <Dialog.Header pb={4}>
                  <Dialog.Title fontSize="3xl" fontWeight="bold" color="white">
                    {availableSpaces[openDialogId].building} - Room {availableSpaces[openDialogId].roomNumber}
                  </Dialog.Title>
                </Dialog.Header>
                
                <Dialog.Body mt={6} color="gray.300" fontSize="lg">
                  <Stack gap={6}>
                    <Box>
                      <Text fontWeight="semibold" color="white" mb={3} fontSize="xl">Status</Text>
                      <Text color="green.400" fontSize="lg">
                        ✓ Available
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="semibold" color="white" mb={3} fontSize="xl">Course</Text>
                      <Text>
                        {availableSpaces[openDialogId].courseName}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="semibold" color="white" mb={3} fontSize="xl">Time Slot</Text>
                      <Text>
                        {availableSpaces[openDialogId].beginTime} - {availableSpaces[openDialogId].endTime}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="semibold" color="white" mb={3} fontSize="xl">CRN</Text>
                      <Text>
                        {availableSpaces[openDialogId].crn}
                      </Text>
                    </Box>
                  </Stack>
                </Dialog.Body>

                <Dialog.Footer mt={8} gap={4}>
                  <Button
                    variant="outline"
                    onClick={handleCloseDialog}
                    color="gray.300"
                    borderColor="gray.600"
                    _hover={{ bg: "gray.800" }}
                    size="lg"
                    px={8}
                  >
                    Close
                  </Button>
                  <Button
                    bg="red.600"
                    color="white"
                    _hover={{ bg: "red.700" }}
                    onClick={() => {
                      handleJoinSpace(openDialogId);
                      handleCloseDialog();
                    }}
                    size="lg"
                    px={8}
                  >
                    Join Space
                  </Button>
                </Dialog.Footer>

                <Dialog.CloseTrigger 
                  position="absolute" 
                  top={6} 
                  right={6}
                  color="gray.400"
                  _hover={{ color: "white" }}
                  fontSize="xl"
                />
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        )}
      </main>
    </PageTransition>
  );
}
