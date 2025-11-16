"use client";

import React from "react";
import PageTransition from "@/components/PageTransition";
import PageBackground from "../components/PageBackground";
import HeroOrb from "@/components/HeroOrb";
import FloatingParticles from "@/components/FloatingParticles";
import HeroContent from "@/components/HeroContent";
import MoveTo from "@/ReactHook/redirect";
import "./globals.css";

export default function Home() {
  const { handleRedirect } = MoveTo({ LoginPush: "/about" });

  return (
    <PageTransition>
      <PageBackground>
        <HeroOrb />
        <FloatingParticles count={60} />
        <HeroContent onButtonClick={handleRedirect} />
      </PageBackground>
    </PageTransition>
  );
}
