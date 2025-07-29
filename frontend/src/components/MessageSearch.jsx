import { useState, useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const MessageSearch = ({ onSearch, searchResults, isGroup = false }) => {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const { authUser } = useAuthStore();

    useEffect(() => {
        if (query.trim().length > 0) {
            setIsSearching(true);
            const timeoutId = setTimeout(() => {
                onSearch(query);
                setIsSearching(false);
            }, 300);

            return () => clearTimeout(timeoutId);
        } else {
            onSearch("");
            setCurrentResultIndex(0);
        }
    }, [query, onSearch]);

    const highlightText = (text, searchQuery) => {
        if (!searchQuery || !text) return text;

        const regex = new RegExp(`(${searchQuery})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
                    {part}
                </mark>
            ) : part
        );
    };

    const navigateToResult = (direction) => {
        if (searchResults.length === 0) return;

        if (direction === "next") {
            setCurrentResultIndex((prev) =>
                prev < searchResults.length - 1 ? prev + 1 : 0
            );
        } else {
            setCurrentResultIndex((prev) =>
                prev > 0 ? prev - 1 : searchResults.length - 1
            );
        }
    };

    const clearSearch = () => {
        setQuery("");
        setCurrentResultIndex(0);
        onSearch("");
    };

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder="Search messages..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Search Results */}
            {query && (
                <div className="mt-4">
                    {isSearching ? (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            Searching...
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div>
                            {/* Navigation */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigateToResult("prev")}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        disabled={searchResults.length === 0}
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {currentResultIndex + 1} of {searchResults.length}
                                    </span>
                                    <button
                                        onClick={() => navigateToResult("next")}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        disabled={searchResults.length === 0}
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Results List */}
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {searchResults.map((message, index) => (
                                    <div
                                        key={message._id}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${index === currentResultIndex
                                                ? "bg-blue-100 dark:bg-blue-900"
                                                : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }`}
                                        onClick={() => setCurrentResultIndex(index)}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <img
                                                src={message.senderId.profilePic || "/avatar.png"}
                                                alt={message.senderId.fullName}
                                                className="w-6 h-6 rounded-full object-cover"
                                            />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {message.senderId.fullName}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(message.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {message.text && (
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {highlightText(message.text, query)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            No messages found for "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MessageSearch; 