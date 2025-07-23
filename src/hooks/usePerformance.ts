import { useEffect } from 'react';

interface PerformanceMetrics {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
}

interface MemoryInfo {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
    memory?: MemoryInfo;
}

export const usePerformanceMonitoring = () => {
    useEffect(() => {
        // Performance-Metriken sammeln
        const collectMetrics = () => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

            if (navigation) {
                const metrics: PerformanceMetrics = {
                    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
                };

                // Web Vitals API nutzen, falls verfügbar
                if ('PerformanceObserver' in window) {
                    try {
                        // Largest Contentful Paint (LCP)
                        const lcpObserver = new PerformanceObserver((list) => {
                            const entries = list.getEntries();
                            const lastEntry = entries[entries.length - 1];
                            metrics.largestContentfulPaint = lastEntry.startTime;
                        });
                        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                        // First Contentful Paint (FCP)
                        const fcpObserver = new PerformanceObserver((list) => {
                            const entries = list.getEntries();
                            entries.forEach((entry) => {
                                if (entry.name === 'first-contentful-paint') {
                                    metrics.firstContentfulPaint = entry.startTime;
                                }
                            });
                        });
                        fcpObserver.observe({ entryTypes: ['paint'] });

                    } catch (error) {
                        console.warn('Performance Observer nicht unterstützt:', error);
                    }
                }

                // Metriken in Development-Modus loggen
                if (process.env.NODE_ENV === 'development') {
                    console.log('🚀 Performance Metrics:', metrics);

                    // Warnungen für schlechte Performance
                    if (metrics.loadTime > 3000) {
                        console.warn('⚠️ Slow load time detected:', metrics.loadTime + 'ms');
                    }

                    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 2500) {
                        console.warn('⚠️ Poor LCP detected:', metrics.largestContentfulPaint + 'ms');
                    }
                }
            }
        };

        // Metriken nach dem Load-Event sammeln
        if (document.readyState === 'complete') {
            collectMetrics();
        } else {
            window.addEventListener('load', collectMetrics);
        }

        return () => {
            window.removeEventListener('load', collectMetrics);
        };
    }, []);
};

// Memory Usage Monitoring
export const useMemoryMonitoring = () => {
    useEffect(() => {
        const checkMemoryUsage = () => {
            const performanceWithMemory = performance as PerformanceWithMemory;
            if (performanceWithMemory.memory) {
                const memory = performanceWithMemory.memory;
                const usedMemory = memory.usedJSHeapSize / 1024 / 1024; // MB
                const totalMemory = memory.totalJSHeapSize / 1024 / 1024; // MB

                if (process.env.NODE_ENV === 'development') {
                    console.log(`💾 Memory Usage: ${usedMemory.toFixed(2)}MB / ${totalMemory.toFixed(2)}MB`);

                    if (usedMemory > 50) { // Warnung bei > 50MB
                        console.warn('⚠️ High memory usage detected');
                    }
                }
            }
        };

        // Initial check
        checkMemoryUsage();

        // Periodic checks in development
        let interval: NodeJS.Timeout;
        if (process.env.NODE_ENV === 'development') {
            interval = setInterval(checkMemoryUsage, 30000); // Every 30 seconds
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, []);
};
