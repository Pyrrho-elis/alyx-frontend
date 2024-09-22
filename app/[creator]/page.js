'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '../hooks/useUser';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"

export default function page() {
  const { creator } = useParams();
  const [creatorData, setCreatorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [tiers, setTiers] = useState([{ name: '', price: '' }]);
  const [perks, setPerks] = useState([]);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  const validateUsername = (username) => {
    if (!username) throw 'Error: Username is required!'
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(username.toString()) || /\s/.test(username)) throw 'Error: Invalid Username! Username must be 3-16 characters long, contain only letters, numbers, and underscores, and have no spaces.'
    return username.toString()
  }

  const fetchAvatarUrl = async () => {
    const res = await fetch('/api/avatar');
    const data = await res.json();
    setAvatarUrl(data.avatarUrl);
  };

  const creatorUsername = validateUsername(creator)

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const response = await fetch(`/api/creator/${creatorUsername.toLowerCase()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch creator data');
        }
        const data = await response.json();
        setTitle(...title, [data.title]);
        setTiers([JSON.parse(data.tiers)]);
        setPerks(JSON.parse(data.perks));
        setDescription(data.desc);
        setCreatorData(data);
      } catch (error) {
        console.error('Error fetching creator data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
    fetchAvatarUrl();
  }, [creator]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!creatorData) return <div>Creator not found</div>;
  return (
    <div className='flex flex-col justify-center h-screen gap-4 w-full max-w-sm mx-auto p-4'>
      <div className='m-4'>
        <Avatar className="w-32 h-32">
          <AvatarImage src={`https://cbaoknlorxoueainhdxq.supabase.co/storage/v1/object/public/avatars/${avatarUrl}`} alt="User Profile" />
          <AvatarFallback>Avatar</AvatarFallback>
        </Avatar>

      </div>
      <p className='text-2xl font-bold'>{creatorData.title}</p>
      <p className='text-sm text-gray-500'>{creatorData.desc}</p>
      <div className='flex flex-col items-center space-y-2'>
        {tiers.map((tier, index) => (
          <Card key={index} className="w-full px-4">
            <CardHeader>
              <CardTitle>
                <h3 className="text-lg font-semibold mb-2 text-blue-500">{tier.name}</h3>

              </CardTitle>
              <CardDescription>
                <p className="text-gray-600 font-bold">Br {tier.price} /month</p>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <label htmlFor="perks" className="block text-gray-700 text-sm font-bold mb-2">
        Features and Perks
      </label>
      <div name='perks' className='flex flex-col items-center space-y-2'>
        {JSON.parse(creatorData.perks).map((perk, index) => (
          <Card key={index} className="w-full px-4 mb-2">
            <CardHeader>
              <CardTitle>
                <h3 className="text-lg font-semibold mb-2 text-blue-500">{perk.name}</h3>
              </CardTitle>
              <CardDescription>
                <p className="text-gray-600 font-bold">{perk.desc}</p>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <p className='text-sm text-gray-500'>{creatorData.description}</p>
      <p className='text-sm text-gray-500'>@{creatorData.username}</p>
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center items-center">
        <Link href={`/${creator}/subscribe?tier=${JSON.parse(creatorData.tiers)[0].price}`} className='bg-blue-500 text-center text-lg font-bold text-white w-full max-w-sm py-2 rounded-md hover:bg-blue-700'>Subscribe</Link>
      </div>
    </div>
  )
}
