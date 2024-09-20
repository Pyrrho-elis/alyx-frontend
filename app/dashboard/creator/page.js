'use client'
import React from 'react'
import { useUser } from '@/app/hooks/useUser'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreatorDashboard() {
  const { user, loading, logout } = useUser()
  const router = useRouter()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null // or a loading indicator
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen gap-4'>
      <h1 className='text-4xl font-bold'>Creator Dashboard</h1>
      <div className='flex flex-col items-center justify-center gap-4'>
        <p className='text-2xl font-bold'>Email: {user.email}</p>
        <p className='text-2xl font-bold'>Creator Name: {user.user_metadata.creator_name}</p>
        <p className='text-2xl font-bold'>Account Number: {user.user_metadata.acc_no}</p>
        <p className='text-2xl font-bold'>Telegram Group Username: {user.user_metadata.telegram_group_username}</p>
        <Link className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' href="/dashboard/creator/preview">Preview Page</Link>
        <Link className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' href="/dashboard/creator/editpage">Edit Page</Link>
      </div>
      <button onClick={handleLogout} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Logout</button>
    </div>
  )
}
