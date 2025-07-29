import { Lock, Unlock } from "lucide-react";
import { useEncryptionStore } from "../store/useEncryptionStore.jsx";

const EncryptionToggle = () => {
    const { isEncryptionEnabled, toggleEncryption } = useEncryptionStore();

    return (
        <button
            onClick={toggleEncryption}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isEncryptionEnabled
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
            title={isEncryptionEnabled ? "Encryption enabled" : "Encryption disabled"}
        >
            {isEncryptionEnabled ? (
                <>
                    <Lock size={16} />
                    <span className="text-sm font-medium">Encrypted</span>
                </>
            ) : (
                <>
                    <Unlock size={16} />
                    <span className="text-sm font-medium">Unencrypted</span>
                </>
            )}
        </button>
    );
};

export default EncryptionToggle; 