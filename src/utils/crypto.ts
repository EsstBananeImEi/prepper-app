// Web Crypto helpers for encrypting auth payloads with server public key (RSA-OAEP, SHA-256)
export function pemToArrayBuffer(pem: string): ArrayBuffer {
    const b64 = pem
        .replace(/-----BEGIN [^-]+-----/, '')
        .replace(/-----END [^-]+-----/, '')
        .replace(/\s+/g, '');
    const bin = atob(b64);
    const len = bin.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
}

export async function importPublicKeyFromPem(spkiPem: string): Promise<CryptoKey> {
    const buf = pemToArrayBuffer(spkiPem);
    return await crypto.subtle.importKey(
        'spki',
        buf,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
    );
}

export type EncryptedHybridPayload = {
    key: string; // RSA-OAEP(base64) encrypted AES key
    iv: string; // base64 iv for AES-GCM
    data: string; // base64 ciphertext AES-GCM
};

export async function encryptForServer(pubKey: CryptoKey, obj: unknown): Promise<EncryptedHybridPayload> {
    // 1) generate AES-GCM key
    const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const rawAes = await crypto.subtle.exportKey('raw', aesKey) as ArrayBuffer;

    // 2) encrypt raw AES key with RSA-OAEP
    const encKeyBuf = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubKey, rawAes);

    // 3) encrypt data with AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plain = new TextEncoder().encode(JSON.stringify(obj));
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plain);

    // helper base64
    const toB64 = (buf: ArrayBuffer | Uint8Array) => {
        const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf as ArrayBuffer);
        let s = '';
        for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
        return btoa(s);
    };

    return {
        key: toB64(encKeyBuf as ArrayBuffer),
        iv: toB64(iv),
        data: toB64(cipherBuf as ArrayBuffer),
    };
}
