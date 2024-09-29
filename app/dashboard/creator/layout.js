"use client";

import DashboardNav from "@/app/components/DashboardNav";
import DashboardSideBar from "@/app/components/DashboardSideBar";
import { useUser } from '@/app/hooks/useUser'
import { useEffect, useState } from 'react'

export default function CreatorLayout({ children }) {
    const { user } = useUser()
    const [email, setEmail] = useState('')
    const [isActive, setIsActive] = useState(false)
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')

    const handlePublish = async () => {
        try {
            const response = await fetch(`/api/creator/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isActive: !isActive,
                }),
            }
            );
            if (!response.ok) {
                throw new Error('Failed to update creator data');
            }
            const data = await response.json();
            console.log('Update successful:', data);
            // setIsActive(data.isActive);
            fetchCreatorData();
        } catch (error) {
            console.error('Error updating creator data:', error);
        }
    }

    const fetchCreatorData = async () => {
        try {
            const response = await fetch(`/api/creator/${user.user_metadata.username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch creator data');
            }
            const data = await response.json();
            setIsActive(data.isActive);
        } catch (error) {
            console.error('Error fetching creator data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            setEmail(user.email)
            setUsername(user.user_metadata.username)
            fetchCreatorData();
        }
    }, [user])
    return (
        <div className="lg:ml-40 md:ml-40 sm:ml-0">
            <main className="flex">
                <DashboardSideBar />
                {/* <div className="flex-1 lg:ml-40 md:ml-40 sm:ml-0"> */}
                <div className="flex-1">
                    <DashboardNav userEmail={email} isActive={isActive} handlePublish={handlePublish} userName={username} />
                    {children}
                    {/* <Preview creatorData={user} avatarUrl={user.avatar} /> */}
                </div>
            </main>
        </div>
    );
}
