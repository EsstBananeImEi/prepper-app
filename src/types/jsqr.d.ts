declare module 'jsqr' {
    export default function jsQR(data: Uint8ClampedArray, width: number, height: number, options?: { inversionAttempts?: 'dontInvert' | 'attemptBoth' | 'invertFirst' | 'attemptInvert' }): { data?: string; binaryData?: Uint8ClampedArray; location?: any } | null;
}
