'use client'
import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/hooks/useUser'

export default function page() {
  const { user } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  if (user) {
    router.push('/dashboard/creator')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password, type: 'login' })
    })
    const data = await response.json()
    if (data.error) {
      setError(data.error)
    } else {
      router.push('/dashboard/creator')
    }
  }
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-4xl font-bold'>Login</h1>
      <form className='flex flex-col items-center gap-4 justify-center' onSubmit={handleSubmit}>
        {error && <p className='text-red-500'>{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className='bg-blue-500 text-white px-4 py-2 rounded-md mt-4'>Login</button>
      </form>
    </div>
  )
}
