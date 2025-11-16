import { Box, Heading, Text } from '@chakra-ui/react';

interface MissionSectionProps {
  ref?: React.RefObject<HTMLDivElement | null>;
}

export default function MissionSection({ ref }: MissionSectionProps) {
  return (
    <div ref={ref} className="w-full mb-12 transition-all duration-700">
      <Box maxW="6xl" mx="auto">
        <div className="mb-10 text-center">
          <Heading as="h1" className="text-9xl" color="white" fontWeight="black" mb={6} lineHeight="1">
            About Us
          </Heading>
          <Text fontSize="3xl" color="gray.400" maxW="4xl" mx="auto" fontWeight="light">
            Your campus, simplified.
          </Text>
        </div>

        {/* Mission Statement Card */}
        <Box 
          p={12} 
          bg="rgba(17, 24, 39, 0.8)" 
          rounded="3xl" 
          border="2px solid rgba(220,20,60,0.3)" 
          shadow="2xl"
          backdropFilter="blur(10px)"
          transition="all 0.3s ease"
          _hover={{ 
            borderColor: "rgba(220,20,60,0.5)",
            transform: "translateY(-2px)",
            shadow: "dark-lg"
          }}
        >
          <Text fontSize="md" color="red.400" fontWeight="bold" letterSpacing="widest" mb={4} textTransform="uppercase" textAlign="center">
            OUR MISSION
          </Text>
          <Heading size="4xl" mb={8} color="white" textAlign="center" fontWeight="black" lineHeight="1.2">
            Empowering Students, One Space at a Time
          </Heading>
          <Text fontSize="2xl" color="gray.300" lineHeight="tall" textAlign="center" mb={6}>
            EMPTY NEU was born from a simple frustration: wasting time searching for study spaces. 
            We&apos;re a team of Northeastern students who believe that finding the perfect place to study 
            shouldn&apos;t be a challenge—it should be effortless.
          </Text>
          <Text fontSize="2xl" color="gray.300" lineHeight="tall" textAlign="center">
            Our platform provides real-time information about study spaces across campus, helping you 
            make informed decisions about where to study, collaborate, and succeed. Whether you need 
            a quiet corner for focused work or a collaborative space for group projects, we&apos;ve got you covered.
          </Text>
        </Box>
      </Box>
    </div>
  );
}
