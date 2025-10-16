// components/Button.tsx
"use client";
import React from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void;
}

export default function Button({ text, onClick }: ButtonProps) {
  return (
    <button
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
      onClick={onClick}
    >
      {text}
    </button>
  );
}
