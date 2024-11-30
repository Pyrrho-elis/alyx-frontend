import { create } from 'zustand';
import { z } from 'zod'; // For data validation

// Validation schemas
const TierSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number')
});

const PerkSchema = z.object({
  name: z.string().min(1).max(100),
  desc: z.string().min(1).max(500)
});

const ProfileSchema = z.object({
  title: z.string().min(1).max(100),
  tiers: z.record(z.string(), TierSchema),
  description: z.string().max(2000),
  perks: z.array(PerkSchema),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
});

// Safely parse JSON with fallback
const safeJSONParse = (str, fallback) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    console.error('JSON Parse Error:', e);
    return fallback;
  }
};

// Sanitize error messages for UI
const sanitizeErrorMessage = (error) => {
  const genericError = 'An error occurred. Please try again.';
  if (!error) return genericError;
  
  // Only expose safe, user-friendly error messages
  const safeErrors = {
    'Failed to fetch creator': 'Unable to load profile. Please try again.',
    'Failed to update creator data': 'Unable to save changes. Please try again.',
    'ValidationError': 'Please check your input and try again.',
  };
  
  return safeErrors[error.message] || genericError;
};

// YouTube URL validator and ID extractor
const validateYoutubeUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    if (!['youtube.com', 'www.youtube.com', 'youtu.be'].includes(urlObj.hostname)) {
      return '';
    }
    return extractYoutubeId(url);
  } catch (e) {
    return '';
  }
};

const useProfileStore = create((set, get) => ({
  title: '',
  tiers: { "0": { name: '', price: '' } },
  description: '',
  perks: [{ name: '', desc: '' }],
  youtubeUrl: '',
  id: '',
  avatarUrl: null,
  telegram_group_id: null,
  loading: true,
  error: null,
  success: false,
  creatorData: null,

  setTitle: (title) => set({ title: title.slice(0, 100) }),
  setDescription: (description) => set({ description: description.slice(0, 2000) }),
  setYoutubeUrl: (youtubeUrl) => {
    const validUrl = validateYoutubeUrl(youtubeUrl);
    set({ youtubeUrl: validUrl ? youtubeUrl : '' });
  },

  setSuccessWithTimeout: (message, duration = 5000) => {
    set({ success: message });
    setTimeout(() => {
      set({ success: false });
    }, duration);
  },

  fetchCreatorData: async (username) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/creator/${username}`, {
        credentials: 'include', // Include cookies for CSRF
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch creator');
      }

      const data = await response.json();
      
      // Parse tiers if it's a string, otherwise use as is
      const parsedTiers = typeof data.tiers === 'string' 
        ? safeJSONParse(data.tiers, { "0": { name: '', price: '' } })
        : data.tiers || { "0": { name: '', price: '' } };

      // Handle perks - ensure it's an array with the correct structure
      let parsedPerks = data.perks;
      if (typeof data.perks === 'string') {
        parsedPerks = safeJSONParse(data.perks, [{ name: '', desc: '' }]);
      }
      if (!Array.isArray(parsedPerks)) {
        parsedPerks = [{ name: '', desc: '' }];
      }

      // Set the state
      set({
        creatorData: data,
        id: data.id || '',
        title: data.title || '',
        loading: false,
        description: data.desc || '',
        tiers: parsedTiers,
        perks: parsedPerks,
        youtubeUrl: data.youtube_video_id ? `https://www.youtube.com/watch?v=${data.youtube_video_id}` : '',
        telegram_group_id: data.telegram_group_id || null,
        avatarUrl: data.avatar_url || null,
        error: null
      });

    } catch (error) {
      console.error('Error fetching creator data:', error);
      set({ 
        error: sanitizeErrorMessage(error),
        loading: false
      });
    }
  },

  fetchAvatarUrl: async () => {
    try {
      const res = await fetch('/api/avatar', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      const data = await res.json();
      set({ avatarUrl: data.avatarUrl });
    } catch (error) {
      console.error('Error fetching avatar URL:', error);
      set({ error: sanitizeErrorMessage(error) });
    }
  },

  handleTierChange: (key, field, value) => {
    const currentTiers = get().tiers;
    const updatedTier = {
      ...currentTiers[key],
      [field]: field === 'price' ? value.replace(/[^\d.]/g, '').slice(0, 10) : value.slice(0, 100)
    };

    set({
      tiers: {
        ...currentTiers,
        [key]: updatedTier
      },
      error: null
    });
  },

  handlePerkChange: (index, field, value) => {
    const maxLength = field === 'desc' ? 500 : 100;
    const sanitizedValue = value.slice(0, maxLength);
    
    const perks = get().perks.map((perk, i) =>
      i === index ? { ...perk, [field]: sanitizedValue } : perk
    );
    
    set({ perks, error: null });
  },

  addPerk: () => {
    const perks = get().perks;
    if (perks.length < 10) { // Limit number of perks
      set({ perks: [...perks, { name: '', desc: '' }] });
    }
  },

  removePerk: (index) => {
    const perks = get().perks.filter((_, i) => i !== index);
    if (perks.length > 0) { // Ensure at least one perk remains
      set({ perks });
    }
  },

  handleSubmit: async (username) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const { title, tiers, description: desc, perks, youtubeUrl, telegram_group_id } = state;

      // Extract YouTube video ID if URL is present
      let youtube_video_id = null;
      if (youtubeUrl) {
        const videoId = extractYoutubeId(youtubeUrl);
        if (videoId) {
          youtube_video_id = videoId;
        }
      }

      const response = await fetch(`/api/creator/${username}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          desc,
          tiers,  // Send as is, API will handle stringification
          perks,  // Send as is, API will handle stringification
          youtube_video_id,
          telegram_group_id
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Failed to update creator data');
      }

      set({ 
        creatorData: responseData.data,
        loading: false,
        error: null,
        success: true
      });

      setTimeout(() => {
        set({ success: false });
      }, 3000);

    } catch (error) {
      console.error('Error updating creator:', error);
      set({ 
        error: sanitizeErrorMessage(error),
        loading: false
      });
    }
  },
}));

function extractYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default useProfileStore;