import { create } from 'zustand';

const usePublishStore = create((set, get) => ({
    isActive: false,
    loading: false,
    fetchCreatorData: async (username) => {
        set({ loading: true });
        try {
            const response = await fetch(`/api/creator/${username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch creator data');
            }
            const data = await response.json();
            set({ isActive: data.isActive }); // Set the fetched state
        } catch (error) {
            console.error('Error fetching creator data:', error);
        } finally {
            set({ loading: false });
        }
    },
    togglePublish: async (username) => {
        set({ loading: true }); // Optionally set loading here
        try {
            const currentState = get().isActive; // Use get() instead of set.getState()
            const response = await fetch(`/api/creator/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isActive: !currentState, // Send the opposite of the current state
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update creator data');
            }

            await response.json(); // Handle the response if needed

            // After updating, fetch the latest data
            await get().fetchCreatorData(username); // Use get() here as well
        } catch (error) {
            console.error('Error updating creator data:', error);
        } finally {
            set({ loading: false });
        }
    },
}));

export default usePublishStore;