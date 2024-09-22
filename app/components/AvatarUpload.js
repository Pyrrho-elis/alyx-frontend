'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';

export default function AvatarUpload({ userId, avatarUrl }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);
            setError(null);

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
            {avatarUrl ? (
                <Avatar className="w-32 h-32">
                    <AvatarImage src={`https://cbaoknlorxoueainhdxq.supabase.co/storage/v1/object/public/avatars/${avatarUrl}`} alt="User Profile" />
                    <AvatarFallback>Avatar</AvatarFallback>
                </Avatar>
            ) : (
                <div className="avatar no-image" style={{ height: 150, width: 150 }} />
            )}
            <div className=''>
                <Button htmlFor="single">
                    {uploading ? 'Uploading ...' : 'Upload New'}
                </Button>
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
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}