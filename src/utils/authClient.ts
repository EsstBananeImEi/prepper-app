import { importPublicKeyFromPem, encryptForServer, EncryptedHybridPayload } from './crypto';
import { baseApiUrl } from '../shared/Constants';

// In-memory only cache for the public PEM. Never persist to localStorage.
let _cachedPem: string | null = null;

async function fetchServerPublicKey(): Promise<string | null> {
    if (_cachedPem) return _cachedPem;
    // Try backend host (baseApiUrl) first, fall back to same-origin
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const candidates = [] as string[];
    // if baseApiUrl is configured, try it first
    if (baseApiUrl) candidates.push(`${baseApiUrl}/auth/public-key`);
    // always try relative path as fallback
    candidates.push(`/auth/public-key`);

    for (const u of candidates) {
        try {
            const r = await fetch(u, { cache: 'no-store', headers: { 'Cache-Control': 'no-store' }, signal: controller.signal });
            if (!r.ok) continue;
            const pem = await r.text();
            if (pem && pem.includes('BEGIN PUBLIC KEY')) {
                _cachedPem = pem; // store only in RAM for session
                return pem;
            }
        } catch (e) {
            // try next
        }
    }
    clearTimeout(timeout);
    return null;
}

export async function encryptedPost(url: string, payload: Record<string, unknown>) {
    const pem = await fetchServerPublicKey();
    if (!pem) {
        // fallback: send plaintext (over TLS)
        return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }
    // Try importing the public key first. If import fails, fallback to plaintext and mark reason.
    try {
        const pubKey = await importPublicKeyFromPem(pem);
        try {
            const encrypted = await encryptForServer(pubKey, payload) as EncryptedHybridPayload;
            return fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Client-Encrypted': 'true' },
                body: JSON.stringify({ payload: encrypted }),
            });
        } catch (encErr) {
            // encryption failed (likely data too large for RSA-only approach was previous cause)
            // eslint-disable-next-line no-console
            console.warn('Encryption failed, falling back to plaintext POST:', encErr);
            return fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Client-Encrypted': 'false', 'X-Client-Encrypt-Err': 'encrypt_failed' },
                body: JSON.stringify(payload),
            });
        }
    } catch (impErr) {
        // import failed
        // eslint-disable-next-line no-console
        console.warn('Public key import failed, falling back to plaintext POST:', impErr);
        return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Client-Encrypted': 'false', 'X-Client-Encrypt-Err': 'import_failed' },
            body: JSON.stringify(payload),
        });
    }
}
