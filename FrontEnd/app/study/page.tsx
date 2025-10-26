"use client";

import React, { useState } from "react";
import "../globals.css";
import StaggeredMenu from "../../components/StaggeredMenu";
import PageTransition from "../../components/PageTransition";
import {
  Avatar,
  Button,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  CardRoot,
  Box,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogBackdrop,
  DialogCloseTrigger,
  DialogTitle
} from "@chakra-ui/react";

export default function About() {
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);

  const handleOpenDialog = (id: number) => {
    setOpenDialogId(id);
  };

  const handleCloseDialog = () => {
    setOpenDialogId(null);
  };

  const menuItems = [
    { label: "Home", ariaLabel: "Go to home page", link: "/" },
    { label: "About", ariaLabel: "Learn about us", link: "/about" },
    { label: "Study", ariaLabel: "View our services", link: "/study" },
    { label: "Contact", ariaLabel: "Get in touch", link: "/contact" },
  ];

  const socialItems = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
  ];

  return (
    <PageTransition>
      <main className="relative flex flex-col min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)] z-0" />

          {/* Staggered Menu */}
          <div className="position sticky top-0 left-0 z-100 w-screen h-full">
            <StaggeredMenu
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
              isFixed={false}
            />
          </div>

        {/* Page content */}
        <div className="relative z-10 flex flex-col items-center justify-start w-full pt-28 px-8 overflow-y-auto">
          <Heading as="h1" size="2xl" mb={8} textAlign="center">
            About EMPTY NEU
          </Heading>
          <Text fontSize="lg" maxW="3xl" textAlign="center" mb={10} color="gray.300">
            We help Northeastern students find open study spaces quickly and easily.
            Discover where you can focus, collaborate, or take a break across campus.
          </Text>

          {/* Cards grid with clearer gaps */}
          <SimpleGrid columns={[1, 2, 3]} padding={24} gap={12} mb={12}>
            {Array.from({ length: 15 }).map((_, i) => (
              <CardRoot
                key={i}
                bg="gray.900"
                shadow={"lg"}
                rounded={"2xl"}
                border="2px solid rgba(255,255,255,0.3)"
                _hover={{ transform: "scale(1.4)", transition: "0.2s ease-out" }}
                transition="all 0.2s ease-out"
                color="white"
              >
                <CardHeader>
                  <Stack direction="row" gap={4} align="center">
                    {/* Availability indicator via avatar color */}
                    <Avatar.Root
                      bg={i % 2 === 0 ? 'green' : 'red'}
                      title={i % 2 === 0 ? 'Available' : 'Not available'}
                    />
                    <Box>
                      <Heading size="md" color="white">Location {i + 1}</Heading>
                      <Text fontSize="sm" color="gray.400">Room {100 + i}</Text>
                      <Text fontSize="xs" color={i % 2 === 0 ? 'green.300' : 'red.300'}>
                        {i % 2 === 0 ? 'Available' : 'Not available'}
                      </Text>
                    </Box>
                  </Stack>
                </CardHeader>

                <CardBody>
                  <Text color="gray.300">
                    This is a cozy study area designed for productivity and focus.
                    Equipped with fast Wi-Fi, ample outlets, and comfy seating.
                  </Text>
                </CardBody>

                <CardFooter justifyContent="flex-end" gap={3}>
                  <Button 
                    variant="outline" 
                    colorScheme="red"
                    onClick={() => handleOpenDialog(i)}
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
                  >
                    Join
                  </Button>
                </CardFooter>
              </CardRoot>
            ))}
          </SimpleGrid>

          {/* Dialog for viewing details */}
          {Array.from({ length: 15 }).map((_, i) => (
            <DialogRoot
              key={i}
              open={openDialogId === i}
              onOpenChange={(e) => {
                if (!e.open) handleCloseDialog();
              }}
            >
              <DialogBackdrop 
                bg="blackAlpha.700"
                onClick={handleCloseDialog}
              />
              <DialogContent
                maxW="md"
                bg="gray.800"
                color="white"
              >
                <DialogHeader>
                  <DialogTitle>Location {i + 1} - Room {100 + i}</DialogTitle>
                  <DialogCloseTrigger onClick={handleCloseDialog} />
                </DialogHeader>
                <DialogBody>
                  <Stack gap={4}>
                    <Box>
                      <Text fontWeight="bold" mb={2}>Status:</Text>
                      <Text color={i % 2 === 0 ? 'green.300' : 'red.300'}>
                        {i % 2 === 0 ? 'Available' : 'Not available'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={2}>Open Hours:</Text>
                      <Text>8:00 AM - 10:00 PM</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={2}>Description:</Text>
                      <Text>
                        This is a cozy study area designed for productivity and focus.
                        Equipped with fast Wi-Fi, ample outlets, and comfy seating.
                        Perfect for individual study or small group collaboration.
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={2}>People Currently Here:</Text>
                      <Text>{Math.floor(Math.random() * 20)} people</Text>
                    </Box>
                  </Stack>
                </DialogBody>
                <DialogFooter>
                  <Button colorScheme="red" onClick={handleCloseDialog}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </DialogRoot>
          ))}
        </div>
      </main>
    </PageTransition>
  );
}
