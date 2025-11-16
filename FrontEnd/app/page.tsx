"use client";

import React from "react";
import Button from "@/components/button";
import PageTransition from "@/components/PageTransition";
import TypeWriter from "@/components/TypeWriter";
import PageBackground from "@/components/PageBackground";
import Orb from "@/components/Orb"
import MoveTo from "@/hooks/Redirect";
import "./globals.css";

export default function Home() {
  const { handleFindNow } = MoveTo({ LoginPush: "/about" });

  return (
    <PageTransition>
      <PageBackground>
        {/* Background Orb */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <Orb
            hoverIntensity={0}
            rotateOnHover={false}
            hue={10}
          />
        </div>

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
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-7xl font-black text-white [text-shadow:0_0_60px_rgba(255,255,255,0.3),2px_2px_12px_rgba(0,0,0,0.8)] animate-fadeIn tracking-tight">
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
      </PageBackground>
    </PageTransition>
  );
}
