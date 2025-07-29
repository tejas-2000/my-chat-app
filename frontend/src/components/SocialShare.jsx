import { Share2, Twitter, Facebook, Linkedin, Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const SocialShare = ({ message, url }) => {
    const [copied, setCopied] = useState(false);

    const shareText = message?.text || "Check out this message!";
    const shareUrl = url || window.location.href;

    const shareToTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    };

    const shareToFacebook = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    const shareToLinkedIn = () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=400');
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error("Failed to copy link");
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={shareToTwitter}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors"
                title="Share on Twitter"
            >
                <Twitter size={16} className="text-blue-500" />
            </button>

            <button
                onClick={shareToFacebook}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors"
                title="Share on Facebook"
            >
                <Facebook size={16} className="text-blue-600" />
            </button>

            <button
                onClick={shareToLinkedIn}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors"
                title="Share on LinkedIn"
            >
                <Linkedin size={16} className="text-blue-700" />
            </button>

            <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Copy link"
            >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
        </div>
    );
};

export default SocialShare; 