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
import { SkeletonCard } from '@/app/components/Skeleton'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import YoutubeEmbed from '@/app/components/YoutubeEmbed'


export default function EditPage() {
    const { user } = useUser()
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [tiers, setTiers] = useState([{ name: '', price: '' }])
    const [description, setDescription] = useState('')
    const [perks, setPerks] = useState([{ name: '', desc: '' }])
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [id, setId] = useState('')
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [creatorData, setCreatorData] = useState(null);

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
                    setCreatorData(data);
                    console.log('creatorData', data);
                    setTitle(data.title || '');
                    setTiers(JSON.parse(data.tiers) || [{ name: '', price: '' }]);
                    setDescription(data.desc || '');
                    setPerks(JSON.parse(data.perks) || [{ name: '', desc: '' }]);
                    setYoutubeUrl(data.youtube_video_id ? `https://www.youtube.com/watch?v=${data.youtube_video_id}` : '');
                } catch (error) {
                    console.error('Error fetching creator data:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchCreatorData();
        }
    }, [user])

    function extractYoutubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

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

        const youtubeId = extractYoutubeId(youtubeUrl);

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
                    youtube_video_id: youtubeId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update creator data');
            }

            const result = await response.json();
            //console.log('Update successful:', result);
            setSuccess(true)
            router.refresh();
        } catch (error) {
            console.error('Error updating creator data:', error);
            setError(error.message)
            // You might want to set an error state here and display it to the user
        }
    }

    return (
        <div className='flex justify-around w-full items-center'>
            <div className='flex flex-col justify-center min-h-screen py-8 px-4'>
                <h1 className='text-4xl font-bold mb-6'>Design Your Page</h1>
                {loading ? <div className='flex flex-col justify-center'><SkeletonCard /></div> : (
                    <form onSubmit={handleSubmit} className='space-y-4 w-full max-w-md'>
                        <AvatarUpload avatarUrl={avatarUrl} userId={id} />
                        {error && <p className='text-red-500'>{error}</p>}
                        {success && <p className='text-green-500'>Your page has been updated successfully!</p>}
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
                                                value={tier.desc}
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
                        <label htmlFor="youtubeUrl" className="block text-gray-700 text-sm font-bold mb-2">
                            {'YouTube Video URL (Optional)'}
                        </label>
                        <Input
                            name='youtubeUrl'
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            className='w-full p-2 border rounded'
                        />

                        <Button
                            type="submit"
                            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
                        >
                            Save Design
                        </Button>
                    </form>
                )}
            </div>
            <div className='hidden lg:block w-full max-w-[390px]'>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-col justify-center items-center gap-4">
                            <Avatar className="w-32 h-32">
                                <AvatarImage src={`https://cbaoknlorxoueainhdxq.supabase.co/storage/v1/object/public/avatars/${avatarUrl}`} alt="User Profile" />
                                <AvatarFallback>Avatar</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col items-center'>
                                <p className="text-4xl font-semibold mb-2 text-blue-500">{title}</p>
                                <p className='text-sm text-gray-500'>{description}</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid grid-cols-2">
                            <Card className="px-2 border-solid border-2 border-sky-500 ">
                                <CardHeader>
                                    <CardTitle>
                                        <span className="text-lg font-semibold text-blue-500">{tiers.name}</span>
                                    </CardTitle>
                                    <CardDescription>
                                        <span className="text-gray-600 font-bold">Br {tiers.price} /month</span>
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                        <span className='text-xl'>Inside the community:</span>
                        {perks.map((perk, index) => (
                            <div key={index}>
                                <Card className="w-full p-4 mb-2">
                                    <CardTitle>
                                        <span className="text-lg font-semibold mb-2 text-blue-500">{perk.name}</span>
                                    </CardTitle>
                                    <CardDescription>
                                        <span className="text-gray-600 font-bold">{perk.desc}</span>
                                    </CardDescription>
                                </Card>
                            </div>
                        ))}
                        {youtubeUrl && youtubeUrl.length > 0
                            ? <div className="rounded-sm">
                                <YoutubeEmbed videoId={youtubeUrl} />
                            </div>
                            : <></>
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
