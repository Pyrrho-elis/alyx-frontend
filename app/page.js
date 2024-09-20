"use client"; // Add this line at the top
import useAuth from '@/app/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  // const { logout } = useAuth();
  const router = useRouter();

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-4xl font-bold'>Welcome to the Home Page</h1>
      <button className='bg-blue-500 text-white px-4 py-2 rounded-md mt-4' onClick={() => {
        router.push('/apply');
      }}>Apply to be a creator</button>
      <button className='bg-blue-500 text-white px-4 py-2 rounded-md mt-4' onClick={() => {
        router.push('/login');
      }}>Login</button>
      {/* <button className='bg-red-500 text-white px-4 py-2 rounded-md mt-4' onClick={logout}>
        Logout
      </button> */}
    </div>
  );
}
