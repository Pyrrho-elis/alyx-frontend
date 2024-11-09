import { create } from 'zustand';

const useProfileStore = create((set, get) => ({
    title: '',
    tiers: [{ name: '', price: '' }],
    description: '',
    perks: [{ name: '', desc: '' }],
    youtubeUrl: '',
    id: '',
    avatarUrl: null,
    loading: true,
    error: '',
    success: false,
    creatorData: null,

    setTitle: (title) => set({ title }),
    setDescription: (description) => set({ description }),
    setYoutubeUrl: (youtubeUrl) => set({ youtubeUrl }),
    setSuccessWithTimeout: (message, duration = 5000) => {
        set({ success: message });
        setTimeout(() => {
            set({ success: !message });
        }, duration);
    },

    fetchCreatorData: async (username) => {
        set({ loading: true });
        try {
            const response = await fetch(`/api/creator/${username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch creator');
            }
            const data = await response.json();

            const parsedTiers = data.tiers ? Array(JSON.parse(data.tiers)) : [{ name: '', price: '' }];
            set({
                creatorData: data,
                title: data.title || '',
                tiers: parsedTiers,
                description: data.desc || '',
                perks: Array.isArray(JSON.parse(data.perks)) ? JSON.parse(data.perks) : [{ name: '', desc: '' }],
                youtubeUrl: data.youtube_video_id ? `https://www.youtube.com/watch?v=${data.youtube_video_id}` : '',
            });
        } catch (error) {
            console.error('Error fetching creator data catch:', error);
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    fetchAvatarUrl: async () => {
        try {
            const res = await fetch('/api/avatar');
            const data = await res.json();
            set({ avatarUrl: data.avatarUrl });
        } catch (error) {
            console.error('Error fetching avatar URL:', error);
        }
    },

    handleTierChange: (index, field, value) => {
        const currentTiers = get().tiers;

        // Ensure currentTiers is an array
        if (!Array.isArray(currentTiers)) {
            console.error("Tiers is not an array, resetting to default.");
            set({ tiers: [{ name: '', price: '' }] });
            return;
        }

        const tiers = currentTiers.map((tier, i) => 
            i === index ? { ...tier, [field]: value } : tier
        );
        set({ tiers });
        console.log('Tiers', tiers);
    },

    handlePerkChange: (index, field, value) => {
        const perks = get().perks.map((perk, i) => 
            i === index ? { ...perk, [field]: value } : perk
        );
        set({ perks });
    },

    addPerk: () => {
        set((state) => ({ perks: [...state.perks, { name: '', desc: '' }] }));
    },

    removePerk: (index) => {
        const perks = get().perks.filter((_, i) => i !== index);
        set({ perks });
    },

    handleSubmit: async (username) => {
        const { title, tiers, description, perks, youtubeUrl } = get();
        const youtubeId = extractYoutubeId(youtubeUrl);

        try {
            const response = await fetch(`/api/creator/${username}`, {
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

            await response.json();
            // set({ success: true });
            get().setSuccessWithTimeout(true);
        } catch (error) {
            console.error('Error updating creator data:', error);
            set({ error: error.message });
        }
    },
}));

function extractYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default useProfileStore;