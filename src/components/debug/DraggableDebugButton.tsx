import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Badge } from 'antd';
import { BugOutlined } from '@ant-design/icons';
import { apiDebugger } from '../../utils/apiDebugger';
import styles from './DraggableDebugButton.module.css';

interface Props {
    onClick: () => void;
}

interface Position {
    x: number;
    y: number;
}

export default function DraggableDebugButton({ onClick }: Props) {
    const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [errorCount, setErrorCount] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Set initial position based on screen size
    useEffect(() => {
        const updateInitialPosition = () => {
            const isMobile = window.innerWidth <= 600;
            if (isMobile) {
                // Mobile: above bottom navigation (90px from bottom)
                setPosition({
                    x: window.innerWidth - 70, // button width + margin
                    y: window.innerHeight - 140 // above bottom navigation
                });
            } else {
                // Desktop: bottom right corner
                setPosition({
                    x: window.innerWidth - 70,
                    y: window.innerHeight - 70
                });
            }
        };

        updateInitialPosition();
        window.addEventListener('resize', updateInitialPosition);
        return () => window.removeEventListener('resize', updateInitialPosition);
    }, []);

    // Update error count
    useEffect(() => {
        const interval = setInterval(() => {
            const healthStatus = apiDebugger.getHealthStatus();
            setErrorCount(healthStatus.errorCount);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Mouse event handlers for dragging
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Constrain to viewport
        const buttonSize = 56; // button dimensions
        const maxX = window.innerWidth - buttonSize;
        const maxY = window.innerHeight - buttonSize;

        setPosition({
            x: Math.max(10, Math.min(newX, maxX)),
            y: Math.max(10, Math.min(newY, maxY))
        });
    }, [isDragging, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch event handlers for mobile dragging
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!buttonRef.current) return;

        const touch = e.touches[0];
        const rect = buttonRef.current.getBoundingClientRect();
        setDragOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        });
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();

        const touch = e.touches[0];
        const newX = touch.clientX - dragOffset.x;
        const newY = touch.clientY - dragOffset.y;

        // Constrain to viewport
        const buttonSize = 56;
        const maxX = window.innerWidth - buttonSize;
        const maxY = window.innerHeight - buttonSize;

        setPosition({
            x: Math.max(10, Math.min(newX, maxX)),
            y: Math.max(10, Math.min(newY, maxY))
        });
    }, [isDragging, dragOffset]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onClick();
    }, [isDragging, onClick]);

    // Add global event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    return (
        <Badge count={errorCount} offset={[-8, 8]} size="small">
            <Button
                ref={buttonRef}
                type="primary"
                shape="circle"
                size="large"
                icon={<BugOutlined />}
                className={styles.debugButton}
                style={{
                    left: position.x,
                    top: position.y,
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onClick={handleClick}
            />
        </Badge>
    );
}
