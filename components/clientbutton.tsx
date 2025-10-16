// components/ClientButton.tsx
"use client";
import Button from "./button";

export default function ClientButton() {
  return <Button text="Find a Room" onClick={() => console.log("Clicked!")} />;
}
