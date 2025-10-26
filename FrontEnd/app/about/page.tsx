"use client";

import React, { useEffect, useRef } from "react";
import '../globals.css'
import StaggeredMenu from '../../components/StaggeredMenu';
import PageTransition from '../../components/PageTransition';
import RotatingCarousel from '../../components/RotatingCarousel';
import CardSwap, { Card } from '../../components/CardSwap';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function About() {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardSectionRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [isCardSectionVisible, setIsCardSectionVisible] = React.useState(true);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    const refs = [heroRef, featuresRef, ctaRef];
    refs.forEach(ref => {
      if (ref.current) {
        ref.current.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700');
        observer.observe(ref.current);
      }
    });

    // Observer for card section visibility
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsCardSectionVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );

    if (cardSectionRef.current) {
      cardObserver.observe(cardSectionRef.current);
    }

    return () => {
      observer.disconnect();
      cardObserver.disconnect();
    };
  }, []);

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

  return (
    <PageTransition>
      <main className="relative flex flex-col min-h-screen bg-gray-900 text-white overflow-auto">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)] z-0 pointer-events-none" />
        
        {/* Staggered Menu */}
        <div className="absolute top-0 left-0 z-50">
          <div style={{ height: '100vh', background: 'transparent' }}>
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

        {/* Page content */}
        <div className="relative z-10 flex flex-col w-full pt-32 pb-20 px-12 max-w-7xl mx-auto">
          
          {/* ============ SECTION 1: HERO + MISSION ============ */}
          <div ref={heroRef} className="w-full mb-12 transition-all duration-700">
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
                  We're a team of Northeastern students who believe that finding the perfect place to study 
                  shouldn't be a challenge—it should be effortless.
                </Text>
                <Text fontSize="2xl" color="gray.300" lineHeight="tall" textAlign="center">
                  Our platform provides real-time information about study spaces across campus, helping you 
                  make informed decisions about where to study, collaborate, and succeed. Whether you need 
                  a quiet corner for focused work or a collaborative space for group projects, we've got you covered.
                </Text>
              </Box>
            </Box>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900/30 to-transparent mb-4" />

          {/* ============ SECTION 2: STUDY SPACES ============ */}
          <div ref={cardSectionRef} className="w-full relative transition-all duration-300" style={{ minHeight: '850px', paddingBottom: '75px', marginBottom: '80px' }}>
            {/* Two Column Layout */}
            <div className="grid grid-cols-5 gap-12 pt-8" style={{ minHeight: '750px' }}>
              {/* Left Side Text - Takes 2 columns */}
              <div className="col-span-2 space-y-6 pr-8 mt-8 self-start">
                <div className="space-y-4">
                  <Heading size="6xl" color="white" fontWeight="black" lineHeight="1.1">
                    Study spaces have never looked so good
                  </Heading>
                  <Text fontSize="3xl" color="gray.400" fontWeight="light">
                    Just look at them!
                  </Text>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-white flex-shrink-0" />
                    <Text fontSize="xl" color="gray.300" fontWeight="medium">Modern & collaborative spaces</Text>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-white flex-shrink-0" />
                    <Text fontSize="xl" color="gray.300" fontWeight="medium">Real-time availability tracking</Text>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-white flex-shrink-0" />
                    <Text fontSize="xl" color="gray.300" fontWeight="medium">Premium amenities included</Text>
                  </div>
                </div>
              </div>

              {/* Right Side Card Swap - Takes 3 columns */}
              <div className="col-span-3 relative w-full transition-all duration-500" style={{ minHeight: '800px' }}>
                <div className="absolute left-0 w-full" style={{ top: '480px' }}>
                  {isCardSectionVisible && (
                    <CardSwap
                      width={600}
                      height={500}
                      cardDistance={80}
                      verticalDistance={60}
                      delay={3000}
                      pauseOnHover={true}
                      skewAmount={-4}
                      easing="elastic"
                    >
                <Card>
                  <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60"
                      style={{ backgroundImage: "url(https://www.dimellashaffer.com/wp-content/uploads/2017/08/DS_Northeastern_EastVillage_30_v1_current-e1581529655701.jpg?w=1200&h=800&fit=crop)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-white">East Village</h3>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        Modern study lounges with floor-to-ceiling windows, collaborative spaces, and 24/7 access.
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60"
                      style={{ backgroundImage: "url(https://janeyco.com/wp-content/uploads/2019/05/international-village-3.jpg?w=1200&h=800&fit=crop)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-white">International Village</h3>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        Spacious common areas perfect for group projects, quiet study rooms, and stunning city views.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60"
                      style={{ backgroundImage: "url(https://coe.northeastern.edu/wp-content/uploads/facilities-isec.jpg?w=1200&h=800&fit=crop)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-white">Northeastern University Interdisciplinary Science and Engineering Complex</h3>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        The heart of campus studying with multiple floors, private rooms, and extensive resources.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60"
                      style={{ backgroundImage: "url(https://commodorebuilders.com/wp-content/uploads/2020/10/MG_5981.jpg?w=1200&h=800&fit=crop)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-white">Chirchill Hall</h3>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        Flexible seating, study pods, café access, and a vibrant atmosphere for productivity.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60"
                      style={{ backgroundImage: "url(https://cos.northeastern.edu/wp-content/uploads/2025/05/DSC03529.jpg?w=1200&h=800&fit=crop)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-white">Richards Hall</h3>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        Quiet study zones near fitness facilities for those who balance work and wellness.
                      </p>
                    </div>
                  </div>
                </Card>
                    </CardSwap>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900/30 to-transparent mb-20" />

          {/* ============ SECTION 3: STUDENT REVIEWS ============ */}
          <div ref={featuresRef} className="w-full mb-24 py-8 transition-all duration-700">
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
              cards={[
                {
                  icon: "👨‍💻",
                  title: "Jackson",
                  description: "EMPTY NEU has completely changed how I study on campus. No more wasting time searching for open spots in Snell Library—I can check availability before I even leave my dorm!"
                },
                {
                  icon: "👨‍🎓",
                  title: "Ayaan",
                  description: "As someone who prefers quiet study spaces, this app is a lifesaver. I can filter by noise level and find the perfect spot every time. Absolutely game-changing for finals week."
                },
                {
                  icon: "👨‍💼",
                  title: "Matt",
                  description: "The real-time updates are incredibly accurate. I've been using EMPTY NEU for group projects, and it's so much easier to coordinate meeting spots with my team. Highly recommend!"
                },
                {
                  icon: "👨‍🔬",
                  title: "Mason",
                  description: "I love how easy it is to discover new study spots I didn't even know existed. The interface is super clean and intuitive—best campus app I've used at NEU!"
                },
                {
                  icon: "👨‍🏫",
                  title: "Andy",
                  description: "Between classes, finding a quick study spot used to be impossible. Now I can check EMPTY NEU and know exactly where to go. It's saved me so much time and stress this semester!"
                }
              ]}
              autoRotate={true}
              rotationSpeed={4000}
            />
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900/30 to-transparent mb-20" />

          {/* ============ SECTION 4: CALL TO ACTION ============ */}
          <div ref={ctaRef} className="w-full mb-20 py-12 transition-all duration-700">
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
                Join hundreds of Northeastern students who've already discovered their perfect study space.
              </Text>
              <Text fontSize="xl" color="gray.400" mb={8} maxW="2xl" mx="auto">
                Experience the convenience of real-time availability, smart filtering, and community-driven updates. 
                Start studying smarter, not harder—find your ideal study environment in seconds.
              </Text>
              <a href="/study">
                <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-5 px-12 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 text-xl shadow-2xl">
                  Explore Study Spaces →
                </button>
              </a>
              <Text fontSize="sm" color="gray.500" mt={5} fontWeight="medium">
              </Text>
            </Box>
        </div>
      </div>
    </main>
    </PageTransition>
  );
}
