'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/app/hooks/useAuth'
import React from 'react'

export default function RegisterSuccess() {
  
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push('/dashboard/creator')
    }
  }, [user, router])
  return (
    <div className="flex flex-col items-center justify-center min-w-full min-h-screen bg-gray-100 text-black">
      <h1 className="text-4xl font-bold mb-4">Success</h1>
      <p className="text-lg mb-2">Your application has been submitted successfully.</p>
      <p className="text-lg">Confirm your email to continue.</p>
    </div>
  )
}
