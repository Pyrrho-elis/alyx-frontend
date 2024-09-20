'use client'
import React, { useState, useEffect } from 'react'
import { useUser } from '@/app/hooks/useUser'
import { useRouter } from 'next/navigation'
export default function page() {
    const { user } = useUser()
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [tiers, setTiers] = useState([{ name: '', price: '' }])
    const [id, setId] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            setId(user.id)
            const fetchCreatorData = async () => {
                try {
                    const response = await fetch(`/api/creator/${user.user_metadata.username}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch creator data');
                    }
                    const data = await response.json();
                    setTitle(data.title || '');
                    setTiers(JSON.parse(data.tiers) || [{ name: '', price: '' }]);
                } catch (error) {
                    console.error('Error fetching creator data:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchCreatorData();
        }
    }, [user])

    const handleTierChange = (index, field, value) => {
        const newTiers = [...tiers]
        newTiers[index][field] = value
        setTiers(newTiers)
    }

    const addTier = () => {
        setTiers([...tiers, { name: '', price: '' }])
    }

    const removeTier = (index) => {
        const newTiers = tiers.filter((_, i) => i !== index)
        setTiers(newTiers)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user.user_metadata.username) {
            console.error('Username is not available');
            return;
        }

        try {
            const response = await fetch(`/api/creator/${user.user_metadata.username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    tiers: JSON.stringify(tiers),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update creator data');
            }

            const result = await response.json();
            console.log('Update successful:', result);
            router.push('/dashboard/creator');
        } catch (error) {
            console.error('Error updating creator data:', error);
            // You might want to set an error state here and display it to the user
        }
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-screen py-8'>
            <h1 className='text-4xl font-bold mb-6'>Edit Page</h1>
            {loading ? <div>Loading...</div> : (
            <form onSubmit={handleSubmit} className='space-y-4 w-full max-w-md'>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='w-full p-2 border rounded'
                />
                {tiers.map((tier, index) => (
                    <div key={index} className='flex space-x-2 items-center'>
                        <input
                            type="text"
                            placeholder={`Tier ${index + 1} Name`}
                            value={tier.name}
                            onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                            className='w-1/2 p-2 border rounded'
                        />
                        <input
                            type="number"
                            placeholder={`Tier ${index + 1} Price`}
                            value={tier.price}
                            onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                            className='w-1/3 p-2 border rounded'
                        />
                        <button 
                            type="button" 
                            onClick={() => removeTier(index)}
                            className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
                        >
                            X
                        </button>
                    </div>
                ))}
                <button 
                    type="button" 
                    onClick={addTier}
                    className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full'
                >
                    Add Tier
                </button>
                <button 
                    type="submit" 
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
                >
                    Update
                </button>
            </form>
            )}
        </div>
    )
}
