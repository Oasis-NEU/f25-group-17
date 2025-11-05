"use client";

import React, { useState, useEffect } from "react";
import '../globals.css'
import { Input } from '@chakra-ui/react'
import Button from '../../components/button'
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from '../../../supabase/lib/supabase'
import Script from "next/script";

const MAJORS = [
  "Accounting", "Architectural Studies", "Architecture", "Behavioral Neuroscience",
  "Biochemistry", "Biology", "Bioengineering", "Business Administration",
  "Chemical Engineering", "Chemistry", "Civil Engineering", "Communication Studies",
  "Computer Engineering", "Computer Science", "Criminal Justice", "Cybersecurity",
  "Data Science", "Economics", "Electrical Engineering", "English",
  "Environmental Engineering", "Environmental Science", "Finance", "Game Design",
  "Health Science", "History", "Human Services", "Industrial Engineering",
  "Information Science", "International Affairs", "Journalism", "Landscape Architecture",
  "Mathematics", "Mechanical Engineering", "Media Arts", "Music", "Nursing",
  "Pharmaceutical Sciences", "Philosophy", "Physics", "Political Science",
  "Psychology", "Public Health", "Sociology", "Theatre","International Business", "Undeclared"
];

const YEARS = [
  "Freshmen", "Sophmore", "Junior", "Senior", "Fifth Year", "Graduate Student"
]

export default function Signup() {
  const router = useRouter()
  
  // Form state
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    year: '',
    major: ''
  })
  
  // UI state
  const [majorSearch, setMajorSearch] = useState('')
  const [showMajorDropdown, setShowMajorDropdown] = useState(false)
  const [isSelectingFromDropdown, setIsSelectingFromDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [yearSearch, setYearSearch] = useState('')
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [isSelectingYear, setIsSelectingYear] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string>("");

  const filteredMajors = MAJORS.filter(major => 
    major.toLowerCase().includes(majorSearch.toLowerCase())
  )

  const filteredYears = YEARS.filter(year => 
  year.toLowerCase().includes(yearSearch.toLowerCase())
  )

  const handleMajorSelect = (major: string) => {
    setIsSelectingFromDropdown(true)
    setMajorSearch(major)
    setFormData(prev => ({ ...prev, major }))
    setShowMajorDropdown(false)
  }

  const handleMajorFocus = () => {
    setMajorSearch('')
    setFormData(prev => ({ ...prev, major: '' }))
    setShowMajorDropdown(true)
    setIsSelectingFromDropdown(false)
  }

  const handleMajorBlur = () => {
    setTimeout(() => {
      if (!isSelectingFromDropdown && majorSearch && filteredMajors.length > 0 && majorSearch !== formData.major) {
        setMajorSearch(filteredMajors[0])
        setFormData(prev => ({ ...prev, major: filteredMajors[0] }))
      }
      setShowMajorDropdown(false)
      setIsSelectingFromDropdown(false)
    }, 150)
  }

    const handleYearSelect = (year: string) => {
    setIsSelectingYear(true)
    setYearSearch(year)
    setFormData(prev => ({ ...prev, year }))
    setShowYearDropdown(false)
  }

  const handleYearFocus = () => {
    setYearSearch('')
    setFormData(prev => ({ ...prev, year: '' }))
    setShowYearDropdown(true)
    setIsSelectingYear(false)
  }

  const handleYearBlur = () => {
    setTimeout(() => {
      if (!isSelectingYear && yearSearch && filteredYears.length > 0 && yearSearch !== formData.year) {
        setYearSearch(filteredYears[0])
        setFormData(prev => ({ ...prev, year: filteredYears[0] }))
      }
      setShowYearDropdown(false)
      setIsSelectingYear(false)
    }, 150)
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.firstname.trim()) {
      newErrors.username = 'First name is required'
    }

    if (!formData.lastname.trim()) {
      newErrors.username = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.year) {
      newErrors.year = 'Please select your year'
    }

    if (!formData.major) {
      newErrors.major = 'Please select your major'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    // @ts-ignore
    window.onTurnstileLoad = () => {
      // @ts-ignore
      window.turnstile.render('#turnstile-widget', {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          setCaptchaToken(token);
        },
      });
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    if (!captchaToken) {
      setError("Please complete the captcha verification");
      return;
    }

    setIsLoading(true)

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        //options: { captchaToken, },
      });

      if (authError) {
        if (authError.message.includes('already registered') || 
            authError.message.includes('already exists') ||
            authError.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please use a different email or try logging in.')
        }
        throw authError
      }

      if (authData.user) {
        // Check if user was actually created
        if (authData.user.identities && authData.user.identities.length === 0) {
          throw new Error('This email is already registered. Please use a different email or try logging in.')
        }

        // Insert user data into UserData table
        console.log('Attempting to insert user data:', {
          firstName: formData.firstname,
          lastName: formData.lastname,
          email: formData.email,
          major: formData.major,
          year: formData.year,
          user_id: authData.user.id,
        });

        const { data: insertedData, error: userError } = await supabase
          .from("UserData")
          .insert([{
            firstName: formData.firstname,
            lastName: formData.lastname,
            email: formData.email,
            major: formData.major,
            year: formData.year,
            user_id: authData.user.id,
          }] as any)
          .select();

        if (userError) {
          console.error('Error inserting user data:', userError);
          setError(`Failed to store user profile: ${userError.message}`);
          return;
        }

        console.log('User data inserted successfully:', insertedData);
        alert('Account created successfully! Please check your email to verify your account.');
        router.push('/login');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during signup'
      setError(errorMessage)
      
      if (errorMessage.toLowerCase().includes('email') && 
          (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('registered'))) {
        setErrors(prev => ({ ...prev, email: 'This email is already in use' }))
      }
      
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.major-dropdown-container')) {
        setShowMajorDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <main className="flex flex-col items-center justify-center bg-gray-900 m-0 p-0 min-h-screen">
      <div className="w-screen min-h-screen flex items-center justify-center py-20 px-6
          bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.7)] to-[rgba(220,20,60,0.1)]">
        
        {/* Unique card with gradient border */}
        <div className="relative z-10 w-full max-w-2xl mx-auto p-[1px] rounded-3xl bg-gradient-to-br from-red-600/30 via-gray-700/20 to-red-900/30">
          <div className="relative bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 rounded-3xl p-12 backdrop-blur-sm shadow-[0_0_100px_rgba(15,23,42,0.8),0_0_50px_rgba(30,41,59,0.6),inset_0_0_60px_rgba(15,23,42,0.3)]">
            
            {/* Header with gradient accent */}
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full"></div>
              </div>
              <h1 className="text-5xl font-black text-white bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white mb-3">
                EmptyNEU
              </h1>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-red-400 to-gray-400 text-sm font-medium">
                Sign Up, Your study space awaits
              </p>
            </div>

            {/* Form with labels and inputs */}
            <div className="flex flex-col w-full gap-6">
              
              {/* First Name */}
              <div className="relative group">
                <label className="block text-red-400 text-sm font-semibold mb-2">
                  Name
                </label>
                <Input 
                  placeholder="Enter Your First Name" 
                  size="lg"
                  value={formData.firstname}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstname: e.target.value }))}
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
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1">{errors.username}</p>
                )}
              </div>
              
              {/* Last Name */}
              <div className="relative group">
                <label className="block text-red-400 text-sm font-semibold mb-2">
                  Name
                </label>
                <Input 
                  placeholder="Enter Your Last Name" 
                  size="lg"
                  value={formData.lastname}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastname: e.target.value }))}
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
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div className="relative group">
                <label className="block text-red-400 text-sm font-semibold mb-2">
                  Email
                </label>
                <Input 
                  placeholder="Enter your email" 
                  type="email" 
                  size="lg"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }))
                    // Clear email error when user starts typing
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: '' }))
                    }
                    if (error && error.toLowerCase().includes('email')) {
                      setError('')
                    }
                  }}
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
              
              {/* Password */}
              <div className="relative group">
                <label className="block text-red-400 text-sm font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input 
                    placeholder="Enter your password" 
                    type={showPassword ? "text" : "password"}
                    size="lg"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              
              {/* Retype Password */}
              <div className="relative group">
                <label className="block text-red-400 text-sm font-semibold mb-2">
                  Retype Password
                </label>
                <div className="relative">
                  <Input 
                    placeholder="Confirm your password" 
                    type={showConfirmPassword ? "text" : "password"}
                    size="lg"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
              
              {/* Year */}
              <div className="relative group year-dropdown-container">
                <label className="block text-red-400 text-sm font-semibold mb-2">
                  Year
                </label>
                <Input 
                  placeholder="Search your year" 
                  size="lg"
                  value={yearSearch}
                  onChange={(e) => setYearSearch(e.target.value)}
                  onFocus={handleYearFocus}
                  onBlur={handleYearBlur}
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

                {/* Dropdown list */}
                {showYearDropdown && filteredYears.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-gray-900/95 border border-red-600/30 rounded-lg shadow-[0_0_30px_rgba(220,20,60,0.2)] backdrop-blur-md">
                    {filteredYears.map((year) => (
                      <div
                        key={year}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleYearSelect(year)
                        }}
                        className="px-4 py-3 text-white hover:bg-red-600/20 cursor-pointer transition-colors border-b border-gray-800/50 last:border-b-0"
                      >
                        {year}
                      </div>
                    ))}
                  </div>
                )}
                {errors.year && (
                  <p className="text-red-400 text-xs mt-1">{errors.year}</p>
                )}
              </div>            
              
              {/* Major */}
              <div className="relative group major-dropdown-container">
                <label className="block text-red-400 text-sm font-semibold mb-2">
                  Major
                </label>
                <Input 
                  placeholder="Search your major" 
                  size="lg"
                  value={majorSearch}
                  onChange={(e) => setMajorSearch(e.target.value)}
                  onFocus={handleMajorFocus}
                  onBlur={handleMajorBlur}
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
                
                {/* Dropdown list */}
                {showMajorDropdown && filteredMajors.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-gray-900/95 border border-red-600/30 rounded-lg shadow-[0_0_30px_rgba(220,20,60,0.2)] backdrop-blur-md">
                    {filteredMajors.map((major) => (
                      <div
                        key={major}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleMajorSelect(major)
                        }}
                        className="px-4 py-3 text-white hover:bg-red-600/20 cursor-pointer transition-colors border-b border-gray-800/50 last:border-b-0"
                      >
                        {major}
                      </div>
                    ))}
                  </div>
                )}
                {errors.major && (
                  <p className="text-red-400 text-xs mt-1">{errors.major}</p>
                )}
              </div>

              {
              // CURRENTLY WORKING ON THIS
              <div>
                  <label className="block text-red-400 text-sm font-semibold mb-2">
                    Courses
                  </label>

                  <Link href="/onboarding/courses">
                    <div
                      className="
                        w-full h-12 rounded-md bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 flex items-center justify-center text-gray-300 font-semibold tracking-wide cursor-pointer transition-all hover:border-red-500/70 hover:text-white hover:bg-gray-900/70 backdrop-blur-sm
                      "
                    >
                      Add Course
                    </div>
                  </Link>
              </div>}
            </div>

            {/* Cloudflare Turnstile Captcha */}
            <div className="flex justify-center items-center mt-12 mb-6">
              <div 
                id="turnstile-widget" 
                style={{ transform: 'scale(1.5)', transformOrigin: 'center' }}
              ></div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Divider */}
            <div className="my-8 w-full h-[1px] bg-gradient-to-r from-transparent via-red-900/40 to-transparent"></div>

            {/* Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Join EMPTY NEU'}
              </button>
            </div>

            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Already part of the community?{' '}
                <Link href="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 font-semibold hover:from-red-300 hover:to-red-500 transition-all">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 ">
          <div style={{ height: '100vh', background: '#1a1a1a' }}>
          </div>
        </div>

        {/* Turnstile script */}
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          onLoad={() => {
            // @ts-ignore
            if (window.onTurnstileLoad) window.onTurnstileLoad();
          }}
        />
      </div>
    </main>
  );
}