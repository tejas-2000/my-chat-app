import { useState } from "react";
import { Upload, File, Image, Video, Music, X } from "lucide-react";
import toast from "react-hot-toast";

const FileUpload = ({ onFileSelect, onClose }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files) => {
        setUploading(true);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    toast.error(`${file.name} is too large. Maximum size is 10MB.`);
                    continue;
                }

                // Validate file type
                const allowedTypes = [
                    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                    'video/mp4', 'video/webm', 'video/ogg',
                    'audio/mpeg', 'audio/wav', 'audio/ogg',
                    'application/pdf', 'text/plain', 'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ];

                if (!allowedTypes.includes(file.type)) {
                    toast.error(`${file.name} is not a supported file type.`);
                    continue;
                }

                // Convert to base64 for upload
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target.result;
                    onFileSelect({
                        file,
                        base64,
                        type: file.type.startsWith('image/') ? 'image' :
                            file.type.startsWith('video/') ? 'video' :
                                file.type.startsWith('audio/') ? 'audio' : 'document'
                    });
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            toast.error("Error processing files");
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'image':
                return <Image size={24} />;
            case 'video':
                return <Video size={24} />;
            case 'audio':
                return <Music size={24} />;
            default:
                return <File size={24} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Upload Files
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Drag and drop files here, or
                    </p>
                    <label className="cursor-pointer">
                        <span className="text-blue-500 hover:text-blue-600 font-medium">
                            browse files
                        </span>
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleChange}
                            accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
                        />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Max file size: 10MB
                    </p>
                </div>

                {uploading && (
                    <div className="mt-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Processing files...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload; 