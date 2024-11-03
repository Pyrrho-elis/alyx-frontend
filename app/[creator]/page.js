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
import YouTubeEmbed from '../components/YoutubeEmbed'
import LoadingSkeleton  from '@/app/components/LoadingSkeleton'

export default function CreatorPage() {
  const { creator } = useParams();
  const [creatorData, setCreatorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');

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
        setYoutubeVideoId(data.youtube_video_id || '');
      } catch (error) {
        console.error('Error fetching creator data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
    fetchAvatarUrl();
  }, [creator]);

  if (loading) return <div className='flex flex-col justify-center gap-4 w-full mx-auto p-4 mb-16'><LoadingSkeleton /></div>;
  if (error) return <div>Error: {error}</div>;
  if (!creatorData) return <div>Creator not found</div>;
  return (
    <div className='absolute inset-0 h-fit bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] shadow-lg p-4'>
      <div className='flex flex-col justify-center gap-4 w-full max-w-md mx-auto p-4 mb-32 backdrop-blur-sm bg-gray-100 border-solid border-2 border-gray-300 rounded-lg shadow-2xl'>
        <div className='flex flex-col justify-center items-center m-4 h-full'>
          <Avatar className="w-64 h-64"> 
            <AvatarImage src={`https://cbaoknlorxoueainhdxq.supabase.co/storage/v1/object/public/avatars/${avatarUrl}`} alt="User Profile" />
            <AvatarFallback>Avatar</AvatarFallback>
          </Avatar>
        </div>
        <div className='flex flex-col justify-center items-center m-4'>
          <p className='text-4xl font-bold'>{creatorData.title}</p>
          <p className='text-sm text-gray-500'>{creatorData.desc}</p>
        </div>
        <div className='grid grid-cols-2'>
          {tiers.map((tier, index) => (
            <Card key={index} className="px-2 border-solid border-2 border-sky-500 ">
              <CardHeader>
                <CardTitle>
                  <span className="text-lg font-semibold text-blue-500">{tier.name}</span>
                </CardTitle>
                <CardDescription>
                  <span className="text-gray-600 font-bold">Br {tier.price} /month</span>
                </CardDescription>
              </CardHeader>
            </Card>
            // <Card key={index} className="w-full px-4">
            //   <CardHeader>
            //     <CardTitle>
            //       <h3 className="text-lg font-semibold mb-2 text-blue-500">{tier.name}</h3>
            //     </CardTitle>
            //     <CardDescription>
            //       <p className="text-gray-600 font-bold">Br {tier.price} /month</p>
            //     </CardDescription>
            //   </CardHeader>
            // </Card>
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
        <YouTubeEmbed videoId={youtubeVideoId} />
        <div className='flex flex-col justify-center items-center'>
            <p className='text-sm text-gray-500'>@{creatorData.username}</p>
            <p>powered by <Link href='/' className='text-blue-500 hover:underline'>Subzz</Link></p>
        </div>
      </div>
      <div className={`fixed bottom-0 left-0 right-0 p-4 flex flex-col w-full justify-center items-center ${!creatorData.isActive ? 'opacity-50' : ''}`}>
        {!creatorData.isActive ? (
          <p className='text-center text-lg font-bold text-white bg-blue-500 opacity-50 w-full max-w-sm py-2 rounded-md'>Not live yet</p>
        ) : (
          <>
            <Button asChild variant="gooeyRight" className='bg-blue-500 text-center text-lg font-bold text-white w-full max-w-lg h-16 py-2 rounded-2xl hover:bg-blue-700'>
              <Link href={`https://t.me/subzzSupportBot?start=sub_${creator}`} className='bg-blue-500 text-center text-lg font-bold text-white w-full max-w-sm py-2 rounded-md hover:bg-blue-700'>Subscribe</Link>
              {/* <Link  href={`/${creator}/subscribe?tier=${JSON.parse(creatorData.tiers)[0].price}`} className='bg-blue-500 text-center text-lg font-bold text-white w-full max-w-sm py-2 rounded-md hover:bg-blue-700'>Subscribe</Link> */}
            </Button>

          </>
        )}
      </div>
    </div>
  )
}
