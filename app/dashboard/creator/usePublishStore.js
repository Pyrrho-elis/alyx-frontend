import { create } from 'zustand';

const usePublishStore = create((set, get) => ({
    isActive: false,
    loading: false,
    error: null,
    fetchCreatorData: async (username) => {
        if (!username) return;
        
        set({ loading: true, error: null });
        try {
            const response = await fetch(`/api/creator/${username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch creator data');
            }
            const data = await response.json();
            set({ isActive: Boolean(data.isActive) });
        } catch (error) {
            console.error('Error fetching creator data:', error);
            set({ isActive: false, error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    togglePublish: async (username) => {
        if (!username) return;
        
        set({ loading: true, error: null });
        try {
            const currentState = get().isActive;
            
            const response = await fetch(`/api/creator/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isActive: !currentState
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                if (data.code === 'TELEGRAM_GROUP_REQUIRED') {
                    throw new Error('Please link a Telegram group before publishing your profile');
                }
                throw new Error(data.error || 'Failed to update');
            }

            if (data.success) {
                set({ isActive: !currentState, error: null });
            }
        } catch (error) {
            console.error('Error toggling publish state:', error);
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    clearError: () => set({ error: null })
}));

export default usePublishStore;