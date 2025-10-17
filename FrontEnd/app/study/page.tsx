"use client";

import React from "react";
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

export default function About() {
  const [openDialogId, setOpenDialogId] = React.useState<number | null>(null);

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

  return (
    <PageTransition>
      <main className="relative flex flex-col min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)] z-0" />

      {/* Staggered Menu (fixed to viewport) */}
      <div className="fixed top-0 left-0 z-50 h-screen w-screen">
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
          isFixed={true}
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
        <SimpleGrid columns={[1, 2, 3, 4]} gap={8} mb={12}>
          {Array.from({ length: 16 }).map((_, i) => (
            <CardRoot
              key={i}
              bg="gray.800"
              border="1px solid rgba(255,255,255,0.1)"
              _hover={{ transform: "scale(1.03)", transition: "0.2s ease-out" }}
              transition="all 0.2s ease-out"
            >
              <CardHeader>
                <Stack direction="row" gap={4} align="center">
                  {/* Availability indicator via avatar color */}
                  <Avatar.Root
                    bg={i % 2 === 0 ? 'green' : 'red'}
                    title={i % 2 === 0 ? 'Available' : 'Not available'}
                  />
                  <Box>
                    <Heading size="md">Location {i + 1}</Heading>
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
                >
                  View
                </Button>
                <Button colorScheme="red">Join</Button>
              </CardFooter>
            </CardRoot>
          ))}
        </SimpleGrid>
      </div>

    </main>
    </PageTransition>
  );
}
