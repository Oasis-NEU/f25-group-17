import React from 'react';
import { Text, Heading } from '@chakra-ui/react';
import RotatingCarousel from '@/components/RotatingCarousel';
import { TESTIMONIALS } from '@/app/about/constants';

interface TestimonialsSectionProps {
  ref?: React.RefObject<HTMLDivElement | null>;
}

export default function TestimonialsSection({ ref }: TestimonialsSectionProps) {
  return (
    <>
      <div ref={ref} className="w-full mb-24 pt-8 transition-all duration-700">
        <div className="text-center mb-12">
          <Text fontSize="md" color="red.400" fontWeight="bold" letterSpacing="widest" mb={4} textTransform="uppercase">
            TESTIMONIALS
          </Text>
          <Heading size="5xl" mb={4} color="white" fontWeight="black">
            What Students Are Saying
          </Heading>
          <Text fontSize="xl" color="gray.400" maxW="2xl" mx="auto">
            Real feedback from Northeastern students who use EMPTY NEU every day.
          </Text>
        </div>
        <RotatingCarousel
          cards={TESTIMONIALS}
          autoRotate={true}
          rotationSpeed={4000}
        />
      </div>

      <div className="w-full h-px bg-linear-to-r from-transparent via-red-900/30 to-transparent mb-20" />
    </>
  );
}
