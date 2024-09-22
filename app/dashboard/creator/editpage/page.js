'use client'
import React, { useState, useEffect } from 'react'
import { useUser } from '@/app/hooks/useUser'
import { useRouter } from 'next/navigation'
import AvatarUpload from '@/app/components/AvatarUpload'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


export default function page() {
    const { user } = useUser()
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [tiers, setTiers] = useState([{ name: '', price: '' }])
    const [description, setDescription] = useState('')
    const [perks, setPerks] = useState([{ name: '', desc: '' }])
    const [id, setId] = useState('')
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (user) {
            setId(user.id)
            fetchAvatarUrl();
            const fetchCreatorData = async () => {
                try {
                    const response = await fetch(`/api/creator/${user.user_metadata.username}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch creator data');
                    }
                    const data = await response.json();
                    setTitle(data.title || '');
                    setTiers(JSON.parse(data.tiers) || [{ name: '', price: '' }]);
                    setDescription(data.desc || '');
                    setPerks(JSON.parse(data.perks) || [{ name: '', desc: '' }]);
                } catch (error) {
                    console.error('Error fetching creator data:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchCreatorData();
        }
    }, [user])

    const fetchAvatarUrl = async () => {
        const res = await fetch('/api/avatar');
        const data = await res.json();
        setAvatarUrl(data.avatarUrl);
    };

    const handleTierChange = (field, value) => {
        setTiers({ ...tiers, [field]: value });
    }

    const handlePerkChange = (index, field, value) => {
        const newPerks = [...perks]
        newPerks[index][field] = value
        setPerks(newPerks)
    }

    const addPerk = () => {
        setPerks([...perks, { name: '', desc: '' }])
    }

    const removePerk = (index) => {
        const newPerks = perks.filter((_, i) => i !== index)
        setPerks(newPerks)
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
                    desc: description,
                    perks: JSON.stringify(perks),
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
            setError(error.message)
            // You might want to set an error state here and display it to the user
        }
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-screen py-8 px-4'>
            <h1 className='text-4xl font-bold mb-6'>Design Your Page</h1>
            {loading ? <div>Loading...</div> : (
                <form onSubmit={handleSubmit} className='space-y-4 w-full max-w-md'>
                    <AvatarUpload avatarUrl={avatarUrl} userId={id} />
                    {error && <p className='text-red-500'>{error}</p>}
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                        Title
                    </label>
                    <Input
                        name='title'
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className='w-full p-2 border rounded'
                    />
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                        Description
                    </label>
                    <Input
                        name='description'
                        rows={5}
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className='w-full p-2 border rounded'
                    />
                    <label htmlFor="tiers" className="block text-gray-700 text-sm font-bold mb-2">
                        Tier
                    </label>
                    <div className='flex space-x-2 items-center'>

                        <Input
                            name='tiers'
                            rows={5}
                            placeholder="Tier Name"
                            value={tiers.name}
                            onChange={(e) => handleTierChange('name', e.target.value)}
                            className='w-full p-2 border rounded'
                        />
                        <Input
                            name='tiers'
                            rows={5}
                            placeholder="Tier Price"
                            value={tiers.price}
                            onChange={(e) => handleTierChange('price', e.target.value)}
                            className='w-full p-2 border rounded'
                        />
                    </div>
                    <label htmlFor="perks" className="block text-gray-700 text-sm font-bold mb-2">
                        Features and Perks
                    </label>
                    {perks.map((tier, index) => (
                        <div name='perks' key={index} className='flex flex-col space-x-2 items-center'>
                            <Card className="w-full px-4">
                                <CardHeader>
                                    <CardTitle>
                                        <Input
                                            type="text"
                                            placeholder={`Perk Title`}
                                            value={tier.name}
                                            onChange={(e) => handlePerkChange(index, 'name', e.target.value)}
                                            className='w-1/2 p-2 border rounded'
                                        />
                                    </CardTitle>
                                    <CardDescription>
                                        <Input
                                            type="text"
                                            placeholder={`Perk Description`}
                                            value={tier.price}
                                            onChange={(e) => handlePerkChange(index, 'desc', e.target.value)}
                                            className='w-full p-2 border rounded'
                                        />
                                    </CardDescription>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => removePerk(index)}
                                    // className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
                                    >
                                        Delete
                                    </Button>
                                </CardHeader>
                            </Card>
                        </div>
                    ))}
                    <Button
                        type="button"
                        onClick={addPerk}
                        className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full'
                    >
                        Add Perk
                    </Button>
                    <Button
                        type="submit"
                        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
                    >
                        Update
                    </Button>
                </form>
            )}
        </div>
    )
}
