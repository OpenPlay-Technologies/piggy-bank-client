import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

/**
 * Generate a brand-new Ed25519 keypair
 */
export const generateKeypair = (): Ed25519Keypair => {
    return Ed25519Keypair.generate();
};

/**
 * Save an Ed25519 keypair to localStorage
 */
export const storeKeypair = (keypair: Ed25519Keypair) => {
    // The `export()` method returns the private key bytes in `privateKey`
    // and the public key bytes in `publicKey`.
    const exported = keypair.getSecretKey();
    // Store in localStorage as JSON
    localStorage.setItem('suiKeypair', exported);
};

/**
 * Retrieve an Ed25519 keypair from localStorage
 */
export const getStoredKeypair = (): Ed25519Keypair | null => {
    const item = localStorage.getItem('suiKeypair');
    if (!item) return null;

    try {
        return Ed25519Keypair.fromSecretKey(item);
    } catch (err) {
        console.error('Failed to parse stored Sui keypair:', err);
        return null;
    }
};

/**
 * Get or create an Ed25519 keypair.
 * - If one is stored, use it.
 * - If not, generate a new one and store it.
 */
export const getOrCreateKeypair = (): Ed25519Keypair => {
    let keypair = getStoredKeypair();
    if (!keypair) {
        keypair = generateKeypair();
        storeKeypair(keypair);
    }
    return keypair;
};

export const getEnvKeypair = (): Ed25519Keypair => {
    const secretKey = import.meta.env.VITE_KEYPAIR_SECRET_KEY;
    return Ed25519Keypair.fromSecretKey(secretKey);
}
