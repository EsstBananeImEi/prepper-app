/**
 * Utility functions for image processing and validation
 */
import i18n from '../i18n';

export interface ImageValidationResult {
    isValid: boolean;
    error?: string;
    processedData?: string;
}

/**
 * Detects image format from Base64 data by examining the binary signature
 */
function detectImageFormat(base64String: string): string {
    try {
        // Convert first few bytes of base64 to binary to check file signature
        const binaryString = window.atob(base64String.substring(0, 12));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Check file signatures
        if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
            return 'jpeg';
        }
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
            return 'png';
        }
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
            return 'gif';
        }
        if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
            return 'webp';
        }
        if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
            return 'bmp';
        }

        // Default to png if format cannot be detected
        return 'png';
    } catch {
        // If detection fails, default to png
        return 'png';
    }
}

/**
 * Validates and processes Base64 image data
 */
export function validateBase64Image(base64String: string): ImageValidationResult {
    const t = (key: string, opts?: Record<string, unknown>) => i18n.t(key, opts);
    if (!base64String || base64String.trim() === '') {
        return { isValid: false, error: t('utils.image.emptyData') };
    }

    try {
        // Check if it's a data URL format
        if (base64String.startsWith('data:image/')) {
            const parts = base64String.split(',');
            if (parts.length !== 2) {
                return { isValid: false, error: t('utils.image.invalidBase64Format') };
            }

            // Enhanced MIME type validation - support more formats
            const mimeMatch = parts[0].match(/data:image\/([a-zA-Z0-9+.-]*);base64/);
            if (!mimeMatch) {
                return { isValid: false, error: t('utils.image.invalidMimeType') };
            }

            const mimeType = mimeMatch[1].toLowerCase();
            const supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'bmp', 'svg+xml'];

            if (!supportedFormats.includes(mimeType)) {
                console.warn(`Unsupported image format detected: ${mimeType}`);
                return {
                    isValid: false,
                    error: t('utils.image.unsupportedFormat', { format: mimeType, supported: supportedFormats.join(', ') })
                };
            }

            const base64Data = parts[1];

            // Validate Base64 encoding
            if (!isValidBase64(base64Data)) {
                return { isValid: false, error: t('utils.image.invalidBase64') };
            }

            // Check file size (limit to 5MB)
            const sizeInBytes = (base64Data.length * 3) / 4;
            if (sizeInBytes > 5 * 1024 * 1024) {
                return {
                    isValid: false,
                    error: t('utils.image.imageTooLarge', { size: Math.round(sizeInBytes / 1024 / 1024 * 100) / 100 })
                };
            }

            return { isValid: true, processedData: base64String };
        } else {
            // If it's just Base64 without data URL prefix, try to detect format and add proper prefix
            if (isValidBase64(base64String)) {
                // Try to detect image format from base64 data
                const detectedFormat = detectImageFormat(base64String);
                return {
                    isValid: true,
                    processedData: `data:image/${detectedFormat};base64,${base64String}`
                };
            } else {
                return { isValid: false, error: t('utils.image.invalidBase64') };
            }
        }
    } catch (error) {
        return {
            isValid: false,
            error: t('utils.image.processingError', { error: error instanceof Error ? error.message : 'Unknown' })
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
                reject(new Error(i18n.t('utils.image.canvasContextUnavailable')));
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
            reject(new Error(i18n.t('utils.image.loadError')));
        };

        img.src = base64String;
    });
}

/**
 * Converts File to Base64 with validation
 */
export function fileToBase64(file: File): Promise<ImageValidationResult> {
    return new Promise((resolve) => {
        const t = (key: string, opts?: Record<string, unknown>) => i18n.t(key, opts);
        // Validate file type
        if (!file.type.startsWith('image/')) {
            resolve({ isValid: false, error: t('utils.image.fileTypeOnlyImages') });
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            resolve({ isValid: false, error: t('utils.image.fileTooLarge') });
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            const validation = validateBase64Image(result);
            resolve(validation);
        };

        reader.onerror = () => {
            resolve({ isValid: false, error: t('utils.image.fileReadError') });
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

/**
 * Validates and cleans storage items with corrupted image data
 * This function is used when loading storage items to ensure no corrupted images cause errors
 */
export function validateAndCleanStorageItems<T extends { icon?: string; id?: number | string; name?: string }>(items: T[]): T[] {
    if (!items || !Array.isArray(items)) {
        console.warn('Invalid storage items provided for validation');
        return [];
    }

    return items.map((item, index) => {
        if (!item.icon) {
            // No icon is valid
            return item;
        }

        try {
            const validation = validateBase64Image(item.icon);
            if (validation.isValid) {
                // Icon is valid, return as is
                return item;
            } else {                // Icon is corrupted, remove it and log warning
                console.warn(`Storage item ${index} has corrupted image data:`, validation.error);
                console.warn('Item details:', {
                    id: item.id,
                    name: item.name,
                    iconLength: item.icon?.length
                });

                return {
                    ...item,
                    icon: '' // Clear corrupted icon
                };
            }
        } catch (error) {            // Error during validation, clear icon
            console.error(`Error validating image for storage item ${index}:`, error);
            console.warn('Item details:', {
                id: item.id,
                name: item.name,
                iconLength: item.icon?.length
            });

            return {
                ...item,
                icon: '' // Clear corrupted icon
            };
        }
    });
}

/**
 * Attempts to repair corrupted Base64 image data
 */
export function repairBase64Image(base64String: string): ImageValidationResult {
    const t = (key: string, opts?: Record<string, unknown>) => i18n.t(key, opts);
    if (!base64String || base64String.trim() === '') {
        return { isValid: false, error: t('utils.image.emptyData') };
    }

    try {
        let cleanedString = base64String.trim();

        // Remove potential whitespace and newlines
        cleanedString = cleanedString.replace(/\s/g, '');

        // If it has data URL prefix, extract just the base64 part
        if (cleanedString.startsWith('data:image/')) {
            const parts = cleanedString.split(',');
            if (parts.length === 2) {
                cleanedString = parts[1];
            }
        }

        // Ensure proper padding
        while (cleanedString.length % 4 !== 0) {
            cleanedString += '=';
        }

        // Try to validate the repaired string
        if (isValidBase64(cleanedString)) {
            const detectedFormat = detectImageFormat(cleanedString);
            return {
                isValid: true,
                processedData: `data:image/${detectedFormat};base64,${cleanedString}`
            };
        } else {
            return { isValid: false, error: t('utils.image.repairFailed') };
        }
    } catch (error) {
        return {
            isValid: false,
            error: t('utils.image.repairError', { error: error instanceof Error ? error.message : 'Unknown' })
        };
    }
}

/**
 * Debug function to analyze image data and provide detailed information
 */
export function debugImageData(base64String: string, context: string = 'Unknown'): void {
    console.group(`🔍 Image Debug Analysis - ${context}`);

    if (!base64String) {
        console.warn('❌ No image data provided');
        console.groupEnd();
        return;
    }

    console.log('📊 Basic Info:');
    console.log('- Length:', base64String.length);
    console.log('- First 50 chars:', base64String.substring(0, 50));
    console.log('- Last 50 chars:', base64String.substring(Math.max(0, base64String.length - 50)));
    console.log('- Contains data URL prefix:', base64String.startsWith('data:'));

    if (base64String.startsWith('data:')) {
        const parts = base64String.split(',');
        console.log('📋 Data URL Info:');
        console.log('- Header:', parts[0]);
        console.log('- Data length:', parts[1]?.length || 0);

        if (parts[1]) {
            try {
                const detectedFormat = detectImageFormat(parts[1]);
                console.log('- Detected format:', detectedFormat);
            } catch (error) {
                console.warn('- Format detection failed:', error);
            }
        }
    } else {
        try {
            const detectedFormat = detectImageFormat(base64String);
            console.log('📋 Format Info:');
            console.log('- Detected format:', detectedFormat);
        } catch (error) {
            console.warn('- Format detection failed:', error);
        }
    }

    // Test Base64 validity
    try {
        const testData = base64String.startsWith('data:') ? base64String.split(',')[1] : base64String;
        if (testData) {
            window.atob(testData.substring(0, Math.min(100, testData.length)));
            console.log('✅ Base64 validation: VALID');
        }
    } catch (error) {
        console.error('❌ Base64 validation: INVALID', error);
    }

    // Run full validation
    const validation = validateBase64Image(base64String);
    console.log('🔧 Validation Result:', validation);

    console.groupEnd();
}
