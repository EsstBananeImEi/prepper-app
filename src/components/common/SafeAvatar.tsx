import React, { useState, useCallback } from 'react';
import { Avatar } from 'antd';
import { AvatarProps } from 'antd/lib/avatar';
import { UserOutlined } from '@ant-design/icons';
import { validateBase64Image, ensureDataUrlPrefix } from '../../utils/imageUtils';

interface SafeAvatarProps extends Omit<AvatarProps, 'src'> {
    src?: string;
    fallbackIcon?: React.ReactNode;
    showWarnings?: boolean;
}

/**
 * SafeAvatar component that handles corrupted image data gracefully
 * Validates Base64 images and falls back to default icon if invalid
 */
export default function SafeAvatar({
    src,
    fallbackIcon = <UserOutlined />,
    showWarnings = false,
    ...props
}: SafeAvatarProps) {
    const [hasImageError, setHasImageError] = useState(false);

    // Validate and process image source - memoize to prevent infinite re-renders
    const getValidImageSrc = useCallback(() => {
        if (!src || hasImageError) {
            return undefined;
        }

        try {
            const validation = validateBase64Image(src);
            if (validation.isValid && validation.processedData) {
                return ensureDataUrlPrefix(validation.processedData);
            } else {
                if (showWarnings && process.env.NODE_ENV === 'development') {
                    console.warn('SafeAvatar: Invalid image data detected:', validation.error);
                }
                setHasImageError(true);
                return undefined;
            }
        } catch (error) {
            if (showWarnings && process.env.NODE_ENV === 'development') {
                console.error('SafeAvatar: Error processing image:', error);
            }
            setHasImageError(true);
            return undefined;
        }
    }, [src, showWarnings]); // Remove hasImageError from dependencies to prevent loops

    const handleImageError = useCallback(() => {
        if (showWarnings) {
            console.warn('SafeAvatar: Image failed to load, falling back to icon');
        }
        setHasImageError(true);
        return false; // Return false to use Avatar's default fallback behavior
    }, [showWarnings]);

    const validSrc = getValidImageSrc();

    return (
        <Avatar
            {...props}
            src={validSrc}
            icon={!validSrc ? fallbackIcon : undefined}
            onError={handleImageError}
        />
    );
}
