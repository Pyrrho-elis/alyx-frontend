'use client'

import React, { useState, useEffect } from 'react'
import { useCreatorData } from '../creatorDataContext'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/hooks/useUser'
import { SkeletonCard } from '@/app/components/Skeleton'

export default function IntegrationsPage() {
  const [integrationCode, setIntegrationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const data = useCreatorData();
  const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;

  //Change this when is everything is tabbed
  const { user } = useUser()

  const fetchGroupInfo = async (creatorData) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${creatorData.telegram_group_id}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch creator data');
      }
      const data = await response.json();
      setGroupInfo(data);
      console.log('Group info:', data);
    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.telegram_group_id) {
      fetchGroupInfo(data);
    }
  }, [data.telegram_group_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationCode, userId: user.id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link group');
      }
      // toast.success('Group successfully linked!');
      setIntegrationCode('');
      // Optionally refresh the page or update UI
      router.refresh();
    } catch (error) {
      // toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    <SkeletonCard />
  }

  return (
    <>{!data.telegram_group_id ? (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Link Telegram Group</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="integrationCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Integration Code
            </label>
            <input
              id="integrationCode"
              type="text"
              value={integrationCode}
              onChange={(e) => setIntegrationCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter integration code"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white 
            ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
            transition-colors duration-200`}
          >
            {isLoading ? 'Linking...' : 'Link Group'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p>To get an integration code:</p>
          <ol className="list-decimal ml-5 mt-2">
            <li>Add @YourBot to your Telegram group</li>
            <li>Make the bot an administrator</li>
            <li>Copy the integration code sent by the bot</li>
            <li>Paste it here to complete the linking</li>
          </ol>
        </div>
      </div>
    ) : (<>
      <div className="max-w-md mx-auto p-6 rounded-lg shadow-md mt-4 bg-gray-50">
        <p className='text-2xl font-semibold'>Linked To:</p>
        <div className="flex bg-blue-500 w-fit justify-between items-center mb-2 mt-2 p-2 rounded-sm text-white font-bold cursor-pointer">
          Telegram Group
          <p>Title: {groupInfo?.result.title}</p>
        </div>
      </div>
    </>)}
    </>
  )
}
