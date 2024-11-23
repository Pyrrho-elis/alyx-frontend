'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/hooks/useUser'
import LoadingSkeleton  from '@/app/components/LoadingSkeleton'
import { useUserContext } from '../UserContext'
import { Button } from "@/components/ui/button"

export default function IntegrationsPage() {
  const [integrationCode, setIntegrationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // const data = useCreatorData();
  const { creator } = useUserContext();
  const { user } = useUser();

  const verifyBot = async () => {
    try {
      const response = await fetch('/api/bot');
      const data = await response.json();
      
      if (data.ok) {
        return data.botUsername;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error verifying bot:', error);
      return null;
    }
  };

  const fetchGroupInfo = async (creatorData) => {
    setLoading(true)
    try {
      const botUsername = await verifyBot();
      if (!botUsername) {
        throw new Error('Failed to verify bot');
      }
      const response = await fetch(`https://api.telegram.org/bot${botUsername}/getChat?chat_id=${creatorData.telegram_group_id}`, {
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

  const handleAddBot = async () => {
    const botUsername = await verifyBot();
    if (!botUsername) {
      console.error('Failed to verify bot');
      return;
    }
    window.location.href = `https://t.me/${botUsername}?start=setup_`
  }

  useEffect(() => {
    if (creator.telegram_group_id) {
      fetchGroupInfo(creator);
    }
  }, [creator.telegram_group_id]);

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
    <LoadingSkeleton />
  }

  return (
    <>{!creator.telegram_group_id ? (
      <div className="max-w-md mx-auto mt-4 p-6 bg-gray-50 rounded-lg shadow-lg border-2">
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

        <div className="mt-4 text-sm text-gray-600 flex flex-col gap-3 items-center">
          <p className='text-2xl font-bold'>To get an integration code:</p>
          <ol className="list-decimal ml-5 mt-2">
            <li>Add Subzz Bot to your Telegram group by clicking the button below</li>
            <li>Make the bot an administrator</li>
            <li>Copy the integration code sent by the bot</li>
            <li>Paste it here to complete the linking</li>
          </ol>
          <div>
            <Button variant="shine" onClick={handleAddBot}>
              Add Subzz Bot to your Telegram group
            </Button>
          </div>
          <p>Need Help? Book a demo with our support team</p>
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
