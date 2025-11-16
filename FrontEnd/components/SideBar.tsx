"use client"

import React from "react";
import StaggeredMenu from "../components/StaggeredMenu";

export default function SideBar(){
  const menuItems = [
    { label: "Home", ariaLabel: "Go to home page", link: "/" },
    { label: "About", ariaLabel: "Learn about us", link: "/about" },
    { label: "Study", ariaLabel: "View our services", link: "/study" },
    { label: "Profile", ariaLabel: "View your profile", link: "/profile" },
  ];

  return (
    <div className="fixed top-0 left-0 z-50">
      <div style={{ height: '100vh', background: '#1a1a1a' }}>
        <StaggeredMenu
          items={menuItems}
          isFixed={false}
          position="left"
          displayItemNumbering={true}
          menuButtonColor="#fff"
          openMenuButtonColor="#fff"
          changeMenuColorOnOpen={true}
          colors={["#FF0000", "#FF8A8A"]}
          logoUrl="https://www.svgrepo.com/show/499592/close-x.svg"
          accentColor="#ff6b6b"
        />
      </div>
    </div>
  );
}
