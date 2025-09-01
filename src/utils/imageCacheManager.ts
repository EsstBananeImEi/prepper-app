import logger from './logger';
/**
 * Image cache manager using localStorage with size limits and expiration
 */

interface CachedImage {
    data: string; // Base64 image data
    timestamp: number;
    size: number; // Size in bytes
    groupId: number;
}

interface CacheStats {
    totalSize: number;
    imageCount: number;
    oldestTimestamp: number;
}

export class ImageCacheManager {
    private static readonly CACHE_KEY_PREFIX = 'group_image_';
    private static readonly MAX_CACHE_SIZE = 10 * 1024 * 1024; // 10MB max cache
    private static readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

    /**
     * Store an image in cache
     */
    static cacheImage(groupId: number, imageData: string): void {
        try {
            const cacheKey = this.getCacheKey(groupId);
            const imageSize = this.calculateBase64Size(imageData);

            // Check if we need to clean cache before storing
            this.ensureCacheSpace(imageSize);

            const cachedImage: CachedImage = {
                data: imageData,
                timestamp: Date.now(),
                size: imageSize,
                groupId
            };

            localStorage.setItem(cacheKey, JSON.stringify(cachedImage));
            logger.log(`Image cached for group ${groupId}, size: ${this.formatBytes(imageSize)}`);
        } catch (error) {
            logger.warn('Failed to cache image:', error);
            // If localStorage is full, try to clean and retry once
            this.cleanExpiredImages();
            try {
                const cacheKey = this.getCacheKey(groupId);
                const cachedImage: CachedImage = {
                    data: imageData,
                    timestamp: Date.now(),
                    size: this.calculateBase64Size(imageData),
                    groupId
                };
                localStorage.setItem(cacheKey, JSON.stringify(cachedImage));
            } catch (retryError) {
                logger.error('Failed to cache image after cleanup:', retryError);
            }
        }
    }

    /**
     * Retrieve an image from cache
     */
    static getCachedImage(groupId: number): string | null {
        try {
            const cacheKey = this.getCacheKey(groupId);
            const cached = localStorage.getItem(cacheKey);

            if (!cached) {
                return null;
            }

            const cachedImage: CachedImage = JSON.parse(cached);

            // Check if cache is expired
            if (Date.now() - cachedImage.timestamp > this.CACHE_EXPIRY) {
                this.removeCachedImage(groupId);
                return null;
            }

            return cachedImage.data;
        } catch (error) {
            logger.warn('Failed to retrieve cached image:', error);
            return null;
        }
    }

    /**
     * Remove a specific image from cache
     */
    static removeCachedImage(groupId: number): void {
        try {
            const cacheKey = this.getCacheKey(groupId);
            localStorage.removeItem(cacheKey);
        } catch (error) {
            logger.warn('Failed to remove cached image:', error);
        }
    }

    /**
     * Clean expired images from cache
     */
    static cleanExpiredImages(): void {
        const now = Date.now();
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const cachedImage: CachedImage = JSON.parse(cached);
                        if (now - cachedImage.timestamp > this.CACHE_EXPIRY) {
                            keysToRemove.push(key);
                        }
                    }
                } catch (error) {
                    // If we can't parse it, remove it
                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        if (keysToRemove.length > 0) {
            logger.log(`Cleaned ${keysToRemove.length} expired images from cache`);
        }
    }

    /**
     * Get cache statistics
     */
    static getCacheStats(): CacheStats {
        let totalSize = 0;
        let imageCount = 0;
        let oldestTimestamp = Date.now();

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const cachedImage: CachedImage = JSON.parse(cached);
                        totalSize += cachedImage.size;
                        imageCount++;
                        if (cachedImage.timestamp < oldestTimestamp) {
                            oldestTimestamp = cachedImage.timestamp;
                        }
                    }
                } catch (error) {
                    // Skip invalid entries
                }
            }
        }

        return { totalSize, imageCount, oldestTimestamp };
    }

    /**
     * Clear all cached images
     */
    static clearAllCache(): void {
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        logger.log(`Cleared ${keysToRemove.length} images from cache`);
    }

    /**
     * Ensure there's enough space in cache
     */
    private static ensureCacheSpace(newImageSize: number): void {
        const stats = this.getCacheStats();

        if (stats.totalSize + newImageSize > this.MAX_CACHE_SIZE) {
            // First try cleaning expired images
            this.cleanExpiredImages();

            const newStats = this.getCacheStats();
            if (newStats.totalSize + newImageSize > this.MAX_CACHE_SIZE) {
                // If still not enough space, remove oldest images
                this.removeOldestImages(newImageSize);
            }
        }
    }

    /**
     * Remove oldest images to make space
     */
    private static removeOldestImages(requiredSpace: number): void {
        const imagesToRemove: { key: string; timestamp: number; size: number }[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const cachedImage: CachedImage = JSON.parse(cached);
                        imagesToRemove.push({
                            key,
                            timestamp: cachedImage.timestamp,
                            size: cachedImage.size
                        });
                    }
                } catch (error) {
                    // Add invalid entries for removal
                    imagesToRemove.push({ key, timestamp: 0, size: 0 });
                }
            }
        }

        // Sort by timestamp (oldest first)
        imagesToRemove.sort((a, b) => a.timestamp - b.timestamp);

        let freedSpace = 0;
        for (const image of imagesToRemove) {
            localStorage.removeItem(image.key);
            freedSpace += image.size;

            if (freedSpace >= requiredSpace) {
                break;
            }
        }

        logger.log(`Freed ${this.formatBytes(freedSpace)} by removing old images`);
    }

    /**
     * Calculate Base64 string size in bytes
     */
    private static calculateBase64Size(base64String: string): number {
        // Remove data URL prefix if present
        const base64Data = base64String.includes(',')
            ? base64String.split(',')[1]
            : base64String;

        // Calculate size: (base64 length * 3/4) - padding
        const padding = (base64Data.match(/=/g) || []).length;
        return Math.floor(base64Data.length * 3 / 4) - padding;
    }

    /**
     * Format bytes to human readable string
     */
    private static formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Generate cache key for group image
     */
    private static getCacheKey(groupId: number): string {
        return `${this.CACHE_KEY_PREFIX}${groupId}`;
    }
}
