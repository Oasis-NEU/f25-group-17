"use client";

import React from "react";
import '../globals.css'
import StaggeredMenu from '../../components/StaggeredMenu';
import Carousel from '../../components/Carousel'

export default function about() {
  const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
  { label: 'Study', ariaLabel: 'View our services', link: '/study' },
  { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
  ];

  const socialItems = [
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
  ];

  return (
    <main className="flex flex-col items-center justify-start bg-gray-900 m-0 p-0">
      <div className="w-screen h-screen flex items-center justify-center 
          bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)]">
        <div className="flex flex-col items-center justify-start h-[35rem] w-full pt-[8rem] gap-6">
          <div style={{ height: '800px', position: 'relative' }}>
            <Carousel
                baseWidth={900}
                autoplay={true}
                autoplayDelay={3000}
                pauseOnHover={true}
                loop={true}
                round={false}
            />
            </div>
          <div className="absolute top-0 left-0 ">
            <div style={{ height: '100vh', background: '#1a1a1a' }}>
              <StaggeredMenu
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
                onMenuOpen={() => console.log('Menu opened')}
                onMenuClose={() => console.log('Menu closed')}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}