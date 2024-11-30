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
  const { creator, loading: creatorLoading } = useUserContext();
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
    if (!creatorLoading && creator?.telegram_group_id) {
      fetchGroupInfo(creator);
    }
  }, [creator, creatorLoading]);

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Integrations</h1>
      
      {creatorLoading ? (
        <div>Loading...</div>
      ) : creator?.telegram_group_id ? (
        <div>
          {loading ? (
            <div>Loading group info...</div>
          ) : groupInfo ? (
            <div>
              <h2>Linked Telegram Group</h2>
              <p>Group Name: {groupInfo.result.title}</p>
              {/* Add more group info display here */}
            </div>
          ) : null}
        </div>
      ) : (
        <div>
          <p className="mb-4">No Telegram group linked. Add our bot to your group to get started.</p>
          <button
            onClick={handleAddBot}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Bot to Group
          </button>
          
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              value={integrationCode}
              onChange={(e) => setIntegrationCode(e.target.value)}
              placeholder="Enter integration code"
              className="border p-2 rounded mr-2"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Linking...' : 'Link Group'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
