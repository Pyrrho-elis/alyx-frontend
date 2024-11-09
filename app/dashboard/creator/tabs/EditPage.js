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
import LoadingSkeleton from '@/app/components/LoadingSkeleton'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import useProfileStore from '../useProfileStore'
import { Label } from '@radix-ui/react-dropdown-menu'


export default function EditPage() {
    const { user } = useUser()
    const [username, setUsername] = useState('');
    const {
        title,
        setTitle,
        tiers,
        description,
        setDescription,
        perks,
        youtubeUrl,
        setYoutubeUrl,
        id,
        avatarUrl,
        loading,
        error,
        success,
        fetchCreatorData,
        fetchAvatarUrl,
        handleTierChange,
        handlePerkChange,
        addPerk,
        removePerk,
        handleSubmit,
    } = useProfileStore();

    useEffect(() => {
        if (user) {
            const creatorUsername = user.user_metadata.username;
            setUsername(creatorUsername);
            if (id == '') {
                fetchCreatorData(user.user_metadata.username);
            }
            fetchAvatarUrl();
        }
    }, [user]);

    function extractYoutubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    const handleSave = async (e) => {
        e.preventDefault();
        handleSubmit(username);
    }

    return (
        <div className='flex justify-around w-full items-center'>
            <div className='flex flex-col justify-center min-h-screen py-8 px-4'>
                <h1 className='text-4xl font-bold mb-6'>Design Your Page</h1>
                {loading ? <div className='space-y-4 w-full max-w-md'><LoadingSkeleton /></div> : (
                    <form onSubmit={handleSave} className='space-y-4 w-full max-w-md'>
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

                            {tiers.map((tier, index) => (
                                <div key={index} className='flex space-x-2 items-center'>
                                    <Input
                                        name='tierName'
                                        placeholder="Tier Name"
                                        value={tier.name}
                                        onChange={(e) => handleTierChange(index, 'name', e.target.value)} // Pass index here
                                        className='w-full p-2 border rounded'
                                    />
                                    <Input
                                        name='tierPrice'
                                        placeholder="Tier Price"
                                        value={tier.price}
                                        type="number"
                                        onChange={(e) => handleTierChange(index, 'price', e.target.value)} // Pass index here
                                        className='w-full p-2 border rounded'
                                    />
                                </div>
                            ))}
                            {/* <Input
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
                                type="number"
                                onChange={(e) => handleTierChange('price', e.target.value)}
                                className='w-full p-2 border rounded'
                            /> */}
                        </div>
                        <label htmlFor="perks" className="block text-gray-700 text-sm font-bold mb-2">
                            Features and Perks
                        </label>
                        {perks.map((perk, index) => (
                            <div name='perks' key={index} className='flex flex-col space-x-2 justify-center items-center'>
                                <Card className="w-full px-4">
                                    <CardHeader>
                                        <CardTitle>
                                            <Label htmlFor="perks" className="block text-gray-700 text-sm font-bold mb-2">
                                                Perk Title
                                            </Label>
                                            <Input
                                                type="text"
                                                placeholder={`Perk Title`}
                                                value={perk.name}
                                                onChange={(e) => handlePerkChange(index, 'name', e.target.value)}
                                                className='w-full p-2 border rounded'
                                            />
                                        </CardTitle>
                                        <CardDescription>
                                            <Label htmlFor="perks" className="block text-gray-700 text-sm font-bold mb-2">
                                                Perk Description
                                            </Label>
                                            <Input
                                                type="text"
                                                placeholder={`Perk Description`}
                                                value={perk.desc}
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
            <div className='hidden lg:block w-full max-w-[390px] overflow-scroll'>
                <div className="flex flex-col sticky top-16 overflow-scroll">
                    <Card className="overflow-scroll">
                        <CardHeader>
                            <CardTitle className="flex flex-col justify-center items-center gap-4">
                                <Avatar className="w-32 h-32">
                                    <AvatarImage src={`https://cbaoknlorxoueainhdxq.supabase.co/storage/v1/object/public/avatars/${avatarUrl}`} alt="User Profile" />
                                    <AvatarFallback>Avatar</AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col justify-center items-center'>
                                    <p className="text-4xl font-bold mb-2 text-blue-500">{title}</p>
                                    <p className='text-sm text-gray-500'>{description}</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 justify-center">
                            <div className="grid grid-cols-2">
                                {Array.isArray(tiers) && tiers.length > 0 ? (
                                    tiers.map((tier, index) => (
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
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <p className="text-gray-500 text-center">No tiers added yet</p>
                                    </div>
                                )
                                }
                            </div>
                            <span className='text-xl'>Inside the community:</span>
                            {perks.map((perk, index) => (
                                <div key={index}>
                                    <Card className="w-full p-4 mb-2 justify-center">
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
        </div>
    )
}
