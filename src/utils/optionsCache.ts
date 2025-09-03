import createSecureApiClient from './secureApiClient';
import logger from './logger';
import {
    optionsCategoriesApi,
    optionsItemUnitsApi,
    optionsNutrientUnitsApi,
    optionsPackageUnitsApi,
    optionsStorageLocationsApi,
} from '../shared/Constants';

export type OptionRow = { id: number; name: string };
export type OptionsCacheData = {
    categories: OptionRow[];
    storageLocations: OptionRow[];
    itemUnits: OptionRow[];
    packageUnits: OptionRow[];
    nutrientUnits: OptionRow[];
};

// Singleton secure API client
const api = createSecureApiClient();

// Session cache (in-memory)
let cacheData: OptionsCacheData | undefined;
let inFlight: Promise<OptionsCacheData> | undefined;
let fetchedAt: number | undefined;

// Default TTL: 15 minutes
const TTL_MS = 15 * 60 * 1000;

function isExpired(now = Date.now()): boolean {
    if (!fetchedAt) return true;
    return (now - fetchedAt) > TTL_MS;
}

async function fetchAll(): Promise<OptionsCacheData> {
    logger.info('[OptionsCache] Fetching all option lists from backend...');
    const [categories, storageLocations, itemUnits, packageUnits, nutrientUnits] = await Promise.all([
        api.get(optionsCategoriesApi).then(r => r.data as OptionRow[]).catch(() => []),
        api.get(optionsStorageLocationsApi).then(r => r.data as OptionRow[]).catch(() => []),
        api.get(optionsItemUnitsApi).then(r => r.data as OptionRow[]).catch(() => []),
        api.get(optionsPackageUnitsApi).then(r => r.data as OptionRow[]).catch(() => []),
        api.get(optionsNutrientUnitsApi).then(r => r.data as OptionRow[]).catch(() => []),
    ]);
    logger.info('[OptionsCache] Fetch complete', {
        categories: categories.length,
        storageLocations: storageLocations.length,
        itemUnits: itemUnits.length,
        packageUnits: packageUnits.length,
        nutrientUnits: nutrientUnits.length,
    });
    return { categories, storageLocations, itemUnits, packageUnits, nutrientUnits };
}

export async function loadOptionsCache(): Promise<OptionsCacheData> {
    if (cacheData && !isExpired()) {
        logger.info('[OptionsCache] Cache hit (fresh)', getOptionsCacheMeta());
        return cacheData;
    }
    if (inFlight) {
        logger.info('[OptionsCache] Load already in progress');
        return inFlight;
    }
    logger.info('[OptionsCache] Cache miss or expired → fetching', getOptionsCacheMeta());
    inFlight = fetchAll()
        .then((data) => {
            cacheData = data;
            fetchedAt = Date.now();
            return data;
        })
        .finally(() => {
            inFlight = undefined;
        });
    return inFlight;
}

export function getCachedOptions(): OptionsCacheData | undefined {
    return cacheData;
}

export function clearOptionsCache(): void {
    cacheData = undefined;
    inFlight = undefined;
    fetchedAt = undefined;
}

// Optional: expose quick meta for debugging/inspection
export function getOptionsCacheMeta() {
    return {
        hasData: !!cacheData,
        fetchedAt,
        ttlMs: TTL_MS,
        expired: isExpired(),
        inFlight: !!inFlight,
    };
}

// Dev helper: attach to window for quick inspection in browser console
const _maybeGlobal = (typeof globalThis !== 'undefined' ? globalThis : undefined) as unknown;
if (_maybeGlobal && typeof _maybeGlobal === 'object') {
    const g = _maybeGlobal as Window & { __optionsCache?: unknown };
    if (!g.__optionsCache) {
        g.__optionsCache = {
            get: getCachedOptions,
            load: loadOptionsCache,
            clear: clearOptionsCache,
            meta: getOptionsCacheMeta,
        } as unknown;
    }
}
