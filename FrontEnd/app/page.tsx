"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import "./globals.css";
import Orb from "@/components/Orb";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex flex-col h-screen w-screen items-center justify-center bg-gray-900 m-0 p-0 overflow-hidden">
      <div className="relative w-screen h-screen flex items-center justify-center 
          bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)]">
        <div className="absolute inset h-screen w-screen flex items-center justify-center translate-x-0 z-0">
          <div className="h-screen w-screen" >
            <Orb
              hoverIntensity={0}
              rotateOnHover={false}
              hue={10}
              forceHoverState={true}
            />
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-6xl font-bold text-white [text-shadow:2px_2px_8px_rgba(0,0,0,0.6)] animate-fadeIn">
            EMPTY NEU
          </h1>
          <h2 className="text-xl text-white px-4 [text-shadow:2px_2px_8px_rgba(0,0,0,0.6)]">
            Find open study spaces on campus fast, simple, and live.
          </h2>
          <div className="pt-6">
            <Button text="Find Now" onClick={() => router.push("/study")} />
          </div>
        </div>
      </div>
    </main>
  );
}
