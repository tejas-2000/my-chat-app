import { ExternalLink, Play, Music, Image as ImageIcon } from "lucide-react";

const LinkPreview = ({ linkPreview }) => {
    if (!linkPreview) return null;

    const { url, title, description, image, siteName, platform } = linkPreview;

    const getPlatformIcon = (type) => {
        switch (type) {
            case 'video':
                return <Play size={16} />;
            case 'music':
                return <Music size={16} />;
            case 'image':
                return <ImageIcon size={16} />;
            default:
                return <ExternalLink size={16} />;
        }
    };

    const handleClick = (e) => {
        e.preventDefault();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <a
                href={url}
                onClick={handleClick}
                className="block hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
            >
                <div className="flex">
                    {image && (
                        <div className="w-24 h-24 flex-shrink-0">
                            <img
                                src={image}
                                alt={title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                    <div className="flex-1 p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{platform.icon}</span>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {platform.name}
                            </span>
                            {getPlatformIcon(platform.type)}
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                            {title}
                        </h4>
                        {description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {description}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                            {url}
                        </p>
                    </div>
                </div>
            </a>
        </div>
    );
};

export default LinkPreview; 