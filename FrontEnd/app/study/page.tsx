"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../supabase/lib/supabase";
import "../globals.css";
import PageTransition from "../../components/PageTransition";
import { motion } from "framer-motion";
import {
  Avatar,
  Button,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  CardRoot,
  Box,
  Dialog,
  Alert,
} from "@chakra-ui/react";
import SideBar from "@/components/SideBar";

export default function Study() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [isMounted, setIsMounted] = React.useState(true);
  const [uniqueSpaces, setUniqueSpaces] = React.useState<any[]>([]);
  const [allSpaces, setAllSpaces] = React.useState<any[]>([]);
  const [spacesError, setSpacesError] = React.useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = React.useState<number | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [showFilters, setShowFilters] = React.useState<boolean>(false);
  const [filterAvailability, setFilterAvailability] = React.useState<string>('all'); // 'all', 'available', 'in-use'
  const [tempFilterAvailability, setTempFilterAvailability] = React.useState<string>('all'); // Temporary filter before apply
  const [filterCapacity, setFilterCapacity] = React.useState<string>('all'); // 'all', 'high', 'medium', 'low'
  const [tempFilterCapacity, setTempFilterCapacity] = React.useState<string>('all'); // Temporary capacity filter before apply
  const [visibleCards, setVisibleCards] = React.useState<Set<string>>(new Set());
  const [cardsToDisplay, setCardsToDisplay] = React.useState<number>(12);
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState<boolean>(false);
  const [notification, setNotification] = React.useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [roomUsers, setRoomUsers] = React.useState<any[]>([]);
  const [allRoomOccupancy, setAllRoomOccupancy] = React.useState<any>({});
  const [userBookingId, setUserBookingId] = React.useState<string | null>(null);
  const [currentTime, setCurrentTime] = React.useState<string>('');

  // Helper: Convert time string to minutes
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper: Convert 24-hour to 12-hour format
  const convertTo12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // List of room descriptions
  const roomDescriptions = [
    "Perfect spot for focused studying with great ambiance.",
    "Ideal for collaborative group work and discussions.",
    "Quiet environment, excellent for concentration.",
    "Well-lit space with comfortable seating arrangements.",
    "Great location with easy access to campus facilities.",
    "Modern setup with all the amenities you need.",
    "Spacious room perfect for presentations and projects.",
    "Cozy corner ideal for one-on-one tutoring sessions.",
    "High-tech equipped for digital learning and research.",
    "Natural light-filled room for afternoon study sessions.",
    "Intimate setting for small group meetings.",
    "Open layout great for brainstorming sessions.",
    "Quiet sanctuary away from campus hustle and bustle.",
    "Technology-enabled space for online learning.",
    "Comfortable seating for long study marathons."
  ];

  // Helper: Get random description for a room
  const getDescriptionForRoom = (building: string, roomNumber: string) => {
    // Create a consistent seed from building + room for consistent randomness
    const seed = `${building}${roomNumber}`.charCodeAt(0) + `${building}${roomNumber}`.length;
    return roomDescriptions[seed % roomDescriptions.length];
  };

  // Helper: Get all classes for a specific room on a specific day
  const getClassesForRoom = (building: string, roomNumber: string, dayIndex: number) => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayIndex];

    return (allSpaces || [])
      .filter((slot: any) => 
        slot.building === building && 
        slot.roomNumber === roomNumber && 
        slot[dayName] === true
      )
      .sort((a: any, b: any) => a.beginTime.localeCompare(b.beginTime));
  };

  // Handle Join Room
  const handleJoinRoom = async (space: any) => {
    try {
      console.log('Attempting to join room:', space);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNotification({ show: true, message: 'Please log in to join a room' });
        return;
      }

      // Check if user already has an active booking
      if (userBookingId) {
        setNotification({ show: true, message: 'You are already in a room. Please leave first.' });
        return;
      }

      // Check if user is already in this specific room
      const { data: existingBooking, error: checkError } = await supabase
        .from('RoomBooking')
        .select('id')
        .eq('user', user.id)
        .eq('buildingName', space.building)
        .eq('roomNumber', space.roomNumber)
        .eq('inUse', true)
        .single();

      if (existingBooking) {
        setNotification({ show: true, message: `You are already in ${space.building} Room ${space.roomNumber}` });
        return;
      }

      // Insert booking into RoomBooking table
      console.log('📝 Inserting booking with data:', {
        space_id: space.id,
        buildingName: space.building,
        roomNumber: space.roomNumber,
        user: user.id,
        inUse: true
      });

      const { data, error } = await supabase.from('RoomBooking').insert([
        {
          space_id: space.id,
          buildingName: space.building,
          roomNumber: space.roomNumber,
          user: user.id,
          inUse: true
        }
      ] as any).select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Insert successful:', data);

      // Store the booking ID for later logout
      if (data && data[0]) {
        setUserBookingId((data[0] as any).id);

        // Auto-logout after 2 hours (7200 seconds)
        const autoLogoutTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
        const timeoutId = setTimeout(() => {
          handleLeaveRoom((data[0] as any).id);
          setNotification({ 
            show: true, 
            message: `Auto-logged out from ${space.building} Room ${space.roomNumber}` 
          });
        }, autoLogoutTime);

        // Store timeout ID for cleanup
        (window as any).roomLogoutTimeout = timeoutId;
      }

      setNotification({ 
        show: true, 
        message: `You joined ${space.building} Room ${space.roomNumber}` 
      });

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 3000);
      
      // Refresh occupancy
      await fetchAllRoomOccupancy();
    } catch (err: any) {
      console.error('Error joining room:', err);
      console.error('Error details:', err.message, err.details, err.hint);
      setNotification({ show: true, message: 'Failed to join room. Please try again.' });
    }
  };

  // Handle Leave Room
  const handleLeaveRoom = async (bookingId: string) => {
    try {
      console.log('🚪 Attempting to leave room with booking ID:', bookingId);
      
      const { error } = await (supabase as any)
        .from('RoomBooking')
        .update({ inUse: false })
        .eq('id', bookingId);

      if (error) {
        console.error('Error updating inUse:', error);
        throw error;
      }

      console.log('Successfully marked as inUse: false');
      setUserBookingId(null);
      
      // Refresh occupancy after leaving
      await fetchAllRoomOccupancy();
      
      setNotification({ show: true, message: 'You have left the room' });
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 2000);
    } catch (err: any) {
      console.error('Error leaving room:', err);
      setNotification({ show: true, message: 'Failed to leave room. Please try again.' });
    }
  };

  // Fetch users in a specific room with their course info
  const fetchRoomUsers = async (building: string, roomNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('RoomBooking')
        .select('user, buildingName, roomNumber, inUse, major, courses')
        .eq('buildingName', building)
        .eq('roomNumber', roomNumber)
        .eq('inUse', true);

      if (error) throw error;
      
      // Fetch user profiles for each booking
      const enrichedData = await Promise.all((data || []).map(async (booking: any) => {
        try {
          let courses = booking.courses;
          let firstName = 'Unknown';
          let lastName = 'User';
          
          // Try to get user data from UserData table (primary source for courses)
          try {
            const { data: userData } = await supabase
              .from('UserData')
              .select('firstName, lastName, courses')
              .eq('user_id', booking.user)
              .single();
            
            if (userData) {
              firstName = (userData as any).firstName || 'Unknown';
              lastName = (userData as any).lastName || 'User';
              courses = (userData as any).courses || courses;
              console.log(`✅ Got UserData for ${booking.user}:`, courses);
            }
          } catch (err) {
            console.log(`⚠️ No UserData found for ${booking.user}, trying profiles...`);
          }
          
          // Fallback to profiles table if needed
          if (firstName === 'Unknown' && lastName === 'User') {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name, courses')
                .eq('id', booking.user)
                .single();
              
              if (profile) {
                firstName = (profile as any).first_name || 'Unknown';
                lastName = (profile as any).last_name || 'User';
                courses = (profile as any).courses || courses;
                console.log(`Got profile for ${booking.user}:`, courses);
              }
            } catch (err) {
              console.log(`No profile found for ${booking.user}`);
            }
          }
          
          return { 
            ...booking, 
            first_name: firstName, 
            last_name: lastName,
            courses: courses
          };
        } catch (err) {
          console.error('Error enriching user:', booking.user, err);
          return { ...booking, first_name: 'Unknown', last_name: 'User', courses: null };
        }
      }));
      
      console.log('👥 Room users enriched:', enrichedData);
      setRoomUsers(enrichedData);
    } catch (err: any) {
      console.error('Error fetching room users:', err);
      setRoomUsers([]);
    }
  };

  // Fetch occupancy for ALL rooms
  const fetchAllRoomOccupancy = async () => {
    try {
      const { data, error } = await supabase
        .from('RoomBooking')
        .select('buildingName, roomNumber, inUse')
        .eq('inUse', true);

      if (error) throw error;

      // Count users per room
      const occupancyMap: any = {};
      (data || []).forEach((booking: any) => {
        const key = `${booking.buildingName}|${booking.roomNumber}`;
        occupancyMap[key] = (occupancyMap[key] || 0) + 1;
      });

      setAllRoomOccupancy(occupancyMap);
      console.log('📊 Room occupancy fetched:', occupancyMap);
    } catch (err: any) {
      console.error('Error fetching room occupancy:', err);
      setAllRoomOccupancy({});
    }
  };

  // Auto-refresh occupancy every 1 minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchAllRoomOccupancy();
      console.log('🔄 Auto-refreshing room occupancy...');
    }, 60000); // 1 minute (60 seconds)

    return () => clearInterval(interval);
  }, []);

  // Update current time every second
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(time);
    };
    //yap
    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Fetch and filter available spaces
  React.useEffect(() => {
    const fetchAvailableSpaces = async () => {
      try {
        setLoading(true);

        // Get current user to fetch their booking
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if user has an active booking
          const { data: userBooking } = await (supabase as any)
            .from('RoomBooking')
            .select('id')
            .eq('user', user.id)
            .eq('inUse', true)
            .single();
          
          if (userBooking) {
            setUserBookingId((userBooking as any).id);
            console.log('✅ User has active booking:', (userBooking as any).id);
          }
        }

        // Fetch ALL slots from database using pagination if needed
        let allTimeSlots: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data: pageData, error: fetchError } = await supabase
            .from('ClassTime_Data')
            .select('*')
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (fetchError) throw new Error(fetchError.message);
          
          if (!pageData || pageData.length === 0) {
            hasMore = false;
          } else {
            allTimeSlots = [...allTimeSlots, ...pageData];
            page++;
            if (pageData.length < pageSize) hasMore = false;
          }
        }

        const timeSlots = allTimeSlots;
        console.log(`📊 Total slots from DB (with pagination): ${timeSlots.length}`);

        // Store ALL spaces for later reference
        setAllSpaces(timeSlots);

        // DEBUG: Log all unique courses
        const uniqueCourses = new Set(timeSlots.map((s: any) => s.courseName));
        console.log(`📚 Total unique courses: ${uniqueCourses.size}`);
        console.log(`📚 All courses:`, Array.from(uniqueCourses));
        
        // Check for Program Design specifically
        const progDesign = timeSlots.filter((s: any) => s.courseName?.includes('Program Design'));
        console.log(`🔍 "Program Design" courses found: ${progDesign.length}`, progDesign);
        
        // Check for any variant spellings
        const allProgram = timeSlots.filter((s: any) => s.courseName?.toLowerCase().includes('program'));
        console.log(`🔍 All "program" courses:`, allProgram.map((p: any) => p.courseName));

        // Get current time (EST)
        const now = new Date();
        const currentDayIndex = now.getDay();

        const dayNames = [
          'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
        ];
        const currentDayName = dayNames[currentDayIndex];

        // Use current time
        const currentTime = now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        console.log(`📍 Viewing: ${currentDayName} at ${currentTime}`);

        // FILTER: Keep only rooms that are AVAILABLE at the current time
        const availableNow = timeSlots.filter((slot: any) => {
          const hasClassToday = slot[currentDayName];

          // Saturday and Sunday: all rooms available (return all slots without class filtering)
          if (currentDayIndex === 6 || currentDayIndex === 0) return true;

          // No class today = available all day
          if (!hasClassToday) return true;

          // Has class = check if current time is OUTSIDE the class period
          const isOutsideClass = currentTime < slot.beginTime || currentTime > slot.endTime;
          return isOutsideClass;
        });

        console.log(`✅ Available: ${availableNow.length}`);

        // DEDUPLICATE: Keep only ONE card per room (the one with latest endTime)
        const seenRooms = new Map<string, any>();
        availableNow.forEach((slot: any) => {
          const key = `${slot.building}|${slot.roomNumber}`;
          const existing = seenRooms.get(key);

          if (!existing || slot.endTime > existing.endTime) {
            seenRooms.set(key, slot);
          }
        });

        // Convert to array and sort
        const unique = Array.from(seenRooms.values()).sort((a: any, b: any) => {
          const buildingCompare = a.building.localeCompare(b.building);
          if (buildingCompare !== 0) return buildingCompare;
          return parseInt(a.roomNumber) - parseInt(b.roomNumber);
        });

        console.log(`🎯 Unique spaces: ${unique.length}`);
        console.log(`📌 All unique rooms:`, unique.map((u: any) => `${u.building} Room ${u.roomNumber} - ${u.courseName}`));
        setUniqueSpaces(unique);
        setSpacesError(null);

        // Fetch room occupancy data
        await fetchAllRoomOccupancy();
      } catch (err: any) {
        console.error('❌ Error:', err);
        setSpacesError(err.message || 'Failed to fetch spaces');
        setUniqueSpaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSpaces();
  }, []);

  // Auth check and redirect if not logged in
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Redirect to login page if not authenticated
          router.push('/login');
        }
      } catch (err) {
        console.error('Auth error:', err);
        router.push('/login');
      }
    };

    if (isMounted) {
      checkAuth();
    }
  }, [isMounted, router]);

  // Initialize mounted state
  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Group by building - moved before useEffect
  const grouped = uniqueSpaces.reduce((acc: any, space: any) => {
    if (!acc[space.building]) acc[space.building] = [];
    acc[space.building].push(space);
    return acc;
  }, {});

  // Filter spaces based on search query and availability - using useMemo
  const filteredGrouped = React.useMemo(() => {
    return Object.entries(grouped).reduce((acc: any, [building, spaces]: [string, any]) => {
      const filtered = spaces.filter((space: any) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = building.toLowerCase().includes(searchLower) || space.roomNumber.toString().includes(searchLower);
        
        // Apply availability filter
        if (filterAvailability !== 'all') {
          const currentDayIndex = selectedDayIndex !== null ? selectedDayIndex : new Date().getDay();
          const classesInRoom = getClassesForRoom(space.building, space.roomNumber, currentDayIndex);
          const currentTime = selectedDayIndex !== null ? '11:00:00' : new Date().toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          const isAvailable = !classesInRoom.some((cls: any) => currentTime >= cls.beginTime && currentTime <= cls.endTime);
          
          if (filterAvailability === 'available' && !isAvailable) return false;
          if (filterAvailability === 'in-use' && isAvailable) return false;
        }

        // Apply capacity filter based on how empty the room is
        if (filterCapacity !== 'all') {
          // Get user count for this room from allRoomOccupancy map
          const roomKey = `${space.building}|${space.roomNumber}`;
          const usersInRoom = allRoomOccupancy[roomKey] || 0;

          // Define capacity levels
          // Assuming max capacity is around 25 people per room
          const maxCapacity = 25;
          const occupancyRate = (usersInRoom / maxCapacity) * 100;

          // High = 0-33% occupied (mostly empty), Medium = 34-66%, Low = 67%+ (mostly full)
          if (filterCapacity === 'high' && occupancyRate > 33) return false;
          if (filterCapacity === 'medium' && (occupancyRate <= 33 || occupancyRate > 66)) return false;
          if (filterCapacity === 'low' && occupancyRate <= 66) return false;
        }
        
        return matchesSearch;
      });
      if (filtered.length > 0) {
        acc[building] = filtered;
      }
      return acc;
    }, {});
  }, [grouped, searchQuery, filterAvailability, filterCapacity, allRoomOccupancy]);

  // Reset cardsToDisplay when day or filters change
  React.useEffect(() => {
    setCardsToDisplay(12);
  }, [selectedDayIndex, searchQuery, filterAvailability]);

  // Scroll animation observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute('data-key');
            if (key) {
              setVisibleCards((prev) => new Set([...prev, key]));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('[data-key]');
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [uniqueSpaces, cardsToDisplay]);

  // Fetch room users when dialog opens
  React.useEffect(() => {
    if (openDialogId !== null && uniqueSpaces[openDialogId]) {
      fetchRoomUsers(uniqueSpaces[openDialogId].building, uniqueSpaces[openDialogId].roomNumber);
    }
  }, [openDialogId, uniqueSpaces]);

  // Infinite scroll observer
  React.useEffect(() => {
    const sentinel = document.getElementById('scroll-sentinel');
    if (!sentinel) return;

    const scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Get total filtered card count
            const totalCards = Object.values(filteredGrouped).reduce(
              (count: number, spaces: any) => count + spaces.length,
              0
            );
            
            // Load more if there are additional cards to display
            if (cardsToDisplay < totalCards) {
              setCardsToDisplay((prev) => prev + 12);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    scrollObserver.observe(sentinel);
    return () => scrollObserver.unobserve(sentinel);
  }, [cardsToDisplay, filteredGrouped]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading available rooms...</div>
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

  return (
    <PageTransition>
      <main className="relative flex flex-col min-h-screen bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-[rgba(0,0,0,0.6)] via-[rgba(0,0,0,0.8)] to-[rgba(0,0,0,0.9)] z-0" />

        <SideBar/>

        <div className="relative z-10 flex flex-col items-center justify-start w-full pt-16 px-8 overflow-y-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12 w-full"
          >
            <Heading as="h1" size="7xl" mb={4} color="white" fontWeight="900" letterSpacing="-0.02em">
              EMPTY NEU
            </Heading>
            <Text fontSize="xl" maxW="2xl" mx="auto" color="gray.400" fontWeight="500" mb={6}>
              Find your perfect study space on campus in seconds
            </Text>
          </motion.div>

          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="w-full max-w-7xl mb-12"
            style={{
              borderRadius: '20px',
              padding: '32px',
              background: 'rgba(10, 10, 10, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              overflow: 'visible'
            }}
          >
            {/* Search and Filter Row */}
            <Box mb={6}>
              {/* Building/Room Search Input */}
              <Box position="relative" style={{ zIndex: 20 }} mb={6}>
                <input
                  type="text"
                  placeholder="Search building..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowBuildingDropdown(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    fontWeight: '500',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                    setShowBuildingDropdown(true);
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.boxShadow = 'none';
                    setTimeout(() => setShowBuildingDropdown(false), 150);
                  }}
                />
                
                {/* Building Dropdown */}
                {showBuildingDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '8px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    border: '1.5px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    zIndex: 50,
                    boxShadow: '0 0 30px rgba(220, 20, 60, 0.2)'
                  }}>
                    {Array.from(new Set(
                      uniqueSpaces.map(space => space.building)
                    )).sort().filter(building => 
                      building.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((building) => (
                      <div
                        key={building}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchQuery(building);
                          setShowBuildingDropdown(false);
                        }}
                        style={{
                          padding: '14px 16px',
                          cursor: 'pointer',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '500',
                          borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {building}
                      </div>
                    ))}
                  </div>
                )}
              </Box>
            </Box>

            {/* Availability Filter Buttons */}
            <Box mb={6}>
              <Text fontSize="sm" fontWeight="600" color="gray.400" mb={3} textTransform="uppercase" letterSpacing="0.05em">
                Availability
              </Text>
              <SimpleGrid columns={[3]} gap={3}>
                <Button
                  onClick={() => setTempFilterAvailability('all')}
                  bg={tempFilterAvailability === 'all' ? 'red.600' : 'whiteAlpha.100'}
                  color="white"
                  _hover={{ bg: tempFilterAvailability === 'all' ? 'red.700' : 'whiteAlpha.150' }}
                  fontWeight="600"
                  transition="all 0.2s"
                  border="1.5px solid rgba(239, 68, 68, 0.3)"
                >
                  All
                </Button>
                <Button
                  onClick={() => setTempFilterAvailability('available')}
                  bg={tempFilterAvailability === 'available' ? 'red.600' : 'whiteAlpha.100'}
                  color="white"
                  _hover={{ bg: tempFilterAvailability === 'available' ? 'red.700' : 'whiteAlpha.150' }}
                  fontWeight="600"
                  transition="all 0.2s"
                  border="1.5px solid rgba(239, 68, 68, 0.3)"
                >
                  Available
                </Button>
                <Button
                  onClick={() => setTempFilterAvailability('in-use')}
                  bg={tempFilterAvailability === 'in-use' ? 'red.600' : 'whiteAlpha.100'}
                  color="white"
                  _hover={{ bg: tempFilterAvailability === 'in-use' ? 'red.700' : 'whiteAlpha.150' }}
                  fontWeight="600"
                  transition="all 0.2s"
                  border="1.5px solid rgba(239, 68, 68, 0.3)"
                >
                  In Use
                </Button>
              </SimpleGrid>
            </Box>

            {/* Capacity Filter Buttons */}
            <Box mb={6}>
              <Text fontSize="sm" fontWeight="600" color="gray.400" mb={3} textTransform="uppercase" letterSpacing="0.05em">
                Capacity
              </Text>
              <SimpleGrid columns={[3]} gap={3}>
                <Button
                  onClick={() => setTempFilterCapacity('all')}
                  bg={tempFilterCapacity === 'all' ? 'red.600' : 'whiteAlpha.100'}
                  color="white"
                  _hover={{ bg: tempFilterCapacity === 'all' ? 'red.700' : 'whiteAlpha.150' }}
                  fontWeight="600"
                  transition="all 0.2s"
                  border="1.5px solid rgba(239, 68, 68, 0.3)"
                >
                  All
                </Button>
                <Button
                  onClick={() => setTempFilterCapacity('high')}
                  bg={tempFilterCapacity === 'high' ? 'red.600' : 'whiteAlpha.100'}
                  color="white"
                  _hover={{ bg: tempFilterCapacity === 'high' ? 'red.700' : 'whiteAlpha.150' }}
                  fontWeight="600"
                  transition="all 0.2s"
                  border="1.5px solid rgba(239, 68, 68, 0.3)"
                >
                  Most Empty
                </Button>
                <Button
                  onClick={() => setTempFilterCapacity('medium')}
                  bg={tempFilterCapacity === 'medium' ? 'red.600' : 'whiteAlpha.100'}
                  color="white"
                  _hover={{ bg: tempFilterCapacity === 'medium' ? 'red.700' : 'whiteAlpha.150' }}
                  fontWeight="600"
                  transition="all 0.2s"
                  border="1.5px solid rgba(239, 68, 68, 0.3)"
                >
                  Medium
                </Button>
                <Button
                  onClick={() => setTempFilterCapacity('low')}
                  bg={tempFilterCapacity === 'low' ? 'red.600' : 'whiteAlpha.100'}
                  color="white"
                  _hover={{ bg: tempFilterCapacity === 'low' ? 'red.700' : 'whiteAlpha.150' }}
                  fontWeight="600"
                  transition="all 0.2s"
                  border="1.5px solid rgba(239, 68, 68, 0.3)"
                >
                  Most Full
                </Button>
              </SimpleGrid>
            </Box>

            {/* Apply Button */}
            <Button
              onClick={() => {
                setFilterAvailability(tempFilterAvailability);
                setFilterCapacity(tempFilterCapacity);
                setShowFilters(false);
              }}
              bg="red.600"
              color="white"
              _hover={{ bg: "red.700" }}
              size="md"
              fontWeight="600"
              border="1px solid rgba(239, 68, 68, 0.3)"
              w="100%"
              mb={3}
            >
              Apply
            </Button>

            {/* Leave Room Button - Always visible */}
            <Button
              onClick={() => {
                if (userBookingId) {
                  handleLeaveRoom(userBookingId);
                  setNotification({ show: true, message: 'You have left the room' });
                  setTimeout(() => {
                    setNotification({ show: false, message: '' });
                  }, 2000);
                }
              }}
              bg="red.600"
              color="white"
              _hover={{ bg: "red.700" }}
              size="md"
              fontWeight="600"
              border="1px solid rgba(239, 68, 68, 0.3)"
              w="100%"
              mt={0}
            >
              Leave Current Room
            </Button>
          </motion.div>

          {/* Results Stats */}
          {/* Section removed */}

          {/* Cards grid */}
          {uniqueSpaces.length > 0 ? (
            <div className="w-full max-w-7xl mx-auto flex justify-center">
              {(() => {
                // Flatten all filtered spaces into a single array
                const allFilteredSpaces: any[] = [];
                Object.values(filteredGrouped).forEach((spaces: any) => {
                  allFilteredSpaces.push(...spaces);
                });

                // Filter to only show spaces with classes and limit to cardsToDisplay
                const displayedSpaces = allFilteredSpaces.filter((space: any) => {
                  const currentDayIndex = selectedDayIndex !== null ? selectedDayIndex : new Date().getDay();
                  // For Saturday (6) and Sunday (0), show all rooms
                  // For other days, only show rooms with classes
                  if (currentDayIndex === 6 || currentDayIndex === 0) {
                    return true;
                  }
                  const classesInRoom = getClassesForRoom(space.building, space.roomNumber, currentDayIndex);
                  return classesInRoom.length > 0;
                }).slice(0, cardsToDisplay);

                return (
                  <>
                    <SimpleGrid columns={[1, 1, 3]} gap={6} w="full">
                      {displayedSpaces.map((space: any, displayIndex: number) => {
                        const currentDayIndex = selectedDayIndex !== null ? selectedDayIndex : new Date().getDay();
                        const classesInRoom = getClassesForRoom(space.building, space.roomNumber, currentDayIndex);
                        
                        // Check if room is currently available
                        const currentTime = selectedDayIndex !== null ? '11:00:00' : new Date().toLocaleTimeString('en-US', {
                          timeZone: 'America/New_York',
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        });

                        const isCurrentlyAvailable = !classesInRoom.some((cls: any) => {
                          return currentTime >= cls.beginTime && currentTime <= cls.endTime;
                        });

                        return (
                        <CardRoot
                          key={`${space.building}|${space.roomNumber}`}
                          data-key={`${space.building}|${space.roomNumber}`}
                          bg="linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.8) 100%)"
                          shadow="lg"
                          rounded="2xl"
                          border="1px solid rgba(241, 37, 37, 0.15)"
                          backdropFilter="blur(10px)"
                          _hover={{
                            shadow: "2xl",
                            borderColor: "rgba(241, 37, 37, 0.4)",
                            bg: "linear-gradient(135deg, rgba(23, 30, 45, 0.9) 0%, rgba(35, 45, 65, 0.9) 100%)",
                            transform: "translateY(-4px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          }}
                          color="white"
                          position="relative"
                          overflow="hidden"
                          style={{
                            opacity: visibleCards.has(`${space.building}|${space.roomNumber}`) ? 1 : 0,
                            transform: visibleCards.has(`${space.building}|${space.roomNumber}`) ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                        >
                          {/* Top accent line */}
                          <Box h="3px" w="full" bg={isCurrentlyAvailable ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)" : "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)"} />

                          <Box p={5}>
                            {/* Header with building and room */}
                            <Stack direction="row" gap={3} mb={4} align="flex-start">
                              <Box
                                w="12"
                                h="12"
                                rounded="lg"
                                bg={isCurrentlyAvailable ? "green.500" : "red.600"}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                                boxShadow={isCurrentlyAvailable ? "0 0 20px rgba(34, 197, 94, 0.3)" : "0 0 20px rgba(239, 68, 68, 0.3)"}
                              >
                                <Text fontSize="xs" fontWeight="900" color="white">
                                  {String(displayIndex + 1).padStart(2, '0')}
                                </Text>
                              </Box>
                              <Box flex={1}>
                                <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">
                                  {space.building}
                                </Text>
                                <Heading size="md" color="white" mt={0.5}>
                                  Room {space.roomNumber}
                                </Heading>
                              </Box>
                            </Stack>

                            {/* Description */}
                            <Box mb={4}>
                              <Text color="gray.300" fontSize="sm" fontWeight="500" lineHeight="1.5" mb={3}>
                                {getDescriptionForRoom(space.building, space.roomNumber)}
                              </Text>
                              
                              {/* Status Badge */}
                              <Box display="flex" alignItems="center" gap={2} p={2.5} rounded="lg" bg={isCurrentlyAvailable ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"} border={`1px solid ${isCurrentlyAvailable ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`}>
                                <Box 
                                  w="2"
                                  h="2"
                                  borderRadius="full"
                                  bg={isCurrentlyAvailable ? "green.400" : "red.400"}
                                  boxShadow={isCurrentlyAvailable ? "0 0 8px rgba(34, 197, 94, 0.6)" : "0 0 8px rgba(239, 68, 68, 0.6)"}
                                />
                                <Text fontSize="xs" color={isCurrentlyAvailable ? "green.300" : "red.300"} fontWeight="600">
                                  {isCurrentlyAvailable ? "✓ Available Now" : "✗ Currently In Use"}
                                </Text>
                              </Box>
                            </Box>

                            {/* Action Buttons */}
                            <Stack direction={["column", "row"]} gap={2} pt={3} w="full" justifyContent="flex-end">
                              <Button
                                variant="outline"
                                colorScheme="red"
                                onClick={() => setOpenDialogId(uniqueSpaces.indexOf(space))}
                                size="sm"
                                fontWeight="600"
                              >
                                Details
                              </Button>
                              <Button
                                bg="red.600"
                                color="white"
                                _hover={{ bg: "red.700" }}
                                size="sm"
                                fontWeight="600"
                                onClick={() => handleJoinRoom(space)}
                              >
                                Join Now
                              </Button>
                            </Stack>
                          </Box>
                        </CardRoot>
                        );
                      })}
                    </SimpleGrid>
                    <div id="scroll-sentinel" style={{ height: '10px', marginTop: '2rem' }} />
                  </>
                );
              })()}
            </div>
          ) : (
            <Box gridColumn="1 / -1" textAlign="center" py={12}>
              <Text fontSize="lg" color="gray.400">
                {spacesError || 'No available study spaces at this time'}
              </Text>
            </Box>
          )}
        </div>

        {/* Notification Popup */}
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 999,
              backgroundColor: notification.message.toLowerCase().includes('error') || notification.message.toLowerCase().includes('failed') ? 'rgba(239, 68, 68, 0.95)' : 'rgba(34, 197, 94, 0.95)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              border: notification.message.toLowerCase().includes('error') || notification.message.toLowerCase().includes('failed') ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(34, 197, 94, 0.5)',
              boxShadow: notification.message.toLowerCase().includes('error') || notification.message.toLowerCase().includes('failed') ? '0 8px 32px rgba(239, 68, 68, 0.3)' : '0 8px 32px rgba(34, 197, 94, 0.3)',
              backdropFilter: 'blur(10px)',
              fontSize: '16px',
              fontWeight: '600',
              maxWidth: '90%'
            }}
          >
            {notification.message.toLowerCase().includes('error') || notification.message.toLowerCase().includes('failed') ? '✗' : '✓'} {notification.message}
          </motion.div>
        )}

        {/* Dialog */}
        {openDialogId !== null && uniqueSpaces[openDialogId] && (
          <Dialog.Root
            open={true}
            onOpenChange={(details) => {
              if (!details.open) setOpenDialogId(null);
            }}
          >
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
                    {uniqueSpaces[openDialogId].building} - Room {uniqueSpaces[openDialogId].roomNumber}
                  </Dialog.Title>
                </Dialog.Header>

                <Dialog.Body mt={6} color="gray.300" fontSize="lg">
                  <Stack gap={6}>
                    <Box>
                      <Text fontWeight="semibold" color="white" mb={3} fontSize="xl">
                        Status
                      </Text>
                      {(() => {
                        const currentDayIndex = selectedDayIndex !== null ? selectedDayIndex : new Date().getDay();
                        const classesInRoom = getClassesForRoom(uniqueSpaces[openDialogId].building, uniqueSpaces[openDialogId].roomNumber, currentDayIndex);
                        const currentTime = selectedDayIndex !== null ? '11:00:00' : new Date().toLocaleTimeString('en-US', {
                          timeZone: 'America/New_York',
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        });
                        const isAvailable = !classesInRoom.some((cls: any) => currentTime >= cls.beginTime && currentTime <= cls.endTime);
                        return (
                          <Text color={isAvailable ? "green.400" : "red.400"} fontSize="lg" fontWeight="600">
                            {isAvailable ? "✓ Available Now" : "✗ In Use"}
                          </Text>
                        );
                      })()}
                    </Box>

                    <Box>
                      <Text fontWeight="semibold" color="white" mb={3} fontSize="xl">
                        Classes Today
                      </Text>
                      {(() => {
                        const currentDayIndex = selectedDayIndex !== null ? selectedDayIndex : new Date().getDay();
                        // Don't show classes for Saturday and Sunday
                        if (currentDayIndex === 6 || currentDayIndex === 0) {
                          return <Text color="gray.400">No classes scheduled (Weekend)</Text>;
                        }
                        const classesInRoom = getClassesForRoom(uniqueSpaces[openDialogId].building, uniqueSpaces[openDialogId].roomNumber, currentDayIndex);
                        return classesInRoom.length > 0 ? (
                          <Stack gap={2}>
                            {classesInRoom.map((cls: any, idx: number) => (
                              <Box key={idx} pl={3} borderLeft="2px solid rgba(241, 37, 37, 0.5)" py={2}>
                                <Text color="gray.200" fontWeight="500" mb={1}>
                                  {cls.courseName}
                                </Text>
                                <Text fontSize="sm" color="gray.400">
                                  {convertTo12Hour(cls.beginTime)} - {convertTo12Hour(cls.endTime)}
                                </Text>
                              </Box>
                            ))}
                          </Stack>
                        ) : (
                          <Text color="gray.400">No classes scheduled for today</Text>
                        );
                      })()}
                    </Box>

                    <Box>
                      <Text fontWeight="semibold" color="white" mb={3} fontSize="xl">
                        Users in Room ({roomUsers.length})
                      </Text>
                      {roomUsers.length > 0 ? (
                        <Stack gap={2}>
                          {roomUsers.map((booking: any, idx: number) => (
                            <Box 
                              key={idx} 
                              pl={3} 
                              borderLeft="2px solid rgba(34, 197, 94, 0.5)" 
                              py={2}
                              bg="rgba(34, 197, 94, 0.1)"
                              rounded="lg"
                              px={3}
                            >
                              <Text color="gray.200" fontWeight="500" mb={1}>
                                {booking.first_name} {booking.last_name}
                              </Text>
                              {booking.courses ? (
                                <Text fontSize="sm" color="gray.400">
                                  {Array.isArray(booking.courses) ? booking.courses.join(', ') : booking.courses}
                                </Text>
                              ) : (
                                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                  No courses listed
                                </Text>
                              )}
                              {booking.major && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                  Major: {booking.major}
                                </Text>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Text color="gray.400">No users currently in this room</Text>
                      )}
                    </Box>
                  </Stack>
                </Dialog.Body>

                <Dialog.Footer mt={8} gap={4}>
                  <Button
                    variant="outline"
                    onClick={() => setOpenDialogId(null)}
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
                      if (openDialogId !== null && uniqueSpaces[openDialogId]) {
                        handleJoinRoom(uniqueSpaces[openDialogId]);
                        setOpenDialogId(null);
                      }
                    }}
                    size="lg"
                    px={8}
                  >
                    {userBookingId ? 'Already in a Room' : 'Join Space'}
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
