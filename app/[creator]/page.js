'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '../hooks/useUser';
import Link from 'next/link';

export default function page() {
  const { creator } = useParams();
  const [creatorData, setCreatorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validateUsername = (username) => {
    if (!username) throw 'Error: Username is required!'
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(username.toString()) || /\s/.test(username)) throw 'Error: Invalid Username! Username must be 3-16 characters long, contain only letters, numbers, and underscores, and have no spaces.'
    return username.toString()
  }

  const creatorUsername = validateUsername(creator)

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const response = await fetch(`/api/creator/${creatorUsername.toLowerCase()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch creator data');
        }
        const data = await response.json();
        setCreatorData(data);
      } catch (error) {
        console.error('Error fetching creator data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [creator]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!creatorData) return <div>Creator not found</div>;
  console.log(JSON.parse(creatorData.tiers)[0].price)
  return (
    <div className='flex flex-col items-center justify-center h-screen gap-4 w-full max-w-sm mx-auto px-4'>
      <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4">
        <span className="text-gray-600 text-2xl">Avatar</span>
      </div>
      <p className='text-2xl font-bold'>{creatorData.title}</p>
      <p className='text-sm text-gray-500'>{creatorData.desc}</p>
      <div className="w-full max-w-md">
        {JSON.parse(creatorData.tiers).map((tier, index) => (
          <div key={index} className="mb-4 p-4 bg-white shadow-md rounded-lg border-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2 text-blue-500">{tier.name}</h3>
            <p className="text-gray-600 font-bold">ETB {tier.price} /month</p>
          </div>
        ))}
      </div>
      <p className='text-sm text-gray-500'>{creatorData.description}</p>
      <p className='text-sm text-gray-500'>{creatorData.username}</p>
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center items-center">
        <Link href={`/${creator}/subscribe?tier=${JSON.parse(creatorData.tiers)[0].price}`} className='bg-blue-500 text-center text-lg font-bold text-white w-full max-w-sm py-2 rounded-md hover:bg-blue-700'>Subscribe</Link>
      </div>
    </div>
  )
}
