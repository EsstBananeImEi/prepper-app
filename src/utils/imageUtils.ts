
/**
 * Utility functions for image processing and validation
 */

export interface ImageValidationResult {
    isValid: boolean;
    error?: string;
    processedData?: string;
}

/**
 * Validates and processes Base64 image data
 */
export function validateBase64Image(base64String: string): ImageValidationResult {
    if (!base64String || base64String.trim() === '') {
        return { isValid: false, error: 'Leere Bilddaten' };
    }

    try {
        // Check if it's a data URL format
        if (base64String.startsWith('data:image/')) {
            const parts = base64String.split(',');
            if (parts.length !== 2) {
                return { isValid: false, error: 'Ungültiges Base64-Format' };
            }

            const mimeType = parts[0].match(/data:image\/([a-zA-Z]*);base64/)?.[1];
            if (!mimeType || !['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(mimeType.toLowerCase())) {
                return { isValid: false, error: 'Nicht unterstütztes Bildformat' };
            }

            const base64Data = parts[1];

            // Validate Base64 encoding
            if (!isValidBase64(base64Data)) {
                return { isValid: false, error: 'Ungültige Base64-Kodierung' };
            }

            // Check file size (limit to 5MB)
            const sizeInBytes = (base64Data.length * 3) / 4;
            if (sizeInBytes > 5 * 1024 * 1024) {
                return { isValid: false, error: 'Bild ist zu groß (max. 5MB)' };
            }

            return { isValid: true, processedData: base64String };
        } else {
            // If it's just Base64 without data URL prefix, add proper prefix
            if (isValidBase64(base64String)) {
                return {
                    isValid: true,
                    processedData: `data:image/png;base64,${base64String}`
                };
            } else {
                return { isValid: false, error: 'Ungültige Base64-Kodierung' };
            }
        }
    } catch (error) {
        return {
            isValid: false,
            error: `Fehler bei der Bildverarbeitung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
        };
    }
}

/**
 * Validates Base64 string format
 */
function isValidBase64(str: string): boolean {
    try {
        // Remove any whitespace
        const cleanStr = str.replace(/\s/g, '');

        // Check if string contains only valid Base64 characters
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(cleanStr)) {
            return false;
        }

        // Check if length is multiple of 4
        if (cleanStr.length % 4 !== 0) {
            return false;
        }

        // Try to decode
        window.atob(cleanStr);
        return true;
    } catch {
        return false;
    }
}

/**
 * Compresses image if needed
 */
export function compressBase64Image(
    base64String: string,
    maxWidth: number = 800,
    maxHeight: number = 600,
    quality: number = 0.8
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Canvas context nicht verfügbar'));
                return;
            }

            // Calculate new dimensions
            let { width, height } = img;
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };

        img.onerror = () => {
            reject(new Error('Fehler beim Laden des Bildes'));
        };

        img.src = base64String;
    });
}

/**
 * Converts File to Base64 with validation
 */
export function fileToBase64(file: File): Promise<ImageValidationResult> {
    return new Promise((resolve) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            resolve({ isValid: false, error: 'Nur Bilddateien sind erlaubt' });
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            resolve({ isValid: false, error: 'Datei ist zu groß (max. 5MB)' });
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            const validation = validateBase64Image(result);
            resolve(validation);
        };

        reader.onerror = () => {
            resolve({ isValid: false, error: 'Fehler beim Lesen der Datei' });
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Sanitizes Base64 string for API transmission
 */
export function sanitizeBase64ForApi(base64String: string): string {
    if (!base64String) return '';

    // Remove data URL prefix for API transmission
    if (base64String.startsWith('data:image/')) {
        return base64String.split(',')[1] || '';
    }

    return base64String;
}

/**
 * Adds data URL prefix if missing
 */
export function ensureDataUrlPrefix(base64String: string, mimeType: string = 'image/png'): string {
    if (!base64String) return '';

    if (base64String.startsWith('data:image/')) {
        return base64String;
    }

    return `data:${mimeType};base64,${base64String}`;
}
