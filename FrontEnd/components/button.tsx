"use client";

import React from "react";

type ButtonProps = {
  text: string;
  onClick?: () => void;
}

export default function Button({ text, onClick}: ButtonProps) {
  return (
    <button
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95"
      onClick={onClick}
    >
      {text}
    </button>
  );
}
