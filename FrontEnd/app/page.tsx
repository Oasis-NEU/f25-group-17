"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase/lib/supabase";
import Button from "@/components/button";
import PageTransition from "@/components/PageTransition";
import TypeWriter from "@/components/TypeWriter";
import "./globals.css";
import Orb from "@/components/Orb"

export default function Home() {
  const router = useRouter();

  // Handle Find Now button click with auth check
  const handleFindNow = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        router.push("/login");
        return;
      }
      
      // User is authenticated, redirect to about
      router.push('/about');
    } catch (err) {
      console.error('Unexpected error:', err);
      router.push("/login");
    }
  };

  return (
    <PageTransition>
      <main className="flex flex-col h-screen w-screen items-center justify-center bg-gray-900 m-0 p-0 overflow-hidden">
        <div className="relative w-screen h-screen flex items-center justify-center 
            bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)]">
          {/* Background Orb */}
          <div className="absolute inset h-screen w-screen flex items-center justify-center translate-x-0 z-0">
            <div className="h-screen w-screen" >
              <Orb
                hoverIntensity={0}
                rotateOnHover={false}
                hue={10}
              />
            </div>
          </div>

                          {/* A little gift from your favorite programmer Jackson You get this goofy ahh div structure */}
                          {/* Floating particles effect (stars) */}
                          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                            {[...Array(60)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-2 h-2 bg-red-500/40 rounded-full animate-float"
                                style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                  animationDelay: `${Math.random() * 5}s`,
                                  animationDuration: `${5 + Math.random() * 10}s`
                                }}
                              />
                            ))}
                          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-7xl font-black text-white [text-shadow:0_0_60px_rgba(255,255,255,0.3),_2px_2px_12px_rgba(0,0,0,0.8)] animate-fadeIn tracking-tight">
              EMPTY NEU
            </h1>
            <h2 className="text-xl text-white px-4 [text-shadow:2px_2px_8px_rgba(0,0,0,0.6)] min-h-[60px] flex items-center justify-center">
              <TypeWriter
                texts={[
                  "Find open study spaces on campus fast, simple, and live.",
                  "Discover the best places to study on campus.",
                  "Real-time availability for every study spot.",
                  "Never waste time searching for space again."
                ]}
                typingSpeed={50}
                deletingSpeed={80}
                pauseDuration={200}
              />
            </h2>
                    <div className="pt-6">
                      <Button text="Find Now" onClick={handleFindNow} />
                    </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
