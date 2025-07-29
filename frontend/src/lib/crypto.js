// Crypto utilities for end-to-end encryption

// Generate a new encryption key
export async function generateKey() {
    const key = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
    return key;
}

// Export key to string for storage
export async function exportKey(key) {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import key from string
export async function importKey(keyString) {
    const keyData = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
        "raw",
        keyData,
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

// Encrypt data
export async function encrypt(data, key) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encodedData
    );

    return {
        data: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
        iv: btoa(String.fromCharCode(...iv)),
    };
}

// Decrypt data
export async function decrypt(encryptedData, iv, key) {
    try {
        const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
        const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: ivBytes,
            },
            key,
            encryptedBytes
        );

        const decodedData = new TextDecoder().decode(decryptedData);
        return JSON.parse(decodedData);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}

// Generate a key pair for each user
export async function generateUserKeys() {
    const encryptionKey = await generateKey();
    const exportedKey = await exportKey(encryptionKey);

    return {
        key: encryptionKey,
        exportedKey: exportedKey,
    };
}

// Derive a shared key for two users
export async function deriveSharedKey(user1Key, user2Key) {
    // For simplicity, we'll use a combination of both keys
    // In a real implementation, you'd use proper key derivation
    const combinedKey = user1Key + user2Key;
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedKey);

    const hash = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = new Uint8Array(hash);

    return await window.crypto.subtle.importKey(
        "raw",
        hashArray.slice(0, 32), // Use first 32 bytes for AES-256
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
} 