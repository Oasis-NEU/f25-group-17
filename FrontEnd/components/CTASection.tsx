import { Box, Heading, Text } from '@chakra-ui/react';

interface CTASectionProps {
  ref?: React.RefObject<HTMLDivElement | null>;
  onButtonClick: () => void;
}

export default function CTASection({ ref, onButtonClick }: CTASectionProps) {
  return (
    <div ref={ref} className="w-full mb-20 py-12 transition-all duration-700">
      <Box 
        textAlign="center" 
        p={10} 
        bg="rgba(17, 24, 39, 0.95)" 
        rounded="3xl" 
        border="3px solid rgba(220,20,60,0.5)" 
        shadow="2xl" 
        maxW="4xl" 
        mx="auto"
        transition="all 0.3s ease"
        _hover={{ 
          borderColor: "rgba(220,20,60,0.7)",
          transform: "scale(1.02)",
          shadow: "dark-lg"
        }}
      >
        <Text fontSize="md" color="red.400" fontWeight="bold" letterSpacing="widest" mb={4} textTransform="uppercase">
          GET STARTED
        </Text>
        <Heading size="5xl" mb={6} color="white" fontWeight="black">Ready to Find Your Spot?</Heading>
        <Text fontSize="2xl" color="gray.300" mb={4} fontWeight="medium">
          Join hundreds of Northeastern students who&apos;ve already discovered their perfect study space.
        </Text>
        <Text fontSize="xl" color="gray.400" mb={8} maxW="2xl" mx="auto">
          Experience the convenience of real-time availability, smart filtering, and community-driven updates. 
          Start studying smarter, not harder—find your ideal study environment in seconds.
        </Text>
        <button 
          onClick={onButtonClick}
          className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-5 px-12 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 active:shadow-inner text-xl shadow-2xl"
        >
          Explore Study Spaces →
        </button>
      </Box>
    </div>
  );
}
