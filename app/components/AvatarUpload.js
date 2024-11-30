'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useProfileStore from '@/app/dashboard/creator/useProfileStore';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';

export default function AvatarUpload({ userId, avatarUrl }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(avatarUrl);
    const router = useRouter();
    const { fetchAvatarUrl } = useProfileStore();

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);
            setError(null);
            setSuccess(false);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);

            const response = await fetch('/api/upload-avatar', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to upload avatar');
            }

            // Update preview with the new avatar
            setPreviewUrl(result.filePath);
            setSuccess(true);

            // Refresh avatar URL in the profile store
            await fetchAvatarUrl();

            // Refresh the page data
            router.refresh();
        } catch (error) {
            console.error('Error uploading avatar:', error);
            setError(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className='flex flex-col items-center justify-center gap-4'>
            {previewUrl ? (
                <Avatar className="w-32 h-32">
                    <AvatarImage 
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${previewUrl}`} 
                        alt="User Profile" 
                    />
                    <AvatarFallback>Avatar</AvatarFallback>
                </Avatar>
            ) : (
                <Avatar className="w-32 h-32">
                    <AvatarFallback>No Avatar</AvatarFallback>
                </Avatar>
            )}
            <div className=''>
                <label className={`button primary block cursor-pointer p-2 rounded-md ${
                    uploading 
                        ? 'bg-gray-500 text-white' 
                        : success 
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-900 text-white'
                }`} htmlFor="single">
                    {uploading ? 'Uploading ...' : success ? 'Upload Successful!' : 'Upload New'}
                </label>
                <input
                    style={{
                        visibility: 'hidden',
                        position: 'absolute',
                    }}
                    type="file"
                    id="single"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                />
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
}