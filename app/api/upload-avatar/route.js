import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Constants for file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');
        const userId = formData.get('userId');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Verify user has permission to update this profile
        const { data: profile, error: profileError } = await supabase
            .from('creators_page')
            .select('user_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        if (profile.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // File size validation
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
            }, { status: 400 });
        }

        // File type validation
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json({
                error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
            }, { status: 400 });
        }

        // Clean up old avatar before uploading new one
        const { data: oldAvatar } = await supabase
            .from('creators_page')
            .select('avatar_url')
            .eq('id', userId)
            .single();

        if (oldAvatar?.avatar_url) {
            await supabase.storage
                .from('avatars')
                .remove([oldAvatar.avatar_url]);
        }

        const fileExt = file.type.split('/')[1]; // Get extension from MIME type
        const fileName = `${userId}-${uuidv4()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
        }

        const { error: updateError } = await supabase
            .from('creators_page')
            .update({ avatar_url: filePath })
            .eq('id', userId);

        if (updateError) {
            console.error('Profile update error:', updateError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({ filePath });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}