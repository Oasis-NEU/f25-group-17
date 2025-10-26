"use client";

import React from "react";
import '../globals.css'
import {Input} from '@chakra-ui/react'
import Button from '../../components/button'
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter()

  return (
    <main className="flex flex-col items-center justify-start bg-gray-900 m-0 p-0">
      <div className="w-screen h-screen flex items-center justify-center 
          bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)]">
        <div className="flex flex-col items-center justify-start h-[35rem] w-full pt-[8rem] gap-6">
          <h1 className="text-6xl font-bold text-white [text-shadow:2px_2px_8px_rgba(0,0,0,0.6)]">
            Login Page
          </h1>
          <h2 className="text-xl text-white px-4 text-center [text-shadow:1px_1px_4px_rgba(0,0,0,0.6)]">
            <Input placeholder="Enter Your Username"/>
          </h2>
          <h1>
            <Input placeholder="Enter Your Password"/>
          </h1>
            <Button text='Sign In' onClick={() => router.push('/study')}/>
          <div className="absolute top-0 left-0 ">
            <div style={{ height: '100vh', background: '#1a1a1a' }}>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}