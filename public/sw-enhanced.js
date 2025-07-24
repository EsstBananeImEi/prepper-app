/**
 * Enhanced Service Worker for caching images and API responses
 */

const CACHE_NAME = 'prepper-app-cache-v1';
const DYNAMIC_CACHE_NAME = 'prepper-app-dynamic-v1';
const IMAGE_CACHE_NAME = 'prepper-app-images-v1';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json'
];

// Cache strategies
const CACHE_STRATEGIES = {
    images: 'cache-first',
    api: 'network-first',
    static: 'cache-first'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== CACHE_NAME &&
                                cacheName !== DYNAMIC_CACHE_NAME &&
                                cacheName !== IMAGE_CACHE_NAME;
                        })
                        .map((cacheName) => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different types of requests
    if (request.method === 'GET') {
        if (isImageRequest(request)) {
            event.respondWith(handleImageRequest(request));
        } else if (isApiRequest(request)) {
            event.respondWith(handleApiRequest(request));
        } else if (isStaticAsset(request)) {
            event.respondWith(handleStaticRequest(request));
        }
    }
});

// Check if request is for an image
function isImageRequest(request) {
    return request.destination === 'image' ||
        request.url.includes('data:image/') ||
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(request.url);
}

// Check if request is for API
function isApiRequest(request) {
    return request.url.includes('/api/') ||
        request.url.includes('localhost:3001');
}

// Check if request is for static asset
function isStaticAsset(request) {
    return request.url.includes('/static/') ||
        request.url.endsWith('.js') ||
        request.url.endsWith('.css') ||
        request.url.endsWith('.html');
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache successful responses
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Image fetch failed:', error);
        // Return fallback image if available
        return caches.match('/default.png');
    }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache successful GET requests only
            if (request.method === 'GET') {
                cache.put(request, networkResponse.clone());
            }
        }
        return networkResponse;
    } catch (error) {
        console.log('API fetch failed, trying cache:', error);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Static asset fetch failed:', error);
        throw error;
    }
}

// Handle cache size limits
async function limitCacheSize(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxSize) {
        // Remove oldest entries
        const keysToDelete = keys.slice(0, keys.length - maxSize);
        await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
}

// Periodic cache cleanup
setInterval(() => {
    limitCacheSize(IMAGE_CACHE_NAME, 50); // Keep max 50 images
    limitCacheSize(DYNAMIC_CACHE_NAME, 30); // Keep max 30 API responses
}, 60000); // Run every minute
