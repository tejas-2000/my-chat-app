import { axiosInstance } from "./axios";

// Get link preview from backend
export const getLinkPreview = async (url) => {
    try {
        const response = await axiosInstance.get(`/links/preview?url=${encodeURIComponent(url)}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching link preview:", error);
        return null;
    }
};

// Extract URLs from text
export const extractUrls = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
};

// Check if text contains URLs
export const hasUrls = (text) => {
    return extractUrls(text).length > 0;
}; 