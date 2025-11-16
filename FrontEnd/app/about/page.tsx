"use client";

import '../globals.css'
import React, { useEffect, useRef } from "react";
import PageTransition from '../../components/PageTransition';
import CardSwap, { Card } from '../../components/CardSwap';
import { Text, Heading } from '@chakra-ui/react';
import SideBar from '@/components/SideBar';
import MoveTo from '@/hooks/useRedirect';
import MissionSection from '@/components/MissionSection';
import CTASection from '@/components/CTASection';
import TestimonialsSection from '@/components/TestimonialsSection';

export default function About() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const cardSectionRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [isCardSectionVisible, setIsCardSectionVisible] = React.useState(true);
  const { handleRedirect } = MoveTo({ LoginPush: "/study" });

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    const refs = [heroRef, featuresRef, ctaRef];
    refs.forEach(ref => {
      if(ref.current) {
        ref.current.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700');
        observer.observe(ref.current);
      }
    });

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsCardSectionVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );

    if(cardSectionRef.current) {
      cardObserver.observe(cardSectionRef.current);
    }

    return () => {
      observer.disconnect();
      cardObserver.disconnect();
    };
  }, []);

  return (
    <PageTransition>
      <main className="relative flex flex-col min-h-screen bg-gray-900 text-white overflow-auto">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-linear-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)] z-0 pointer-events-none" />
        <SideBar/>

        {/* Page content */}
        <div className="relative z-10 flex flex-col w-full pt-32 pb-20 px-12 max-w-7xl mx-auto">
          
          {/* SECTION 1: MISSION */}
          <MissionSection ref={heroRef} />

          <div className="w-full h-px bg-linear-to-r from-transparent via-red-900/30 to-transparent mb-4" />

          {/* SECTION 2: STUDY SPACES */}
          <div ref={cardSectionRef} className="w-full relative transition-all duration-300" style={{ minHeight: '850px', paddingBottom: '75px', marginBottom: '20px' }}>
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
                    <div className="w-3 h-3 rounded-full bg-white shrink-0" />
                    <Text fontSize="xl" color="gray.300" fontWeight="medium">Modern & collaborative spaces</Text>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-white shrink-0" />
                    <Text fontSize="xl" color="gray.300" fontWeight="medium">Real-time availability tracking</Text>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-white shrink-0" />
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
                  <div className="w-full h-full relative overflow-hidden bg-linear-to-br from-gray-900 to-gray-800">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60"
                      style={{ backgroundImage: "url(https://www.dimellashaffer.com/wp-content/uploads/2017/08/DS_Northeastern_EastVillage_30_v1_current-e1581529655701.jpg?w=1200&h=800&fit=crop)" }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-white">East Village</h3>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        Spacious classrooms in the basement of EV, perfect for a small group get together. 
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <div className="w-full h-full relative overflow-hidden bg-linear-to-br from-gray-900 to-gray-800">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60"
                      style={{ backgroundImage: "url(https://janeyco.com/wp-content/uploads/2019/05/international-village-3.jpg?w=1200&h=800&fit=crop)" }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-white">International Village</h3>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        Spacious classrooms for group study sessions or quiet lone lock in sessions.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="w-full h-full relative overflow-hidden bg-linear-to-br from-gray-900 to-gray-800">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60"
                      style={{ backgroundImage: "url(https://coe.northeastern.edu/wp-content/uploads/facilities-isec.jpg?w=1200&h=800&fit=crop)" }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-white">Northeastern University Interdisciplinary Science and Engineering Complex</h3>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        ISEC is a great building for studying with classrooms on multiple floors and a quiet environment!
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="w-full h-full relative overflow-hidden bg-linear-to-br from-gray-900 to-gray-800">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60"
                      style={{ backgroundImage: "url(https://commodorebuilders.com/wp-content/uploads/2020/10/MG_5981.jpg?w=1200&h=800&fit=crop)" }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-white">Churchill Hall</h3>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        Flexible seating, large rooms, perfect for a group study session!
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="w-full h-full relative overflow-hidden bg-linear-to-br from-gray-900 to-gray-800">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60"
                      style={{ backgroundImage: "url(https://cos.northeastern.edu/wp-content/uploads/2025/05/DSC03529.jpg?w=1200&h=800&fit=crop)" }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-white">Richards Hall</h3>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        Study zone right near Krentzman Quad. Ideal for a nearby study location!
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
          <div className="w-full h-px bg-linear-to-r from-transparent via-red-900/30 to-transparent mb-8" />

          {/* SECTION 3: TESTIMONIALS */}
          <TestimonialsSection ref={featuresRef} />

          {/* SECTION 4: CTA */}
          <CTASection ref={ctaRef} onButtonClick={handleRedirect} />
        </div>
      </main>
    </PageTransition>
  );
}
