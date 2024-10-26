export default async function getCreatorData(username) {
    const response = await fetch(`/api/creator/${username}`);
    if (!response.ok) {
        throw new Error('Failed to fetch creator data');
    }
    const data = await response.json();
    return data;
}