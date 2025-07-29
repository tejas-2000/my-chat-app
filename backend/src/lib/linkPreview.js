import axios from "axios";
import { JSDOM } from "jsdom";

// Extract metadata from a URL
export async function getLinkPreview(url) {
    try {
        const response = await axios.get(url, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        // Extract Open Graph and meta tags
        const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
            document.querySelector('title')?.textContent ||
            'No title';

        const description = document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
            document.querySelector('meta[name="description"]')?.getAttribute('content') ||
            'No description';

        const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
            document.querySelector('meta[property="twitter:image"]')?.getAttribute('content') ||
            '';

        const siteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
            new URL(url).hostname;

        const type = document.querySelector('meta[property="og:type"]')?.getAttribute('content') || 'website';

        return {
            url,
            title: title.trim(),
            description: description.trim(),
            image,
            siteName,
            type,
            domain: new URL(url).hostname,
        };
    } catch (error) {
        console.error('Error fetching link preview:', error);
        return {
            url,
            title: 'Link Preview Unavailable',
            description: 'Unable to load preview for this link',
            image: '',
            siteName: new URL(url).hostname,
            type: 'website',
            domain: new URL(url).hostname,
        };
    }
}

// Check if URL is from a supported platform
export function getPlatformInfo(url) {
    const domain = new URL(url).hostname.toLowerCase();

    const platforms = {
        'youtube.com': {
            name: 'YouTube',
            icon: '🎥',
            color: '#FF0000',
            type: 'video'
        },
        'youtu.be': {
            name: 'YouTube',
            icon: '🎥',
            color: '#FF0000',
            type: 'video'
        },
        'spotify.com': {
            name: 'Spotify',
            icon: '🎵',
            color: '#1DB954',
            type: 'music'
        },
        'open.spotify.com': {
            name: 'Spotify',
            icon: '🎵',
            color: '#1DB954',
            type: 'music'
        },
        'twitter.com': {
            name: 'Twitter',
            icon: '🐦',
            color: '#1DA1F2',
            type: 'social'
        },
        'x.com': {
            name: 'X (Twitter)',
            icon: '🐦',
            color: '#1DA1F2',
            type: 'social'
        },
        'instagram.com': {
            name: 'Instagram',
            icon: '📷',
            color: '#E4405F',
            type: 'social'
        },
        'facebook.com': {
            name: 'Facebook',
            icon: '📘',
            color: '#1877F2',
            type: 'social'
        },
        'linkedin.com': {
            name: 'LinkedIn',
            icon: '💼',
            color: '#0A66C2',
            type: 'professional'
        },
        'github.com': {
            name: 'GitHub',
            icon: '💻',
            color: '#181717',
            type: 'development'
        },
        'drive.google.com': {
            name: 'Google Drive',
            icon: '☁️',
            color: '#4285F4',
            type: 'storage'
        },
        'dropbox.com': {
            name: 'Dropbox',
            icon: '📦',
            color: '#0061FF',
            type: 'storage'
        }
    };

    return platforms[domain] || {
        name: 'Website',
        icon: '🌐',
        color: '#6B7280',
        type: 'website'
    };
} 