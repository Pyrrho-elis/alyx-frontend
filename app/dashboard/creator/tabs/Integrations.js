'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/hooks/useUser'
import LoadingSkeleton from '@/app/components/LoadingSkeleton'
import useProfileStore from '../useProfileStore'
import { Button } from "@/components/ui/button"

export default function IntegrationsPage() {
  const [integrationCode, setIntegrationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState();
  const router = useRouter();

  const { user } = useUser();
  const { telegram_group_id, loading: profileLoading, fetchCreatorData } = useProfileStore();

  const verifyBot = async () => {
    try {
      const response = await fetch('/api/bot');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to verify bot');
      }
      const data = await response.json();
      
      if (data.ok) {
        return data.botToken;
      } else {
        throw new Error(data.error || 'Bot verification failed');
      }
    } catch (error) {
      console.error('Error verifying bot:', error);
      setError(`Bot verification failed: ${error.message}`);
      return null;
    }
  };

  const fetchGroupInfo = async (group_id) => {
    if (!group_id) return;
    
    setLoading(true);
    setError('');
    try {
      const botToken = await verifyBot();
      if (!botToken) {
        throw new Error('Failed to verify bot');
      }
      
      const response = await fetch(`/api/telegram/getChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatId: group_id })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch group info');
      }
      
      const data = await response.json();
      setGroupInfo(data);
    } catch (error) {
      console.error('Error fetching group info:', error);
      setError(`Failed to fetch group info: ${error.message}`);
      setGroupInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBot = async () => {
    setError('');
    setIsLoading(true);
    try {
      const botToken = await verifyBot();
      if (!botToken) {
        throw new Error('Failed to verify bot');
      }
      window.location.href = `https://t.me/${botToken}?start=setup_`;
    } catch (error) {
      setError(`Failed to add bot: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!integrationCode.trim()) {
      setError('Please enter an integration code');
      setIsLoading(false);
      return;
    }

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

      // Clear form
      setIntegrationCode('');
      
      // Fetch updated creator data
      await fetchCreatorData(user.user_metadata.username);
      
      // Force reload to ensure everything is updated
      window.location.reload();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!profileLoading && telegram_group_id) {
      fetchGroupInfo(telegram_group_id);
    }
  }, [telegram_group_id, profileLoading]);

  useEffect(() => {
    if (user?.user_metadata?.username) {
      fetchCreatorData(user.user_metadata.username);
    }
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Integrations</h1>
      
      {profileLoading ? (
        <div>Loading...</div>
      ) : telegram_group_id ? (
        <div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ) : groupInfo ? (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{groupInfo.result.title}</h2>
                  {groupInfo.result.description && (
                    <p className="mt-1 text-gray-600">{groupInfo.result.description}</p>
                  )}
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Connected
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Members</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {groupInfo.result.member_count?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Administrators</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {groupInfo.result.administrators?.length || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">Administrators</div>
                <div className="mt-2 space-y-2">
                  {groupInfo.result.administrators?.map((admin, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {admin.user.first_name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {admin.user.first_name} {admin.user.last_name || ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {admin.status === 'creator' ? 'Owner' : 'Admin'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 font-medium">Error loading group information</div>
              <p className="text-red-600 text-sm mt-1">The group may no longer be accessible.</p>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-4">No Telegram group linked. Add our bot to your group to get started.</p>
          <Button
            onClick={handleAddBot}
          >
            Add Bot to Group
          </Button>
          
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              value={integrationCode}
              onChange={(e) => setIntegrationCode(e.target.value)}
              placeholder="Enter Integration Code"
              className="border p-2 mr-2"
            />
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Linking...' : 'Link Group'}
            </Button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
