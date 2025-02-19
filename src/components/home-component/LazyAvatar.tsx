import React, { useState, useEffect, useRef } from 'react';

interface LazyAvatarProps {
    src: string;
    size: number;
    className?: string;
    alt?: string;
}

export default function LazyAvatar({ src, size, className, alt = 'avatar' }: LazyAvatarProps) {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                });
            },
            { rootMargin: '100px' }
        );
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {isVisible ? (
                <img
                    src={src}
                    width={size}
                    height={size}
                    alt={alt}
                    style={{ borderRadius: '50%' }}
                    loading="lazy"
                />
            ) : (
                <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#f0f0f0' }} />
            )}
        </div>
    );
}
