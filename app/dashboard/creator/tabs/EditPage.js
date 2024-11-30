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
import usePublishStore from '../usePublishStore'

export default function EditPage() {
    const { user } = useUser()
    const router = useRouter()
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
    const { isActive, loading: publishLoading, error: publishError, togglePublish } = usePublishStore();

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

    const handlePublish = async () => {
        togglePublish();
    }

    return (
        <div className='flex justify-between w-full'>
            <div className='flex-1 overflow-y-auto scrollbar-hidden py-8 px-16 max-h-screen'>
                <h1 className='text-4xl font-bold mb-6'>Design Your Page</h1>
                {loading ? <div className='space-y-4 w-full max-w-md'><LoadingSkeleton /></div> : (
                    <form onSubmit={handleSave} className='space-y-4 w-full max-w-md'>
                        <AvatarUpload avatarUrl={avatarUrl} userId={id} />
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm animate-fade-in">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow-sm animate-fade-in">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700">
                                            Your page has been updated successfully!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
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
                            {Object.keys(tiers).map((key) => (
                                <div key={key} className='flex space-x-2 items-center'>
                                    <Input
                                        name={`tierName-${key}`}
                                        placeholder="Tier Name"
                                        value={tiers[key].name}
                                        onChange={(e) => handleTierChange(key, 'name', e.target.value)}
                                        className='w-full p-2 border rounded'
                                    />
                                    <Input
                                        name={`tierPrice-${key}`}
                                        placeholder="Tier Price"
                                        value={tiers[key].price}
                                        type="number"
                                        onChange={(e) => handleTierChange(key, 'price', e.target.value)}
                                        className='w-full p-2 border rounded'
                                    />
                                    {/* // Todo: Add delete button */}
                                    {/* <Button type="button" onClick={() => removeTier(key)}>Delete</Button> */}
                                </div>
                            ))}
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
                        {publishError && (
                            <div className="text-red-500 text-sm">
                                {publishError}
                            </div>
                        )}
                        <Button
                            onClick={handlePublish}
                            disabled={publishLoading}
                            variant={isActive ? "destructive" : "default"}
                        >
                            {publishLoading ? 'Loading...' : isActive ? 'Unpublish' : 'Publish'}
                        </Button>
                    </form>
                )}
            </div>
            <div className='hidden lg:block w-1/2 scrollbar-hidden h-screen sticky top-0 right-0 bg-gray-50'>
                <div className="flex flex-col w-full justify-center items-center h-full py-8 px-4">
                    <Card className="bg-white w-2/3 shadow-lg h-full">
                        <div className="h-full overflow-y-auto scrollbar-hidden">
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
                                    {Object.keys(tiers).map((key) => (
                                        <Card key={key} className="px-2 border-solid border-2 border-sky-500 ">
                                            <CardHeader>
                                                <CardTitle>
                                                    <span className="text-lg font-semibold text-blue-500">{tiers[key].name}</span>
                                                </CardTitle>
                                                <CardDescription>
                                                    <span className="text-gray-600 font-bold">Br {tiers[key].price} /month</span>
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))
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
                                {youtubeUrl && extractYoutubeId(youtubeUrl) && (
                                    <YoutubeEmbed videoId={extractYoutubeId(youtubeUrl)} />
                                )}
                            </CardContent>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
