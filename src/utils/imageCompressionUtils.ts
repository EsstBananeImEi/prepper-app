/**
 * Utility functions for image compression and optimization
 */

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export class ImageCompressionUtils {
    /**
     * Compress an image file to reduce size while maintaining quality
     */
    static compressImage(
        file: File,
        options: CompressionOptions = {}
    ): Promise<File> {
        return new Promise((resolve, reject) => {
            const {
                maxWidth = 400,
                maxHeight = 400,
                quality = 0.8,
                outputFormat = 'image/jpeg'
            } = options;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;

                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height;

                    if (width > height) {
                        width = maxWidth;
                        height = maxWidth / aspectRatio;
                    } else {
                        height = maxHeight;
                        width = maxHeight * aspectRatio;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx!.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File(
                                [blob],
                                file.name.replace(/\.[^/.]+$/, '') + '.' + outputFormat.split('/')[1],
                                {
                                    type: outputFormat,
                                    lastModified: Date.now()
                                }
                            );
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Bildkomprimierung fehlgeschlagen'));
                        }
                    },
                    outputFormat,
                    quality
                );
            };

            img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Convert File to compressed Base64 string
     */
    static async compressToBase64(
        file: File,
        options: CompressionOptions = {}
    ): Promise<string> {
        const compressedFile = await this.compressImage(file, options);

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('Base64 Konvertierung fehlgeschlagen'));
                }
            };
            reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
            reader.readAsDataURL(compressedFile);
        });
    }

    /**
     * Get optimal compression settings based on file size
     */
    static getOptimalCompressionSettings(fileSize: number): CompressionOptions {
        if (fileSize > 2 * 1024 * 1024) { // > 2MB
            return {
                maxWidth: 300,
                maxHeight: 300,
                quality: 0.6,
                outputFormat: 'image/jpeg'
            };
        } else if (fileSize > 1 * 1024 * 1024) { // > 1MB
            return {
                maxWidth: 400,
                maxHeight: 400,
                quality: 0.7,
                outputFormat: 'image/jpeg'
            };
        } else {
            return {
                maxWidth: 500,
                maxHeight: 500,
                quality: 0.8,
                outputFormat: 'image/jpeg'
            };
        }
    }
}
