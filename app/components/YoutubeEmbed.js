import React from 'react'
export default function YoutubeEmbed({ videoId }) {
    if (!videoId) return null;
    return (
        <div className="aspect-w-16 aspect-h-9 mb-4">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
            ></iframe>
        </div>
    )
}
