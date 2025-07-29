import { getLinkPreview, getPlatformInfo } from "../lib/linkPreview.js";

// Get link preview
export const getPreview = async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ message: "URL is required" });
        }

        // Validate URL
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({ message: "Invalid URL" });
        }

        const preview = await getLinkPreview(url);
        const platformInfo = getPlatformInfo(url);

        res.status(200).json({
            ...preview,
            platform: platformInfo,
        });
    } catch (error) {
        console.log("Error in getPreview controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}; 