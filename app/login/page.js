'use client'
import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/hooks/useUser'
import { Loader2 } from 'lucide-react'
import CustomButton from '@/app/components/CustomButton'
import logo from '@/app/public/LOGO.png'

export default function LoginPage() {
  const { user } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (user) {
    router.push('/dashboard/creator')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      console.log('Attempting login...');
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, type: 'login' })
      })
      console.log('Response received:', response.status);
      const data = await response.json()
      console.log('Response data:', data);
      
      if (data.error) {
        setError(data.error)
      } else {
        router.push('/dashboard/creator')
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center gap-2 mb-8">
                <Image
                  src={logo}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
                <span className="text-xl font-bold bg-gradient-to-r from-black/90 to-primary bg-clip-text text-transparent">
                  SUBZZ
                </span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 shadow-sm">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-primary border-2 border-gray-300 rounded focus:ring-primary" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <CustomButton
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </CustomButton>
            </form>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/waitlist" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Join the waitlist
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
