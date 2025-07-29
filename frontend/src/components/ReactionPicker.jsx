import { useState } from "react";
import { Smile, Plus } from "lucide-react";

const ReactionPicker = ({ onSelectReaction, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showAllEmojis, setShowAllEmojis] = useState(false);

    const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🎉", "🔥", "💯"];
    const quickEmojis = commonEmojis.slice(0, 4); // Show only first 4 emojis

    const handleReactionSelect = (emoji, e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Adding reaction:", emoji);
        onSelectReaction(emoji);
        setIsOpen(false);
        setShowAllEmojis(false);
        onClose();
    };

    const handlePlusClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowAllEmojis(!showAllEmojis);
    };

    const handleToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Add reaction"
            >
                <Smile size={16} />
            </button>

            {isOpen && (
                <div
                    className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="grid grid-cols-4 gap-1">
                        {quickEmojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={(e) => handleReactionSelect(emoji, e)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
                            >
                                {emoji}
                            </button>
                        ))}
                        <button
                            onClick={handlePlusClick}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {showAllEmojis && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-5 gap-1">
                                {commonEmojis.map((emoji, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => handleReactionSelect(emoji, e)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReactionPicker; 