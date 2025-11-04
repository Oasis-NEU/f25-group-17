"use client";

import React, { useState } from "react";
import '../globals.css'
import { Input } from '@chakra-ui/react'
import Button from '../../components/button'
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    setError('')
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // For now, just simulate login and redirect
      // You can add Supabase auth later
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/study')
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during login'
      setError(errorMessage)
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center bg-gray-900 m-0 p-0 min-h-screen">
      <div className="w-screen min-h-screen flex items-center justify-center py-20 px-6
          bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)]">
        
        {/* Card with gradient border */}
        <div className="relative z-10 w-full max-w-2xl mx-auto p-[1px] rounded-3xl bg-gradient-to-br from-red-600/30 via-gray-700/20 to-red-900/30">
          <div className="relative bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 rounded-3xl p-12 backdrop-blur-sm shadow-[0_0_100px_rgba(15,23,42,0.8),0_0_50px_rgba(30,41,59,0.6),inset_0_0_60px_rgba(15,23,42,0.3)]">
            
            {/* Header with gradient accent */}
            <div className="text-center mb-10">
              <div className="inline-block mb-4">
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full"></div>
              </div>
              <h1 className="text-5xl font-black text-white bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white mb-3">
                EmptyNEU 
              </h1>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-red-400 to-gray-400 text-sm font-medium">
                Sign in to continue your journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="relative group">
                <label className="block text-red-400 text-sm font-semibold mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  size="lg"
                  className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 text-white placeholder:text-gray-500 transition-all backdrop-blur-sm"
                  _hover={{
                    borderColor: 'rgba(220,20,60,0.3)'
                  }}
                  _focus={{ 
                    borderColor: 'rgba(220,20,60,0.8)',
                    boxShadow: '0 0 20px rgba(220,20,60,0.2)',
                    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.8))'
                  }}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password field */}
              <div className="relative group">
                <label className="block text-red-400 text-sm font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    size="lg"
                    className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 text-white placeholder:text-gray-500 transition-all backdrop-blur-sm pr-12"
                    _hover={{
                      borderColor: 'rgba(220,20,60,0.3)'
                    }}
                    _focus={{ 
                      borderColor: 'rgba(220,20,60,0.8)',
                      boxShadow: '0 0 20px rgba(220,20,60,0.2)',
                      background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.8))'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-600/20 border border-red-600/50 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Divider */}
              <div className="my-6 w-full h-[1px] bg-gradient-to-r from-transparent via-red-900/40 to-transparent"></div>

              {/* Submit button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>

            {/* Sign up link */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account? {}
                <Link href="/signup" className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 font-semibold hover:from-red-300 hover:to-red-500 transition-all">
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Link to home */}
            <div className="mt-4 text-center">
              <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Background overlay */}
        <div className="absolute top-0 left-0 ">
          <div style={{ height: '100vh', background: '#1a1a1a' }}>
          </div>
        </div>
      </div>
    </main>
  );
}
