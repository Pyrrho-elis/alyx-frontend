'use client'
import React, { useState } from 'react'
import { useUser } from '@/app/hooks/useUser'
import { useRouter } from 'next/navigation'
import { LoadingSkeleton } from '@/app/components/LoadingSkeleton'

export default function CreatorDashboard() {
  const { user, loading, logout } = useUser()
  const router = useRouter()

  if (loading) {
    return <div className='flex flex-col justify-center'><LoadingSkeleton /></div>
  }

  if (!user) {
    return null // or a loading indicator
  } else {
    router.push('/dashboard/creator/editpage')
  }

  const handleLogout = async () => {
    await logout()
  }


  // return (
  //   <div className='flex flex-col items-center justify-center h-screen gap-4 px-4'>
  //     <h1 className='text-4xl font-bold'>Creator Dashboard</h1>
  //     <div className='flex flex-col items-center justify-center gap-4'>
  //       <p className='text-2xl font-bold'>Email: {user.email}</p>
  //       <p className='text-2xl font-bold'>Creator Name: {user.user_metadata.creator_name}</p>
  //       <p className='text-2xl font-bold'>Account Number: {user.user_metadata.acc_no}</p>
  //       <p className='text-2xl font-bold'>Telegram Group Username: {user.user_metadata.telegram_group_username}</p>
  //       <Link className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' href="/dashboard/creator/preview">Preview Page</Link>
  //       <Link className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' href="/dashboard/creator/editpage">Edit Page</Link>
  //     </div>
  //     <button onClick={handleLogout} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Logout</button>
  //     <Button variant="ghost" size="icon">
  //       <Menu className="h-6 w-6" />
  //       <span className="sr-only">Open menu</span>
  //     </Button>
  //     <div className="relative md:hidden">
  //       <Sheet open={isOpen} onOpenChange={setIsOpen}>
  //         <SheetTrigger asChild>
  //           <Button variant="ghost" size="icon">
  //             <Menu className="h-6 w-6" />
  //             <span className="sr-only">Open menu</span>
  //           </Button>
  //         </SheetTrigger>
  //         <SheetContent side="right" className="w-[300px] sm:w-[400px]">
  //           <nav className="flex flex-col space-y-4">
  //             <Link href="#features" className="text-lg font-semibold" onClick={() => setIsOpen(false)}>
  //               Features
  //             </Link>
  //             <Link href="#pricing" className="text-lg font-semibold" onClick={() => setIsOpen(false)}>
  //               Pricing
  //             </Link>
  //             <hr className="my-4" />
  //             <Link href="/login" className="justify-start" onClick={() => setIsOpen(false)}>
  //               <Button variant="ghost" className="justify-start" onClick={() => setIsOpen(false)}>
  //                 Sign In
  //               </Button>
  //             </Link>
  //             <Link href="/apply" className="justify-start" onClick={() => setIsOpen(false)}>
  //               <Button className="justify-start" onClick={() => setIsOpen(false)}>
  //                 Get Started for Free
  //               </Button>
  //             </Link>
  //           </nav>
  //         </SheetContent>
  //       </Sheet>
  //     </div>
  //   </div>
  // )
}
