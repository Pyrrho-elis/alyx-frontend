'use client'
import React, { useState, useEffect } from 'react'
import { useUser } from '@/app/hooks/useUser'
import SubList from '@/app/components/SubList'
import { useRouter } from 'next/navigation'

export default function CraetorMembersPage() {
  const { user } = useUser()
  const router = useRouter()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleRemoveMember = async (userId) => {
    try {
      const response = await fetch(`/api/creator/${user.user_metadata.username}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      const result = await response.json();
      router.refresh();
      console.log('Deleted member:', result);

    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      const fetchMembers = async () => {
        try {
          const response = await fetch(`/api/creator/${user.user_metadata.username}/members`);
          if (!response.ok) {
            throw new Error('Failed to fetch members');
          }
          const data = await response.json();
          console.log(data);
          setMembers(data);
        } catch (error) {
          console.error('Error fetching members:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMembers();
    }

  }, [user]);

  return (
    <div className='flex flex-col justify-center'>
        <SubList members={members} removeMember={(userID) => {handleRemoveMember(userID)}}/>
    </div>
  )
}
