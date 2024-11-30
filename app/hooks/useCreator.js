'use client'

import { useState, useEffect } from "react";

export function useCreator({ username }) {
    const [creator, setCreator] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getCreatorData(username) {
            try {
                const response = await fetch(`/api/creator/${username}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch creator data');
                }
                const data = await response.json();
                setCreator(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching creator:', err);
                setError(err.message);
                setCreator(null);
            } finally {
                setLoading(false);
            }
        }

        if (username) {
            setLoading(true);
            getCreatorData(username);
        } else {
            setLoading(false);
        }
    }, [username]);

    return { creator, loading, error };
}