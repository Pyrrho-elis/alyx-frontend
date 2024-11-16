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
  loading: true,
  error: '',
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
    set({ loading: true, error: '' });
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
      
      const parsedTiers = safeJSONParse(data.tiers, { "0": { name: '', price: '' } });
      const parsedPerks = safeJSONParse(data.perks, [{ name: '', desc: '' }]);

      // Validate parsed data
      const validatedData = {
        creatorData: data,
        id: data.id || '',
        title: data.title || '',
        tiers: parsedTiers,
        description: data.desc || '',
        perks: Array.isArray(parsedPerks) ? parsedPerks : [{ name: '', desc: '' }],
        youtubeUrl: data.youtube_video_id ? `https://www.youtube.com/watch?v=${data.youtube_video_id}` : '',
      };

      try {
        ProfileSchema.parse(validatedData);
        set(validatedData);
      } catch (validationError) {
        console.error('Validation Error:', validationError);
        throw new Error('ValidationError');
      }
    } catch (error) {
      set({ error: sanitizeErrorMessage(error) });
    } finally {
      set({ loading: false });
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
    try {
      const currentTiers = get().tiers;
      const updatedTier = {
        ...currentTiers[key],
        [field]: field === 'price' ? value.replace(/[^\d.]/g, '').slice(0, 10) : value.slice(0, 100)
      };

      // Validate the updated tier
      TierSchema.parse(updatedTier);

      set({
        tiers: {
          ...currentTiers,
          [key]: updatedTier
        }
      });
    } catch (error) {
      console.error('Tier validation error:', error);
      // Don't update state if validation fails
    }
  },

  handlePerkChange: (index, field, value) => {
    try {
      const maxLength = field === 'desc' ? 500 : 100;
      const sanitizedValue = value.slice(0, maxLength);
      
      const perks = get().perks.map((perk, i) =>
        i === index ? { ...perk, [field]: sanitizedValue } : perk
      );

      // Validate the updated perk
      PerkSchema.parse(perks[index]);
      
      set({ perks });
    } catch (error) {
      console.error('Perk validation error:', error);
      // Don't update state if validation fails
    }
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
    const { title, tiers, description, perks, youtubeUrl } = get();
    const youtubeId = validateYoutubeUrl(youtubeUrl);

    try {
      // Validate all data before submission
      const profileData = {
        title,
        tiers,
        description,
        perks,
        youtubeUrl
      };

      ProfileSchema.parse(profileData);

      const response = await fetch(`/api/creator/${username}`, {
        method: 'PUT',
        credentials: 'include', // Include cookies for CSRF
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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

      const updatedCreatorData = await response.json();
      set({ creatorData: updatedCreatorData });
      get().setSuccessWithTimeout(true);
    } catch (error) {
      console.error('Error updating creator data:', error);
      set({ error: sanitizeErrorMessage(error) });
    }
  },
}));

function extractYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default useProfileStore;