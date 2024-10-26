import { useState, useEffect } from "react";

export function useCreator({ username }) {
    const [creator, setCreator] = useState(null);

    useEffect(() => {
        async function getCreatorData(username) {
            const response = await fetch(`/api/creator/${username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch creator data');
            }
            const data = await response.json();
            return data;
        }
        if (username) {
            getCreatorData(username).then((data) => {
                setCreator(data);
            });
        }
    }, [username]);

    return { creator };
}