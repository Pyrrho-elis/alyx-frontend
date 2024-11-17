import { create } from 'zustand';

const usePublishStore = create((set, get) => ({
    isActive: false,
    loading: false,
    fetchCreatorData: async (username) => {
        if (!username) return;
        
        set({ loading: true });
        try {
            const response = await fetch(`/api/creator/${username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch creator data');
            }
            const data = await response.json();
            set({ isActive: Boolean(data.isActive) });
        } catch (error) {
            console.error('Error fetching creator data:', error);
            set({ isActive: false });
        } finally {
            set({ loading: false });
        }
    },
    togglePublish: async (username) => {
        if (!username) return;
        
        set({ loading: true });
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update');
            }

            const data = await response.json();
            if (data.success) {
                set({ isActive: !currentState });
            }
        } catch (error) {
            console.error('Error toggling publish state:', error);
        } finally {
            set({ loading: false });
        }
    },
}));

export default usePublishStore;