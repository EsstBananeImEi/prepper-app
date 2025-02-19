import React, { useState, useEffect, useRef } from "react";

interface LazyAvatarProps {
    src: string;
    placeholderSrc?: string;
    size: number;
    className?: string;
    alt?: string;
}

export default function LazyAvatar({
    src,
    placeholderSrc = "/placeholder.png",
    size,
    className,
    alt = "avatar"
}: LazyAvatarProps) {
    const [imageSrc, setImageSrc] = useState(placeholderSrc);
    const [isLoaded, setIsLoaded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = new Image();
                        img.src = src;
                        img.onload = () => {
                            setImageSrc(src);
                            setIsLoaded(true);
                        };
                        observer.disconnect();
                    }
                });
            },
            { rootMargin: "100px" }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [src]);

    return (
        <div ref={containerRef} className={className} style={{ width: size, height: size }}>
            <img
                src={imageSrc}
                width={size}
                height={size}
                alt={alt}
                loading="lazy"
                fetchPriority="low"
                style={{
                    borderRadius: "50%",
                    transition: "opacity 0.5s ease-in-out",
                    opacity: isLoaded ? 1 : 0.5,
                    filter: isLoaded ? "none" : "blur(10px)"
                }}
            />
        </div>
    );
}
