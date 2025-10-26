"use client";

import React from "react";
import '../globals.css'
import {Input} from '@chakra-ui/react'
import Button from '../../components/button'
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter()

  return (
    <main className="flex flex-col items-center justify-start bg-gray-900 m-0 p-0">
      <div className="w-screen h-screen flex items-center justify-center 
          bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)]">
        <div className="flex flex-col items-center justify-start h-[35rem] w-full pt-[8rem] gap-6">
          <h1 className="text-6xl font-bold text-white [text-shadow:2px_2px_8px_rgba(0,0,0,0.6)]">
            Register
          </h1>
          <h2 className="flex flex-col text-xl text-white px-4 text-center [text-shadow:1px_1px_4px_rgba(0,0,0,0.6)] gap-6 w-256">
            <Input placeholder="Enter a Username"/>
            <Input placeholder="Enter a Password"/>
            <Input placeholder="Re-Enter the Password"/>
            <Input placeholder="Enter Your Major"/>
          </h2>
            <Button text='Register' onClick={() => router.push('/login')}/>
          <div className="absolute top-0 left-0 ">
            <div style={{ height: '100vh', background: '#1a1a1a' }}>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}