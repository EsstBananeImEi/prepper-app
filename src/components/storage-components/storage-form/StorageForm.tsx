import React, { ReactElement, SyntheticEvent, useState, useEffect, useMemo, useRef } from 'react';
import { Descriptions, Image, Input, Select, Button, Alert, Upload, message, Card, Steps } from 'antd';
import { Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import axios from 'axios';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import {
    itemIdApi,
    itemsRoute,
    nutrientsApi,
    optionsCategoriesApi,
    optionsItemUnitsApi,
    optionsNutrientUnitsApi,
    optionsPackageUnitsApi,
    optionsStorageLocationsApi,
} from '../../../shared/Constants';
import { useStore } from '../../../store/Store';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { BasketModel, NutrientValueModel, StorageModel } from '../StorageModel';
import css from './StorageForm.module.css';
import { NutrientFactory } from '../../../shared/Factories';
import { actionHandler } from '../../../store/Actions';
import {
    validateBase64Image,
    fileToBase64,
    sanitizeBase64ForApi,
    ensureDataUrlPrefix,
    compressBase64Image,
    repairBase64Image,
    debugImageData
} from '../../../utils/imageUtils';
import { handleApiError } from '../../../hooks/useApi';
import i18n from '../../../i18n';
import { useTranslation } from 'react-i18next';
import {
    defaultCategories,
    defaultItemUnits,
    defaultNutrientUnits,
    defaultPackageUnits,
    defaultStorageLocations
} from '../../../shared/Defaults';
import { getCachedOptions, loadOptionsCache, getOptionsCacheMeta } from '../../../utils/optionsCache';
import logger from '../../../utils/logger';
import ScannerPro from '../../scanner/ScannerPro';
import api from '../../../hooks/StorageApi';

// No‑Op Callback (anstatt leerer Funktionen)
const noop = () => {
    // intentionally left blank
};

type PrefillState = { prefill?: { categories?: string[]; icon?: string; amount?: number } } | null;

export default function StorageDetailForm(): ReactElement {
    const { t } = useTranslation();
    const { id } = useParams<{ id?: string }>();
    const location = useLocation() as Location<PrefillState>;
    const isNew = !id;
    const history = useNavigate();
    const { store, dispatch } = useStore();
    const [dimensions] = useDemensions(() => 1, 0);

    const apiUrl: string = id ? itemIdApi(id) : '';
    const storageItem = store.storeItems.find((item) => id ? item.id === parseInt(id) : false);

    const initialItem: StorageModel = storageItem || {
        id: 0,
        name: '',
        amount: 0,
        lowestAmount: 0,
        midAmount: 0,
        unit: '',
        packageQuantity: undefined,
        packageUnit: '',
        storageLocation: '',
        categories: [],
        icon: '', // icon wird als Base64-String gespeichert
        nutrients: {
            description: '',
            unit: '',
            amount: 100,
            values: [] as NutrientValueModel[],
        },
    };

    // Zustände für Textfelder und numerische Felder
    const [name, setName] = useState<string>(initialItem.name);
    const [amount, setAmount] = useState<string>(isNew ? '' : initialItem.amount.toString());
    const [lowestAmount, setLowestAmount] = useState<string>(isNew ? '' : initialItem.lowestAmount.toString());
    const [midAmount, setMidAmount] = useState<string>(isNew ? '' : initialItem.midAmount.toString());
    const [unit, setUnit] = useState<string>(initialItem.unit);
    const [barcode, setBarcode] = useState<string>(initialItem.barcode || '');
    const [scannerVisible, setScannerVisible] = useState(false);
    // Scan API is enabled by default now that backend is implemented
    const enableScanApi = true;
    // Admin-only debug toggle: read from localStorage key set by admin tools
    const isAdminUser = Boolean(store.user && store.user.isAdmin === true);
    const adminDebugEnabled = typeof window !== 'undefined' && localStorage.getItem('admin_debug_enabled') === '1';
    const scannerShowDebug = isAdminUser && adminDebugEnabled;
    // scanQuota removed - no backend `/scans/quota` endpoint in use
    const [packageQuantity, setPackageQuantity] = useState<string>(
        isNew || initialItem.packageQuantity == null ? '' : initialItem.packageQuantity.toString()
    );
    const [packageUnit, setPackageUnit] = useState<string>(initialItem.packageUnit || '');
    const [storageLocation, setStorageLocation] = useState<string>(initialItem.storageLocation);
    const [categories, setCategories] = useState<string[]>(initialItem.categories || []);
    // icon wird als Base64-String gespeichert
    const [icon, setIcon] = useState<string>(initialItem.icon || '');
    // OpenFoodFacts derived raw fields (kept as-is and sent to backend for normalization)
    // Use `unknown` instead of `any` to satisfy lint rules; backend accepts arbitrary JSON.
    const [of_ingredients, setOfIngredients] = useState<unknown | null>(null);
    const [of_nutriments, setOfNutriments] = useState<unknown | null>(null);
    const [of_packagings, setOfPackagings] = useState<unknown | null>(null);
    // Local text field for user-friendly ingredient editing (comma separated)
    const [ingredientsText, setIngredientsText] = useState<string>('');
    // Compact nutriments editor (per 100g and per serving) for common nutrients
    type NutriRow = { key: string; label: string };
    const compactRows: NutriRow[] = [
        { key: 'energy-kcal', label: 'Energie (kcal)' },
        { key: 'energy', label: 'Energie (kJ)' },
        { key: 'fat', label: 'Fett' },
        { key: 'saturated-fat', label: 'davon: gesättigte Fettsäuren' },
        { key: 'carbohydrates', label: 'Kohlenhydrate' },
        { key: 'sugars', label: 'davon: Zucker' },
        { key: 'proteins', label: 'Eiweiß' },
        { key: 'fiber', label: 'Ballaststoffe' },
        { key: 'salt', label: 'Salz' }
    ];
    const [compactNutriments, setCompactNutriments] = useState<Record<string, { '100g': string; serving: string }>>(() => {
        const init: Record<string, { '100g': string; serving: string }> = {};
        for (const r of compactRows) init[r.key] = { '100g': '', serving: '' };
        return init;
    });
    // raw payload container from OpenFoodFacts (kept for backend normalization)
    const [of_raw, setOfRaw] = useState<unknown | null>(null);
    // When lookup returns 'product not found' from OpenFoodFacts, store message here so UI can show it
    const [lookupNotFound, setLookupNotFound] = useState<string>('');
    const initialNutr = Array.isArray(initialItem.nutrients) ? (initialItem.nutrients[0] || null) : initialItem.nutrients;
    const [nutrientDescription, setNutrientDescription] = useState<string>(initialNutr?.description || '');
    const [nutrientUnit, setNutrientUnit] = useState<string>(initialNutr?.unit || '');
    const [nutrientAmount, setNutrientAmount] = useState<string>(
        isNew || !initialNutr?.amount ? '' : initialNutr.amount.toString()
    );
    const [nutrients, setNutrients] = useState<NutrientValueModel[]>(initialNutr?.values || []);

    // Provide a stable, non-mutating sorted view of nutrients for render
    const sortedNutrients = useMemo(() => {
        try {
            return [...(nutrients || [])].sort((a, b) => a.id - b.id);
        } catch {
            return nutrients || [];
        }
    }, [nutrients]);

    // Helpers: parse ingredients text -> array of { text, percent?, rank }
    const parseIngredientsText = (text: string) => {
        const parts = String(text || '').split(',').map(p => p.trim()).filter(Boolean);
        return parts.map((p, idx) => {
            const m = p.match(/^(.*)\s*\((\s*([0-9.,]+)\s*%)\)\s*$/);
            if (m) {
                const txt = m[1].trim();
                const pct = Number(String(m[3]).replace(',', '.'));
                return { text: txt, percent: isNaN(pct) ? undefined : pct, rank: idx };
            }
            return { text: p, rank: idx };
        });
    };

    // Compose of_nutriments object from compact editor
    const buildOfNutrimentsFromCompact = (compact: Record<string, { '100g': string; serving: string }>) => {
        const out: Record<string, string | number> = {};
        for (const [k, v] of Object.entries(compact)) {
            if (v['100g'] && v['100g'].trim() !== '') out[`${k}_100g`] = Number(String(v['100g']).replace(',', '.'));
            if (v.serving && v.serving.trim() !== '') out[`${k}_serving`] = Number(String(v.serving).replace(',', '.'));
        }
        return out;
    };

    // Populate compact editor from an existing of_nutriments object
    const populateCompactFromOf = (ofn: unknown | null) => {
        try {
            if (!ofn || typeof ofn !== 'object') return;
            const obj = ofn as Record<string, unknown>;
            const newCompact: Record<string, { '100g': string; serving: string }> = {};
            for (const r of compactRows) {
                const v100 = obj[`${r.key}_100g`] ?? obj[`${r.key}_value`] ?? obj[`${r.key}_100g_value`] ?? obj[`${r.key}_100g_value`];
                const vs = obj[`${r.key}_serving`] ?? obj[`${r.key}_serving_value`] ?? null;
                newCompact[r.key] = {
                    '100g': v100 == null ? '' : String(v100),
                    serving: vs == null ? '' : String(vs),
                };
            }
            setCompactNutriments(newCompact);
            return newCompact;
        } catch {
            // ignore
        }
        return null;
    };

    // Run-once guard for suggestion-based prefill
    const suggestionsAppliedRef = useRef<boolean>(false);

    // Prefill name when navigating from basket create intent via query param
    useEffect(() => {
        if (!id) {
            try {
                const searchParams = new URLSearchParams(location.search);
                const prefillName = (searchParams.get('name') || '').trim();
                if (prefillName) {
                    setName((prev) => prev && prev.trim().length > 0 ? prev : prefillName);
                }
            } catch { /* ignore */ }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, id]);

    // Prefill other fields (categories, icon, amount) via navigation state when creating new
    useEffect(() => {
        if (!id && location && location.state && location.state.prefill) {
            try {
                const prefill = location.state.prefill;
                if (prefill) {
                    let applied = false;
                    if (Array.isArray(prefill.categories) && prefill.categories.length > 0) {
                        const cats: string[] = prefill.categories.filter((c): c is string => Boolean(c));
                        if (cats.length > 0) {
                            setCategories((prev) => (prev && prev.length > 0) ? prev : cats);
                            applied = true;
                        }
                    }
                    if (typeof prefill.icon === 'string') {
                        const iconStr = prefill.icon.trim();
                        if (iconStr.length > 0) {
                            setIcon((prev) => (prev && prev.trim().length > 0) ? prev : iconStr);
                            applied = true;
                        }
                    }
                    if (typeof prefill.amount !== 'undefined') {
                        const amt = Number(prefill.amount);
                        if (!isNaN(amt) && amt >= 0) {
                            setAmount((prev) => (prev && prev.trim().length > 0) ? prev : String(amt));
                            applied = true;
                        }
                    }
                    if (applied) {
                        try { message.info(i18n.t('form.notifications.prefilledFromBasket')); } catch { /* noop */ }
                    }
                }
            } catch { /* ignore */ }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, location]);

    // quota check removed - /scans/quota is not used

    // Fuzzy suggestion-based prefill from existing storage items
    useEffect(() => {
        if (id) return; // only for new item
        if (suggestionsAppliedRef.current) return; // only once
        const nm = (name || '').trim();
        if (!nm) return;
        // If user already filled key fields, don't prefill
        const alreadyHas = {
            categories: (categories && categories.length > 0),
            unit: (unit && unit.trim().length > 0),
            storageLocation: (storageLocation && storageLocation.trim().length > 0),
            icon: (icon && icon.trim().length > 0)
        } as const;
        const needsAny = !alreadyHas.categories || !alreadyHas.unit || !alreadyHas.storageLocation || !alreadyHas.icon;
        if (!needsAny) return;

        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9äöüß\s]/gi, ' ').replace(/\s+/g, ' ').trim();
        const tokens = (s: string) => normalize(s).split(' ').filter(Boolean);
        const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

        const nmTokens = uniq(tokens(nm));
        if (nmTokens.length === 0) return;

        let best: { item: StorageModel; score: number } | null = null;
        for (const it of store.storeItems) {
            const itTokens = uniq(tokens(it.name));
            let overlap = 0;
            for (const t of nmTokens) if (itTokens.includes(t)) overlap++;
            const overlapRatio = overlap / Math.max(1, nmTokens.length);
            const substr = normalize(it.name).includes(normalize(nm)) || normalize(nm).includes(normalize(it.name)) ? 0.15 : 0;
            const score = overlapRatio + substr;
            if (!best || score > best.score) best = { item: it, score };
        }

        const strong = 0.6;
        const fallback = 0.45;
        if (best && (best.score >= strong || best.score >= fallback)) {
            const cand = best.item;
            let applied = false;
            if (!alreadyHas.categories && Array.isArray(cand.categories) && cand.categories.length > 0) {
                setCategories((prev) => (prev && prev.length > 0) ? prev : cand.categories!.filter(Boolean));
                applied = true;
            }
            if (!alreadyHas.unit && typeof cand.unit === 'string' && cand.unit.trim().length > 0) {
                setUnit((prev) => (prev && prev.trim().length > 0) ? prev : cand.unit);
                applied = true;
            }
            if (!alreadyHas.storageLocation && typeof cand.storageLocation === 'string' && cand.storageLocation.trim().length > 0) {
                setStorageLocation((prev) => (prev && prev.trim().length > 0) ? prev : cand.storageLocation);
                applied = true;
            }
            if (!alreadyHas.icon && typeof cand.icon === 'string' && cand.icon.trim().length > 0) {
                const iconStr2 = cand.icon.trim();
                setIcon((prev) => (prev && prev.trim().length > 0) ? prev : iconStr2);
                applied = true;
            }
            if (applied) {
                suggestionsAppliedRef.current = true;
                try { message.info(i18n.t('form.notifications.prefilledFromSuggestions')); } catch { /* noop */ }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, name, store.storeItems]);

    // Optionen aus der DB
    // Backend-provided, user-created options (not including defaults)
    const [dbCategories, setDbCategories] = useState<{ id: number; name: string }[]>([]);
    const [dbStorageLocations, setDbStorageLocations] = useState<{ id: number; name: string }[]>([]);
    const [dbItemUnits, setDbItemUnits] = useState<{ id: number; name: string }[]>([]);
    const [dbPackageUnits, setDbPackageUnits] = useState<{ id: number; name: string }[]>([]);
    const [dbNutrientUnits, setDbNutrientUnits] = useState<{ id: number; name: string }[]>([]);

    // Merge helpers (case-insensitive unique by visible text)
    const mergeDefaults = (defaults: string[], userAdded: { id: number; name: string }[]) => {
        const seen = new Set<string>();
        const push = (arr: string[], val: string) => {
            const k = val.trim().toLowerCase();
            if (!k || seen.has(k)) return;
            seen.add(k);
            arr.push(val.trim());
        };
        const result: string[] = [];
        defaults.forEach((d) => push(result, d));
        userAdded.forEach((u) => push(result, u.name));
        return result;
    };

    // Wizard state
    const [currentStep, setCurrentStep] = useState<number>(0);
    const stepsDef = useMemo(() => [
        t('form.steps.base'),
        t('form.steps.details'),
        t('form.steps.packaging'),
        t('form.steps.image'),
        t('form.steps.nutrients')
    ], [t]);

    // Always open the form at the top when navigating here (from detail or elsewhere)
    useEffect(() => {
        const scrollNow = () => {
            // Try common scroll targets
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            const docEl = document.documentElement as HTMLElement | null;
            const bodyEl = document.body as HTMLElement | null;
            if (docEl && typeof docEl.scrollTo === 'function') docEl.scrollTo({ top: 0, left: 0 } as ScrollToOptions);
            if (bodyEl && typeof bodyEl.scrollTo === 'function') bodyEl.scrollTo({ top: 0, left: 0 } as ScrollToOptions);
            // Also set scrollTop directly as fallback
            if (docEl) docEl.scrollTop = 0;
            if (bodyEl) bodyEl.scrollTop = 0;
        };
        // Immediate
        scrollNow();
        // Next frame
        requestAnimationFrame(scrollNow);
        // After microtask and slight delay
        setTimeout(scrollNow, 0);
        setTimeout(scrollNow, 50);
    }, []);

    // Auto-center active step in scroller (AntD Steps)
    const stepsScrollerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const container = stepsScrollerRef.current;
        if (!container) return;
        const active = container.querySelector('.ant-steps-item-active') as HTMLElement | null;
        if (!active) return;
        const contRect = container.getBoundingClientRect();
        const actRect = active.getBoundingClientRect();
        const actWidth = active.offsetWidth || actRect.width;
        const relativeLeft = actRect.left - contRect.left + container.scrollLeft;
        const target = Math.min(
            Math.max(0, relativeLeft - (container.clientWidth - actWidth) / 2),
            container.scrollWidth - container.clientWidth
        );
        container.scrollTo({ left: target, behavior: 'smooth' });
    }, [currentStep]);

    // Popular (Top-3) suggestions from existing items
    const popularUnits = useMemo(() => {
        const counts = new Map<string, number>();
        store.storeItems.forEach(i => {
            const v = (i.unit || '').trim();
            if (!v) return;
            counts.set(v, (counts.get(v) || 0) + 1);
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([k]) => k);
    }, [store.storeItems]);

    const popularLocations = useMemo(() => {
        const counts = new Map<string, number>();
        store.storeItems.forEach(i => {
            const v = (i.storageLocation || '').trim();
            if (!v) return;
            counts.set(v, (counts.get(v) || 0) + 1);
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([k]) => k);
    }, [store.storeItems]);

    const popularPackageUnits = useMemo(() => {
        const counts = new Map<string, number>();
        store.storeItems.forEach(i => {
            const v = (i.packageUnit || '').trim();
            if (!v) return;
            counts.set(v, (counts.get(v) || 0) + 1);
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([k]) => k);
    }, [store.storeItems]);

    // Filter DB lists to avoid duplicating popular values in the main options
    // Build merged options (defaults + user-added), then filter out populars from the tail for cleaner menus
    const mergedItemUnits = useMemo(() => mergeDefaults(defaultItemUnits, dbItemUnits), [defaultItemUnits, dbItemUnits]);
    const mergedStorageLocations = useMemo(() => mergeDefaults(defaultStorageLocations, dbStorageLocations), [defaultStorageLocations, dbStorageLocations]);
    const mergedPackageUnits = useMemo(() => mergeDefaults(defaultPackageUnits, dbPackageUnits), [defaultPackageUnits, dbPackageUnits]);
    const mergedCategories = useMemo(() => mergeDefaults(defaultCategories, dbCategories), [defaultCategories, dbCategories]);
    const mergedNutrientUnits = useMemo(() => mergeDefaults(defaultNutrientUnits, dbNutrientUnits), [defaultNutrientUnits, dbNutrientUnits]);

    const itemUnitsFiltered = useMemo(() => mergedItemUnits.filter(u => !popularUnits.includes(u)), [mergedItemUnits, popularUnits]);
    const storageLocationsFiltered = useMemo(() => mergedStorageLocations.filter(l => !popularLocations.includes(l)), [mergedStorageLocations, popularLocations]);
    const packageUnitsFiltered = useMemo(() => mergedPackageUnits.filter(p => !popularPackageUnits.includes(p)), [mergedPackageUnits, popularPackageUnits]);

    // Für Speichern & Fehleranzeige
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string>('');    // Bei Laden des Items aus der DB initialisieren wir die States
    useEffect(() => {
        if (storageItem && (!name || name === '')) {  // Only initialize if not already initialized
            setName(storageItem.name);
            setAmount(storageItem.amount.toString());
            setLowestAmount(storageItem.lowestAmount.toString());
            setMidAmount(storageItem.midAmount.toString());
            setUnit(storageItem.unit);
            setPackageQuantity(storageItem.packageQuantity != null ? storageItem.packageQuantity.toString() : '');
            setPackageUnit(storageItem.packageUnit || '');
            setStorageLocation(storageItem.storageLocation);
            setCategories(storageItem.categories || []);
            setIcon(storageItem.icon || ''); // icon kommt als Base64-String aus der DB sonst leerer ba
            // Preserve raw OpenFoodFacts fields if present on the item (avoid `any` casts)
            try {
                const si = storageItem as unknown as { ingredients?: unknown; nutriments?: unknown; packagings?: unknown };
                setOfIngredients(si.ingredients ?? null);
            } catch { /* ignore */ }
            try {
                const si = storageItem as unknown as { ingredients?: unknown; nutriments?: unknown; packagings?: unknown };
                setOfNutriments(si.nutriments ?? null);
                try { populateCompactFromOf(si.nutriments ?? null); } catch { /* ignore */ }
            } catch { /* ignore */ }
            try {
                const si = storageItem as unknown as { ingredients?: unknown; nutriments?: unknown; packagings?: unknown };
                setOfPackagings(si.packagings ?? null);
            } catch { /* ignore */ }
            const sN = Array.isArray(storageItem.nutrients) ? (storageItem.nutrients[0] || null) : storageItem.nutrients;
            setNutrientDescription(sN?.description || '');
            // If legacy nutrient group provided amount/unit, populate top-level amount/unit when empty
            if ((!amount || amount === '') && sN && sN.amount) setAmount(sN.amount.toString());
            if ((!unit || unit === '') && sN && sN.unit) setUnit(sN.unit || '');
            if (!sN || !sN.values || sN.values.length === 0) {
                setNutrients(NutrientFactory());
            } else {
                setNutrients(sN.values);
            }
        }
    }, [id]); // Only depend on id, not the entire storageItem

    // Locale-aware mapping of long unit names -> abbreviation for display in Selects and in headers.
    // Prefer i18n resource keys under `units.short.<normalized>` (e.g. units.short.milliliter = "ml").
    const unitAbbreviations: Record<string, string> = {
        'Milliliter': 'ml',
        'Liter': 'l',
        'Gramm': 'g',
        'Kilogramm': 'kg',
        'Stück': 'Stk',
        'Päckchen': 'Pck',
        'Packung': 'Pck',
        'Dose': 'Dose',
        'Glas': 'Glas',
        'Flasche': 'Fl',
        'Beutel': 'Beutel',
        'Kartons': 'Kart',
        'mg': 'mg',
        'g': 'g',
        'kg': 'kg',
        'kcal': 'kcal',
        'kJ': 'kJ'
    };

    const normalizeKey = (s?: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    const renderUnitLabel = (full: string) => {
        const normalized = normalizeKey(full);
        // try i18n resource first
        try {
            const i18nKey = `units.short.${normalized}`;
            const val = i18n.exists(i18nKey) ? i18n.t(i18nKey) : null;
            if (val && typeof val === 'string' && val.trim() !== '') return (<span title={full}>{val}</span>);
        } catch { /* ignore i18n failures */ }

        const abbr = unitAbbreviations[full] || unitAbbreviations[full.trim()] || full;
        return (<span title={full}>{abbr}</span>);
    };

    const unitShortFor = (full: string) => {
        const normalized = normalizeKey(full);
        try {
            const i18nKey = `units.short.${normalized}`;
            const val = i18n.exists(i18nKey) ? i18n.t(i18nKey) : null;
            if (val && typeof val === 'string' && val.trim() !== '') return String(val);
        } catch { /* ignore */ }
        return unitAbbreviations[full] || unitAbbreviations[full.trim()] || full;
    };

    // If compact editor changes, reflect values into nutrients list so the saved list matches the compact display
    useEffect(() => {
        try {
            const derived = compactToNutrients(compactNutriments);
            if (derived && derived.length > 0) setNutrients(derived as unknown as NutrientValueModel[]);
        } catch { /* ignore */ }
    }, [compactNutriments]);

    // Load user-created options with session cache to avoid repeated network calls
    useEffect(() => {
        logger.info('[Options] Init load in StorageForm');
        const cached = getCachedOptions();
        if (cached) {
            setDbCategories(cached.categories);
            setDbStorageLocations(cached.storageLocations);
            setDbItemUnits(cached.itemUnits);
            setDbPackageUnits(cached.packageUnits);
            setDbNutrientUnits(cached.nutrientUnits);
            logger.info('[Options] Using cached options', getOptionsCacheMeta());
        }

        let mounted = true;
        loadOptionsCache()
            .then((data) => {
                if (!mounted) return;
                setDbCategories(data.categories);
                setDbStorageLocations(data.storageLocations);
                setDbItemUnits(data.itemUnits);
                setDbPackageUnits(data.packageUnits);
                setDbNutrientUnits(data.nutrientUnits);
                logger.info('[Options] Options loaded/refreshed', getOptionsCacheMeta());
            })
            .catch((err) => {
                logger.warn('[Options] Failed to load options', err);
                // ignore and keep whatever we have
            });

        return () => { mounted = false; };
    }, []);



    // Ensure form fields are populated when editing an existing item.
    // Some fields (nutrients, ingredients, barcode) may come from backend-only payloads
    // and must be mapped into the form state when the user navigates from detail -> edit.
    useEffect(() => {
        if (!storageItem) return;

        try {
            // Barcode
            const maybeBarcode = (storageItem as unknown as { barcode?: string }).barcode || null;
            if (maybeBarcode && (!barcode || barcode.trim() === '')) setBarcode(String(maybeBarcode));

            // Raw OF fragments
            const si = storageItem as unknown as { ingredients?: unknown; nutriments?: unknown; packagings?: unknown; _raw?: unknown };
            if ((of_ingredients === null || of_ingredients === undefined) && typeof si.ingredients !== 'undefined') setOfIngredients(si.ingredients ?? null);
            if ((of_nutriments === null || of_nutriments === undefined) && typeof si.nutriments !== 'undefined') {
                setOfNutriments(si.nutriments ?? null);
                // populate compact editor so nutrient tab shows values
                try {
                    const comp = populateCompactFromOf(si.nutriments ?? null);
                    if (comp) setCompactNutriments(comp);
                } catch { /* ignore */ }
            }
            if ((of_packagings === null || of_packagings === undefined) && typeof si.packagings !== 'undefined') setOfPackagings(si.packagings ?? null);
            // set _raw if present
            try {
                const rawVal = (si as { _raw?: unknown })._raw;
                if ((of_raw === null || of_raw === undefined) && typeof rawVal !== 'undefined') setOfRaw(rawVal ?? null);
            } catch { /* ignore */ }

            // Ingredients text
            try {
                if ((!ingredientsText || ingredientsText.trim() === '') && si.ingredients) {
                    const ingVal = si.ingredients as unknown;
                    if (Array.isArray(ingVal)) {
                        const txt = (ingVal as Array<unknown>).map((x) => {
                            if (x && typeof x === 'object' && 'text' in (x as Record<string, unknown>)) {
                                const xx = x as { text?: unknown };
                                return typeof xx.text === 'string' ? xx.text : '';
                            }
                            if (typeof x === 'string') return x;
                            return '';
                        }).filter(Boolean).join(', ');
                        if (txt) setIngredientsText(txt);
                    } else if (typeof ingVal === 'string') {
                        setIngredientsText(ingVal);
                    }
                }
            } catch { /* ignore */ }

            // Nutrients: if the nutrients editor is empty, populate from storageItem.nutrients (legacy) or from compact
            const sN = Array.isArray(storageItem.nutrients) ? (storageItem.nutrients[0] || null) : storageItem.nutrients;
            try {
                if ((!nutrients || nutrients.length === 0) && sN && sN.values && sN.values.length > 0) {
                    setNutrients(sN.values);
                }
                if ((!nutrientDescription || nutrientDescription === '') && sN && sN.description) setNutrientDescription(sN.description || '');
                if ((!nutrientAmount || nutrientAmount === '') && sN && sN.amount) setNutrientAmount(String(sN.amount));
                if ((!nutrientUnit || nutrientUnit === '') && sN && sN.unit) setNutrientUnit(sN.unit || '');
            } catch { /* ignore */ }
        } catch { /* ignore any mapping errors */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageItem]);

    if (!storageItem && !isNew) {
        return <LoadingSpinner message={t('detail.loadingItems')} />;
    }
    const handleBeforeUpload = async (file: File) => {
        try {
            message.loading(i18n.t('form.notifications.imageProcessing'), 0);

            logger.group('🖼️ Image Upload Debug');
            logger.log('File info:', {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified
            });

            // Validate and convert file to Base64
            const validationResult = await fileToBase64(file);

            logger.log('Validation result:', validationResult);

            if (!validationResult.isValid) {
                logger.error('Validation failed:', validationResult.error);
                logger.groupEnd();
                message.destroy();
                message.error(`${validationResult.error || i18n.t('form.notifications.invalidImageData')} [File: ${file.name}, Type: ${file.type}]`);
                return false;
            } let processedImage = validationResult.processedData!;

            // Enhanced debugging with detailed image analysis
            debugImageData(processedImage, `Upload Handler - ${file.name}`);

            logger.log('Processed image info:', {
                length: processedImage.length,
                startsWithDataUrl: processedImage.startsWith('data:'),
                mimeType: processedImage.split(',')[0]
            });

            // Compress if image is large
            const imageSizeKB = (processedImage.length * 3) / 4 / 1024;
            logger.log('Image size:', Math.round(imageSizeKB * 100) / 100, 'KB');

            if (imageSizeKB > 500) { // Compress if larger than 500KB
                try {
                    logger.log('Compressing image...');
                    processedImage = await compressBase64Image(processedImage, 800, 600, 0.8);
                    const newSizeKB = (processedImage.length * 3) / 4 / 1024;
                    logger.log('Compressed to:', Math.round(newSizeKB * 100) / 100, 'KB');
                    message.info(i18n.t('form.notifications.imageCompressedInfo'));
                } catch (compressionError) {
                    logger.warn('Compression failed, using original:', compressionError);
                }
            }

            setIcon(processedImage);
            logger.log('Image set successfully');
            logger.groupEnd();
            message.destroy();
            message.success(i18n.t('form.notifications.imageLoadedSuccess'));
        } catch (error) {
            logger.error('Image processing error:', error);
            logger.groupEnd();
            message.destroy();
            message.error(i18n.t('form.notifications.imageProcessError'));
        }

        return false; // Prevent automatic upload
    };

    // Nutrient-Handler (unverändert)
    const onChangeNutrient = (nutrientIndex: number, key: string, value: string | number) => {
        setNutrients((curr) => {
            const updated = [...curr];
            updated[nutrientIndex] = { ...updated[nutrientIndex], [key]: value };
            return updated;
        });
    };

    const onChangeNutrientColorCode = (nutrientIndex: number, color: string) => {
        setNutrients((curr) => {
            const updated = [...curr];
            updated[nutrientIndex] = { ...updated[nutrientIndex], color };
            return updated;
        });
    };

    const onChangeNutrientType = (
        nutrientIndex: number,
        typeIndex: number,
        key: string,
        value: string | number
    ) => {
        setNutrients((curr) => {
            const updated = [...curr];
            const nutrient = { ...updated[nutrientIndex] };
            const updatedTypes = [...nutrient.values];
            updatedTypes[typeIndex] = {
                ...updatedTypes[typeIndex],
                [key]: key === 'value' ? Number(value) : value,
            };
            nutrient.values = updatedTypes;
            updated[nutrientIndex] = nutrient;
            return updated;
        });
    };

    // Compact -> nutrients synchronization
    const compactToNutrients = (compact: Record<string, { '100g': string; serving: string }>) => {
        const out: NutrientValueModel[] = [];
        let idCounter = Date.now();
        for (const r of compactRows) {
            const entry = compact[r.key];
            if (!entry) continue;
            const vals: { typ: string; value: number }[] = [];
            if (entry['100g'] && String(entry['100g']).trim() !== '') {
                const v = Number(String(entry['100g']).replace(',', '.'));
                if (!isNaN(v)) vals.push({ typ: '100g', value: v });
            }
            if (entry.serving && String(entry.serving).trim() !== '') {
                const v2 = Number(String(entry.serving).replace(',', '.'));
                if (!isNaN(v2)) vals.push({ typ: 'portion', value: v2 });
            }
            if (vals.length > 0) {
                out.push({ id: idCounter++, name: r.label, color: '#999999', values: vals as unknown as import('../StorageModel').NutrientTypModel[] });
            }
        }
        return out;
    };
    const getUpdatedItem = (): StorageModel => {
        const t = (s?: string | null) => (s ?? '').trim();
        // Validate and sanitize icon data for API
        let processedIcon = '';
        if (icon) {
            logger.group('🔧 Processing Icon for API');
            logger.log('Original icon length:', icon.length);
            logger.log('Icon starts with data URL:', icon.startsWith('data:'));

            // If icon is a remote URL, accept it as-is (no Base64 validation)
            if (typeof icon === 'string' && (icon.startsWith('http://') || icon.startsWith('https://'))) {
                processedIcon = icon;
                logger.log('Using remote image URL as processedIcon');
            } else {
                const iconValidation = validateBase64Image(icon);
                logger.log('Icon validation result:', iconValidation);
                if (iconValidation.isValid) {
                    processedIcon = ensureDataUrlPrefix(iconValidation.processedData || icon);
                    logger.log('Processed icon with data URL prefix');
                } else {
                    logger.warn('Invalid icon data, attempting repair:', iconValidation.error);
                    logger.warn('Icon preview:', icon.substring(0, 100));

                    const repairResult = repairBase64Image(icon);
                    if (repairResult.isValid && repairResult.processedData) {
                        logger.log('✅ Image data repaired successfully');
                        processedIcon = ensureDataUrlPrefix(repairResult.processedData);
                    } else {
                        logger.error('❌ Could not repair image data:', repairResult.error);
                        // Set empty icon if repair also fails
                        processedIcon = '';
                    }
                }
            }
            logger.groupEnd();
        }

        return {
            ...initialItem,
            barcode: barcode || undefined,
            name: t(name),
            amount: Number(amount) || 0,
            lowestAmount: Number(lowestAmount) || 0,
            midAmount: Number(midAmount) || 0,
            unit: t(unit),
            packageQuantity: packageQuantity && t(packageQuantity) !== '' ? Number(packageQuantity) : undefined,
            packageUnit: t(packageUnit),
            storageLocation: t(storageLocation),
            categories: (categories || []).filter(cat => t(cat) !== ''), // Remove empty categories
            icon: processedIcon,
            nutrients: {
                description: t(nutrientDescription),
                unit: t(nutrientUnit || unit),
                amount: Number(nutrientAmount || amount) || 100,
                values: (nutrients || []).map(nutrient => ({
                    ...nutrient,
                    name: t(nutrient.name),
                    color: t(nutrient.color),
                    values: (nutrient.values || []).filter(val => t(val.typ) !== '') // Remove empty values
                })).filter(nutrient => nutrient.name !== '') // Remove empty nutrients
            },
            // Attach raw OpenFoodFacts-derived fields (if any). Backend will persist raw JSON and may normalize.
            ingredients: (ingredientsText && ingredientsText.trim().length > 0) ? parseIngredientsText(ingredientsText) : (of_ingredients || undefined),
            nutriments: (function () {
                // prefer compact editor values if any provided
                try {
                    const compactObj = buildOfNutrimentsFromCompact(compactNutriments);
                    // If compactObj contains any numeric keys, use it
                    if (Object.keys(compactObj).length > 0) return compactObj;
                } catch { /* ignore */ }
                return of_nutriments || undefined;
            })(),
            packagings: of_packagings || undefined,
            _raw: of_raw || undefined,
        };
    }

    // Enhanced validation of required fields (overall)
    const validateRequiredFields = (): boolean => {
        const errors: string[] = [];

        if (!name || name.trim() === '') {
            errors.push('Name ist erforderlich');
        }

        if (!amount || amount.trim() === '' || isNaN(Number(amount)) || Number(amount) < 0) {
            errors.push('Gültige Menge ist erforderlich');
        }

        // Unit is optional

        // Validate numeric fields
        if (lowestAmount && (isNaN(Number(lowestAmount)) || Number(lowestAmount) < 0)) {
            errors.push('Minimaler Warn-Wert muss eine gültige Zahl sein');
        }

        if (midAmount && (isNaN(Number(midAmount)) || Number(midAmount) < 0)) {
            errors.push('Mittlerer Warn-Wert muss eine gültige Zahl sein');
        }

        if (packageQuantity && packageQuantity.trim() !== '' &&
            (isNaN(Number(packageQuantity)) || Number(packageQuantity) <= 0)) {
            errors.push('Packungsgröße muss eine positive Zahl sein');
        }

        // Validate icon if present (accept remote URLs as valid)
        if (icon && icon.trim() !== '') {
            if (!icon.startsWith('http://') && !icon.startsWith('https://')) {
                const iconValidation = validateBase64Image(icon);
                if (!iconValidation.isValid) {
                    errors.push(`Bild ungültig: ${iconValidation.error}`);
                }
            }
        }

        if (errors.length > 0) {
            setSaveError(errors.join('; '));
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
        }

        return true;
    }; const onSave = async () => {
        setSaving(true);
        setSaveError('');

        if (!validateRequiredFields()) {
            setSaving(false);
            return;
        }

        const updatedItem = getUpdatedItem();

        logger.group('💾 Saving Storage Item');
        logger.log('Item Data:', updatedItem);
        logger.log('Is New:', isNew);
        logger.log('ID:', id);

        // Detailed debugging for icon if icon is != ''
        if (updatedItem.icon && updatedItem.icon !== '') {
            logger.group('🖼️ Icon Details for Save');
            logger.log('Icon length:', updatedItem.icon.length);
            logger.log('First 50 chars:', updatedItem.icon.substring(0, 50));
            logger.log('Last 50 chars:', updatedItem.icon.substring(Math.max(0, updatedItem.icon.length - 50)));
            logger.log('Contains data URL prefix:', updatedItem.icon.startsWith('data:'));

            // Test Base64 validity
            try {
                const testData = updatedItem.icon.startsWith('data:') ? updatedItem.icon.split(',')[1] : updatedItem.icon;
                window.atob(testData.substring(0, Math.min(100, testData.length)));
                logger.log('✅ Icon Base64 is valid');
            } catch (error) {
                logger.error('❌ Icon Base64 is invalid:', error);
            }
            logger.groupEnd();
        }
        logger.groupEnd();

        try {
            if (isNew) {
                await actionHandler({ type: 'ADD_STORAGE_ITEM', storageItem: updatedItem }, dispatch);
                message.success(i18n.t('form.notifications.createdSuccess'));
            } else if (id) {
                await Promise.all([
                    actionHandler({ type: 'UPDATE_STORAGE_ITEM', storageItem: updatedItem }, dispatch),
                    actionHandler({ type: 'UPDATE_NUTRIENT_ITEM', storageItem: updatedItem }, dispatch),
                ]);

                // Update shopping card if item exists there
                const basketItem = store.shoppingCard.find(item =>
                    item.name === updatedItem.name || item.name === initialItem.name
                );
                if (basketItem) {
                    await actionHandler({
                        type: 'UPDATE_CARD_ITEM',
                        basketItems: getBasketModel(updatedItem)
                    }, dispatch);
                }

                message.success(i18n.t('form.notifications.updatedSuccess'));
            }
            // Persist scanned barcode for this item (best-effort). Do not block user flow on failure.
            try {
                if (enableScanApi && barcode && barcode.trim().length > 0) {
                    let targetId: number | null = null;
                    if (id) targetId = parseInt(id);
                    if (!targetId) {
                        // try to find created/updated item in store
                        const found = store.storeItems.find((it) => {
                            try {
                                return it.name === updatedItem.name && String(it.amount) === String(updatedItem.amount) && it.unit === updatedItem.unit;
                            } catch { return false; }
                        });
                        if (found && found.id) targetId = found.id;
                    }
                    if (targetId) {
                        try {
                            await api({ method: 'POST', url: `/api/storage-item/${targetId}/add-barcode`, data: { barcode } });
                        } catch (e) {
                            logger.warn('[Scan] Failed to persist scanned barcode', e);
                        }
                    }
                }
            } catch (err) {
                // ignore
            }

            // Clear any 'not found' hint after we saved a manual entry so next scans use stored data
            setLookupNotFound('');
            history(itemsRoute);
        } catch (error: unknown) {
            logger.group('🚨 Save Error Details');
            logger.error('Error object:', error);
            logger.error('Error type:', typeof error);
            logger.error('Error constructor:', error?.constructor?.name);
            if (error instanceof Error) {
                logger.error('Error message:', error.message);
                logger.error('Error stack:', error.stack);
            }
            logger.groupEnd();

            // Prefer backend message for 409 (Conflict)
            type BackendErrorData = { error?: string; message?: string };
            type HttpError = { response?: { status?: number; data?: BackendErrorData } };
            const httpErr = error as HttpError;
            const status = httpErr?.response?.status;
            const backendMsg = httpErr?.response?.data?.error || httpErr?.response?.data?.message;
            if (status === 409 && backendMsg) {
                setSaveError(backendMsg);
                message.error(backendMsg);
            } else {
                const errorMessage = handleApiError(error, false);
                setSaveError(errorMessage);
                if (errorMessage) message.error(errorMessage);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSaving(false);
        }
    };

    // Step-specific validation (lightweight)
    const validateStep = (step: number): boolean => {
        if (step === 0) { // Basis
            const errors: string[] = [];
            if (!name || name.trim() === '') errors.push('Name ist erforderlich');
            if (!amount || amount.trim() === '' || isNaN(Number(amount)) || Number(amount) < 0) errors.push('Gültige Menge ist erforderlich');
            // Unit is optional
            if (errors.length) {
                setSaveError(errors.join('; '));
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return false;
            }
        }
        return true;
    };

    const next = () => {
        if (!validateStep(currentStep)) return;
        setSaveError('');
        setCurrentStep((s) => Math.min(s + 1, 4));
    };

    const prev = () => {
        setSaveError('');
        setCurrentStep((s) => Math.max(s - 1, 0));
    };

    const onStepChange = (targetStep: number) => {
        if (targetStep === currentStep) return;
        // Validate only when moving forward
        if (targetStep > currentStep && !validateStep(currentStep)) return;
        setSaveError('');
        setCurrentStep(targetStep);
    };

    const getBasketModel = (storeageItem: StorageModel) => ({
        ...store.shoppingCard.find(item => item.name === storeageItem.name || item.name === initialItem.name),
        icon: storeageItem.icon,
        categories: storeageItem.categories,
        name: storeageItem.name,
    } as BasketModel);

    const onCancel = () => history(-1);

    const onDelete = (event: SyntheticEvent) => {
        event.preventDefault();
        if (id && storageItem) {
            dispatch({ type: 'CLEAR_ITEM_CARD', basketItems: getBasketModel(storageItem) });
            storageApi('DELETE', itemIdApi(id), noop, {}).then(() => history(itemsRoute));
        }
    };

    return (
        <div className={css.container}>
            {saveError && (
                <Alert style={{ marginBottom: 16 }} message={saveError} type="error" showIcon />
            )}
            {lookupNotFound && (
                <Alert style={{ marginBottom: 16 }} message={lookupNotFound} type="info" showIcon />
            )}

            <Card className={css.tabsCard} bordered>
                <div className={css.stepsScroller} ref={stepsScrollerRef}>
                    <Steps
                        current={currentStep}
                        onChange={onStepChange}
                        direction="horizontal"
                        responsive={false}
                        size="small"
                        items={stepsDef.map((title) => ({ title }))}
                    />
                </div>

                {currentStep === 0 && (
                    <div className={css.itemFields} style={{ marginTop: 16 }}>
                        <div className={css.itemFieldRow}>
                            <label>{t('form.labels.name')}<span style={{ color: 'red' }}> *</span></label>
                            <Input
                                value={name}
                                onChange={(e) => { setName(e.target.value); if (lookupNotFound) setLookupNotFound(''); }}
                                placeholder={t('form.placeholders.name')}
                            />
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>{t('form.labels.amount')}<span style={{ color: 'red' }}> *</span></label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={t('form.placeholders.amount')}
                            />
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>{t('form.labels.barcode')}</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Input
                                    value={barcode}
                                    onChange={(e) => { setBarcode(e.target.value); if (lookupNotFound) setLookupNotFound(''); }}
                                    placeholder={t('form.placeholders.barcode') || 'EAN / UPC / Code128'}
                                />
                                <Button onClick={() => { setLookupNotFound(''); setScannerVisible(true); }}>Scan</Button>
                            </div>
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>{t('form.labels.unitOptional')}</label>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                value={unit ? [unit] : []}
                                placeholder={t('form.placeholders.unit')}
                                onChange={(vals: string[]) => setUnit(vals.slice(-1)[0] || '')}
                            >
                                {popularUnits.length > 0 && (
                                    <Select.OptGroup label={t('form.common.popular')}>
                                        {popularUnits.map((u) => (
                                            <Select.Option key={`pop-u-${u}`} value={u}>
                                                {renderUnitLabel(u)}
                                            </Select.Option>
                                        ))}
                                    </Select.OptGroup>
                                )}
                                {itemUnitsFiltered.map((u) => (
                                    <Select.Option key={`u-${u}`} value={u}>
                                        {renderUnitLabel(u)}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className={css.itemFields} style={{ marginTop: 16 }}>
                        <div className={css.itemFieldRow}>
                            <label>{t('form.labels.categories')}</label>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                value={categories}
                                placeholder={t('form.placeholders.categories')}
                                onChange={(value) => setCategories(value.slice(-1))}
                            >
                                {mergedCategories.map((c) => (
                                    <Select.Option key={`c-${c}`} value={c}>
                                        {c}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>{t('form.labels.storageLocation')}</label>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                value={storageLocation ? [storageLocation] : []}
                                placeholder={t('form.placeholders.storageLocation')}
                                onChange={(val: string[]) => setStorageLocation((val.slice(-1)[0] || ''))}
                            >
                                {popularLocations.length > 0 && (
                                    <Select.OptGroup label={t('form.common.popular')}>
                                        {popularLocations.map((loc) => (
                                            <Select.Option key={`pop-l-${loc}`} value={loc}>
                                                {loc}
                                            </Select.Option>
                                        ))}
                                    </Select.OptGroup>
                                )}
                                {storageLocationsFiltered.map((loc) => (
                                    <Select.Option key={`loc-${loc}`} value={loc}>
                                        {loc}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>{t('form.labels.lowThreshold')}</label>
                            <Input
                                type="number"
                                value={lowestAmount}
                                onChange={(e) => setLowestAmount(e.target.value)}
                                placeholder={t('form.placeholders.lowThreshold')}
                            />
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>{t('form.labels.midThreshold')}</label>
                            <Input
                                type="number"
                                value={midAmount}
                                onChange={(e) => setMidAmount(e.target.value)}
                                placeholder={t('form.placeholders.midThreshold')}
                            />
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className={css.itemFields} style={{ marginTop: 16 }}>
                        <div className={css.itemFieldRow}>
                            <label>{t('form.labels.packageSize')}</label>
                            <Input
                                type="number"
                                value={packageQuantity}
                                onChange={(e) => setPackageQuantity(e.target.value)}
                                placeholder={t('form.placeholders.packageSize')}
                            />
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>{t('form.labels.packageUnit')}</label>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                value={packageUnit ? [packageUnit] : []}
                                placeholder={t('form.placeholders.packageUnit')}
                                onChange={(val: string[]) => setPackageUnit((val.slice(-1)[0] || ''))}
                            >
                                {popularPackageUnits.length > 0 && (
                                    <Select.OptGroup label={t('form.common.popular')}>
                                        {popularPackageUnits.map((pu) => (
                                            <Select.Option key={`pop-pu-${pu}`} value={pu}>
                                                {renderUnitLabel(pu)}
                                            </Select.Option>
                                        ))}
                                    </Select.OptGroup>
                                )}
                                {packageUnitsFiltered.map((pu) => (
                                    <Select.Option key={`pu-${pu}`} value={pu}>
                                        {renderUnitLabel(pu)}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 16 }}>
                        <Image.PreviewGroup>
                            <Image
                                width={150}
                                alt={name || 'Storage Item'}
                                src={icon ? (typeof icon === 'string' && (icon.startsWith('http://') || icon.startsWith('https://')) ? icon : ensureDataUrlPrefix(icon)) : '/default.png'}
                                placeholder={
                                    <div style={{
                                        width: 150,
                                        height: 150,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '6px'
                                    }}>
                                        {t('form.labels.imagePreview')}
                                    </div>
                                }
                                fallback="/default.png"
                            />
                        </Image.PreviewGroup>
                        <Upload beforeUpload={handleBeforeUpload} showUploadList={false} accept="image/*">
                            <Button icon={<UploadOutlined />}>{t('form.labels.uploadImage')}</Button>
                        </Upload>
                        {icon && (
                            <Button
                                type="link"
                                size="small"
                                onClick={() => setIcon('')}
                                style={{ marginTop: 4 }}
                            >
                                {t('form.labels.removeImage')}
                            </Button>
                        )}
                    </div>
                )}

                {currentStep === 4 && (
                    <Descriptions
                        bordered
                        style={{
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            marginTop: 16,
                        }}
                    >
                        {/* Nährwerte-Tab: use inline fields below; remove the prominent label */}
                        <Descriptions.Item style={{ padding: '10px 10px', display: 'block' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 8 }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontWeight: 600 }}>{t('form.labels.amount')}</label>
                                    <Input
                                        type="number"
                                        value={nutrientAmount}
                                        onChange={(e) => setNutrientAmount(e.target.value)}
                                        placeholder={t('form.placeholders.nutrientAmount')}
                                        style={{ width: 120 }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontWeight: 600 }}>{t('detail.table.unit')}</label>
                                    <Select
                                        style={{ width: 160 }}
                                        value={nutrientUnit || ''}
                                        placeholder={t('form.placeholders.nutrientUnit')}
                                        onChange={(val: string) => setNutrientUnit(val || '')}
                                    >
                                        {mergedNutrientUnits.map((u) => (
                                            <Select.Option key={`mu-${u}`} value={u}>
                                                {renderUnitLabel(u)}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            {/* Ingredients editor (compact textarea) */}
                            <div style={{ margin: '12px 0' }}>
                                <label style={{ fontWeight: 600 }}>{t('detail.labels.ingredients')}: </label>
                                <Input.TextArea
                                    value={ingredientsText}
                                    onChange={(e) => setIngredientsText(e.target.value)}
                                    placeholder={t('detail.labels.ingredients')}
                                    autoSize={{ minRows: 2, maxRows: 6 }}
                                />
                                <div style={{ marginTop: 6, color: '#666' }}>{t('form.nutrientsIngredientsHint', { defaultValue: 'Liste von Zutaten, durch Kommas getrennt. Prozentangaben in Klammern erlaubt, z. B. "Tomaten (50%), Salz"' })}</div>
                            </div>

                            {/* Compact nutriments editor (per 100g / per serving) */}
                            <div style={{ margin: '12px 0' }}>
                                <label style={{ fontWeight: 600 }}>{t('form.nutrientsFromOpenFoodFacts', { defaultValue: 'Nährwerte (OpenFoodFacts)' })}</label>
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}></th>
                                            <th style={{ textAlign: 'right' }}>{`pro ${nutrientAmount || 100} ${unitShortFor(nutrientUnit || unit || '')}`}</th>
                                            <th style={{ textAlign: 'right' }}>pro Portion</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {compactRows.map(r => (
                                            <tr key={r.key}>
                                                <td style={{ padding: '6px 8px' }}>{r.label}</td>
                                                <td style={{ padding: '6px 8px' }}>
                                                    <Input
                                                        value={compactNutriments[r.key]?.['100g'] || ''}
                                                        onChange={(e) => setCompactNutriments(curr => ({ ...curr, [r.key]: { ...curr[r.key], '100g': e.target.value } }))}
                                                        style={{ width: '100%' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '6px 8px' }}>
                                                    <Input
                                                        value={compactNutriments[r.key]?.serving || ''}
                                                        onChange={(e) => setCompactNutriments(curr => ({ ...curr, [r.key]: { ...curr[r.key], serving: e.target.value } }))}
                                                        style={{ width: '100%' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ padding: 8, color: '#444' }}>
                                {t('form.nutrientsCompactOnlyNote', { defaultValue: 'Nährwerte werden über das kompakte Editor-Panel oben oder per Barcode-Scan verwaltet.' })}
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Card>

            <div className={css.actionBar}>
                <div className={css.actionLeft}></div>
                <div className={css.actionCenter}>
                    {!isNew && (
                        <Button className={css.formButton} onClick={onCancel} type="default">{t('form.buttons.toOverview')}</Button>
                    )}
                    <Button className={css.formButton} onClick={prev} disabled={currentStep === 0}>{t('form.buttons.back')}</Button>
                    {currentStep < 4 && (
                        <Button className={css.formButton} type="default" onClick={next}>{t('form.buttons.next')}</Button>
                    )}
                </div>
                <div className={css.actionRight}>
                    <Button className={css.formButton} onClick={onSave} type="primary" loading={saving}>{t('form.buttons.save')}</Button>
                    {isNew && (
                        <Button className={css.formButton} onClick={onCancel}>{t('form.buttons.cancel')}</Button>
                    )}
                </div>
            </div>
            {/* Scanner Modal */}
            <Modal
                open={scannerVisible}
                onCancel={() => setScannerVisible(false)}
                footer={null}
                width={900}
                destroyOnClose
                title={t('form.labels.scanBarcode') || 'Barcode scannen'}
            >
                <ScannerPro
                    minimalView={isNew}
                    showDebug={scannerShowDebug}
                    onDetected={async (code: string) => {
                        // Immediately show scanned barcode in the input
                        setBarcode(code);
                        // If amount empty, default to 1 when scanning
                        if (!amount || amount.trim() === '') setAmount('1');
                        // Always call backend lookup for scanned barcode

                        // When a code is detected: try public product lookup (cache-aware)
                        try {
                            console.debug('[Scan] calling backend barcode lookup for', code);
                            const lookup = await api({ method: 'POST', url: '/api/barcode/lookup', data: { barcode: code } });
                            console.debug('[Scan] lookup response', lookup && lookup.data ? lookup.data : lookup);
                            const body = lookup && lookup.data ? lookup.data : null;
                            // Handle OpenFoodFacts 'product not found' responses (several possible backend shapes)
                            if (body && (
                                body.status === 0 ||
                                (body.status_verbose && String(body.status_verbose).toLowerCase().includes('not found')) ||
                                (typeof body.message === 'string' && body.message.toLowerCase().includes('not found')) ||
                                // backend may return { message: 'not found', product: null, source: 'openfoodfacts' }
                                (body.product == null && body.source === 'openfoodfacts')
                            )) {
                                // Show an informative message to user and keep barcode populated
                                setLookupNotFound(i18n.t('form.notifications.scanProductNotFound', { barcode: code, defaultValue: `Produkt für Barcode ${code} nicht gefunden — Formular manuell ausfüllen und speichern.` }));
                                setBarcode(code);
                            } else if (body && body.product) {
                                const payload = body.product;
                                // Apply additional fields from OF payload
                                try {
                                    const p = payload as unknown as Record<string, unknown>;
                                    // categories may be a comma-separated string or an array
                                    if (typeof p.categories === 'string' && (p.categories as string).trim() !== '') {
                                        const cats = (p.categories as string).split(',').map(s => s.trim()).filter(Boolean);
                                        if (cats.length > 0) setCategories(cats.slice(0, 5));
                                    } else if (Array.isArray(p.categories) && (p.categories as string[]).length > 0) {
                                        setCategories((p.categories as string[]).slice(0, 5));
                                    } else if (Array.isArray(p.categories_tags) && (p.categories_tags as string[]).length > 0) {
                                        // fallback: use tags (e.g. 'en:seafood') -> 'seafood'
                                        const tags = (p.categories_tags as string[]).map(tag => String(tag).replace(/^.*:/, '').replace(/[-_]/g, ' ')).filter(Boolean);
                                        if (tags.length > 0) setCategories(tags.slice(0, 5));
                                    }
                                } catch { /* ignore */ }
                                try {
                                    const p = payload as unknown as Record<string, unknown>;
                                    // product.quantity may be like "330 g" or "1 L"
                                    if (typeof p.quantity === 'string') {
                                        const q = String(p.quantity).trim();
                                        const m = q.match(/^\s*([0-9.,]+)\s*(.*)$/);
                                        if (m) {
                                            const qty = m[1].replace(',', '.');
                                            setPackageQuantity(String(Number(qty) || ''));
                                            const unitPart = (m[2] || '').trim();
                                            if (unitPart) setPackageUnit(unitPart);
                                        } else {
                                            setPackageUnit(q);
                                        }
                                    }
                                } catch { /* ignore */ }
                                try {
                                    // avoid explicit `any` - treat payload as unknown and narrow
                                    const pWithRaw = payload as unknown as { _raw?: unknown } | null;
                                    if (pWithRaw && typeof pWithRaw === 'object' && pWithRaw._raw) {
                                        setOfRaw(pWithRaw._raw);
                                    }
                                } catch { /* ignore */ }
                                // Apply richer OpenFoodFacts payload fields to local state so they are sent on save
                                try {
                                    if (payload.ingredients) {
                                        setOfIngredients(payload.ingredients);
                                        try {
                                            // convert payload.ingredients to comma-separated text
                                            if (typeof payload.ingredients === 'string') setIngredientsText(payload.ingredients as string);
                                            else if (Array.isArray(payload.ingredients)) {
                                                // join ingredient texts if array
                                                const joined = (payload.ingredients as unknown[]).map((it) => {
                                                    if (it && typeof it === 'object' && 'text' in (it as Record<string, unknown>)) {
                                                        const obj = it as Record<string, unknown>;
                                                        const tval = obj['text'];
                                                        return typeof tval === 'string' ? tval : String(tval ?? '');
                                                    }
                                                    return String(it ?? '');
                                                }).filter(Boolean).join(', ');
                                                setIngredientsText(joined);
                                            }
                                        } catch { /* ignore */ }
                                    }
                                } catch { /* ignore */ }
                                try {
                                    if (payload.nutriments) {
                                        setOfNutriments(payload.nutriments);
                                        try {
                                            const compact = populateCompactFromOf(payload.nutriments);
                                            // If populateCompactFromOf returned a compact object, derive nutrients immediately
                                            if (compact && typeof compact === 'object') {
                                                try {
                                                    const derived = compactToNutrients(compact as Record<string, { '100g': string; serving: string }>);
                                                    if (derived && derived.length > 0) setNutrients(derived as unknown as NutrientValueModel[]);
                                                } catch { /* ignore derived conversion errors */ }
                                            }

                                            // If the payload includes any *_100g keys, prefer showing 'pro 100 g'
                                            try {
                                                const pnut = payload.nutriments as Record<string, unknown> | undefined;
                                                if (pnut && typeof pnut === 'object') {
                                                    const has100g = Object.keys(pnut).some(k => /_100g$/.test(k));
                                                    if (has100g) {
                                                        setNutrientAmount('100');
                                                        // If a unit is present in an energy key, use that, else default to 'g'
                                                        const possibleUnit = (pnut['energy-kcal_unit'] ?? pnut['energy_unit'] ?? pnut['proteins_unit'] ?? pnut['fat_unit'] ?? pnut['carbohydrates_unit']) as unknown;
                                                        if (possibleUnit && typeof possibleUnit === 'string') setNutrientUnit(String(possibleUnit));
                                                        else setNutrientUnit('g');
                                                    }
                                                }
                                            } catch { /* ignore */ }
                                        } catch { /* ignore */ }
                                    }
                                } catch { /* ignore */ }
                                try {
                                    if (payload.packagings) setOfPackagings(payload.packagings);
                                } catch { /* ignore */ }
                                // Prefer product_name, fallback to generic name
                                if (payload.product_name || payload.name) setName(String(payload.product_name || payload.name));
                                // Use quantity/unit: prefer explicit unit from _raw.product_quantity_unit or parse from quantity
                                const p2 = payload as unknown as Record<string, unknown>;
                                try {
                                    let unitOnly = '';
                                    if (p2._raw && typeof p2._raw === 'object' && (p2._raw as Record<string, unknown>).product_quantity_unit) {
                                        unitOnly = String((p2._raw as Record<string, unknown>).product_quantity_unit);
                                    } else if (typeof p2.quantity === 'string') {
                                        const m2 = String(p2.quantity).trim().match(/^\s*([0-9.,]+)\s*(.*)$/);
                                        if (m2) unitOnly = (m2[2] || '').trim();
                                    } else if (typeof p2.unit === 'string') {
                                        unitOnly = String(p2.unit).trim();
                                    }
                                    if (unitOnly) setUnit(unitOnly);
                                } catch { /* ignore */ }
                                // Keep existing storageLocation (do not overwrite)
                                if (payload.image_url) setIcon(String(payload.image_url));
                                setBarcode(String(payload.barcode || code));
                                message.success(i18n.t('form.notifications.scanResolved') || 'Artikelvorschlag gefunden und vorgeladen');
                                // If nutriments are present, prefill nutrient form fields
                                try {
                                    const pnut = (payload as unknown as Record<string, unknown>).nutriments as Record<string, unknown> | undefined;
                                    if (pnut && typeof pnut === 'object') {
                                        const base = NutrientFactory();
                                        // helper to extract numeric value; check multiple possible OF key variants
                                        const getVal = (k: string) => {
                                            const candidates: string[] = [];
                                            candidates.push(k + '_value', k + '_100g', k + '_serving', k + '_unit', k);
                                            // common alternative spellings for fiber
                                            if (k === 'fiber') {
                                                candidates.push('dietary-fiber', 'dietary_fiber', 'dietary-fiber_100g', 'fiber_100g');
                                            }
                                            // try each candidate in order
                                            for (const c of candidates) {
                                                const v = (pnut as Record<string, unknown>)[c];
                                                if (typeof v === 'number') return v;
                                                if (typeof v === 'string') {
                                                    const n = Number(String(v).replace(',', '.'));
                                                    if (!isNaN(n)) return n;
                                                }
                                            }
                                            return NaN;
                                        };
                                        // Map common keys
                                        const mapping: Record<string, string> = {
                                            'Proteine': 'proteins',
                                            'Kohlenhydrate': 'carbohydrates',
                                            'Fett': 'fat',
                                            'Zucker': 'sugars',
                                            'Ballaststoffe': 'fiber',
                                            'gesättigte Fettsäuren': 'saturated-fat',
                                            'Energie': 'energy-kcal',
                                            'Salz': 'salt',
                                        };
                                        // Also accept OF keys mapping provided by the user for completeness
                                        const ofToGerman: Record<string, string> = {
                                            'carbohydrates': 'Kohlenhydrate',
                                            'energy': 'Energie',
                                            'energy-kcal': 'Energie',
                                            'fat': 'Fett',
                                            'fruits-vegetables-legumes-estimate-from-ingredients': 'fruechte-gemuese-huelsenfruechte-geschaetzt',
                                            'fruits-vegetables-nuts-estimate-from-ingredients': 'fruechte-gemuese-nuesse-geschaetzt',
                                            'nova-group': 'nova-gruppe',
                                            'nutrition-score-fr': 'ernaehrungs-score-fr',
                                            'proteins': 'Proteine',
                                            'salt': 'Salz',
                                            'saturated-fat': 'gesaettigte-fettsaeuren',
                                            'sodium': 'Salz',
                                            'sugars': 'Zucker'
                                        };
                                        // Support alternative OF keys for fiber/sugars (many variants exist)
                                        const altKeys = (baseName: string) => [
                                            baseName,
                                            `${baseName}_100g`,
                                            `${baseName}_value`,
                                            `${baseName}_serving`
                                        ];
                                        for (const nf of base) {
                                            let key = mapping[nf.name];
                                            // fallback: try reverse lookup in ofToGerman (if mapping absent)
                                            if (!key) {
                                                // find OF key that maps to this german name
                                                const found = Object.entries(ofToGerman).find(([, g]) => g === nf.name || g.toLowerCase() === nf.name.toLowerCase());
                                                if (found) key = found[0];
                                            }
                                            if (!key) continue;
                                            const val = getVal(key);
                                            if (!isNaN(val)) {
                                                if (nf.values && nf.values.length > 0) nf.values[0].value = Number(val);
                                            }
                                        }
                                        // Add extra nutrient entries for OF keys that don't exist in base
                                        for (const [ofKey, germanName] of Object.entries(ofToGerman)) {
                                            // skip those that are already in base
                                            if (base.some(b => b.name === germanName || b.name.toLowerCase() === germanName.toLowerCase())) continue;
                                            const val = getVal(ofKey);
                                            if (!isNaN(val)) {
                                                // Create a NutrientFactoryType-shaped object instead of using `any`
                                                const extra: import('../../../types/Types').NutrientFactoryType = {
                                                    id: Date.now(),
                                                    name: germanName,
                                                    color: '#999999',
                                                    values: [{ typ: 'g', value: Number(val) }]
                                                };
                                                base.push(extra);
                                            }
                                        }
                                        // NutrientFactory() returns an array compatible with NutrientValueModel[]
                                        setNutrients(base as unknown as NutrientValueModel[]);
                                        // set nutrient meta fields
                                        setNutrientDescription(i18n.t('form.nutrientsFromOpenFoodFacts', { defaultValue: 'Nährwerte (OpenFoodFacts)' }));
                                        // prefer energy unit if available and populate nutrient-specific fields
                                        const enUnit = (pnut && (pnut['energy-kcal_unit'] ?? pnut['energy_unit'])) as unknown;
                                        if ((!nutrientUnit || nutrientUnit === '') && enUnit && typeof enUnit === 'string') setNutrientUnit(String(enUnit));
                                        if ((!nutrientAmount || nutrientAmount === '') && (pnut && (pnut['energy-kcal_100g'] ?? pnut['energy_100g']))) {
                                            setNutrientAmount(String(Number(pnut['energy-kcal_100g'] || pnut['energy_100g'])));
                                        }
                                        // keep previous behavior: if top-level amount/unit empty, fill them too
                                        if ((!unit || unit === '') && enUnit && typeof enUnit === 'string') setUnit(String(enUnit));
                                        if ((!amount || amount === '') && (pnut && (pnut['energy-kcal_100g'] ?? pnut['energy_100g']))) {
                                            setAmount(String(Number(pnut['energy-kcal_100g'] || pnut['energy_100g'])));
                                        }
                                    }
                                } catch { /* ignore */ }
                            } else {
                                // Not found: just fill barcode field
                                setBarcode(code);
                                message.info(i18n.t('form.notifications.scanRecorded') || 'Barcode erfasst');
                            }
                        } catch (e: unknown) {
                            // On error, try to extract JSON body (some backends return 404 with a JSON payload)
                            try {
                                // Narrow the error shape without using `any` to satisfy eslint
                                type AxiosErrorLike = { response?: { data?: unknown } };
                                type BarcodeLookupBody = {
                                    status?: number;
                                    status_verbose?: string;
                                    message?: string;
                                    product?: unknown;
                                    source?: string;
                                    barcode?: string;
                                };
                                const errLike = e as AxiosErrorLike;
                                const body = (errLike?.response?.data ?? null) as BarcodeLookupBody | null;
                                // If the backend included an OpenFoodFacts 'not found' payload, show a friendly info alert
                                if (body && (
                                    body.status === 0 ||
                                    (body.status_verbose && String(body.status_verbose).toLowerCase().includes('not found')) ||
                                    (typeof body.message === 'string' && body.message.toLowerCase().includes('not found')) ||
                                    (body.product == null && body.source === 'openfoodfacts')
                                )) {
                                    const backendMsg = (body.message || body.status_verbose || null) as string | null;
                                    // If backend only returns the generic 'not found' message, prefer a user-friendly localized string
                                    let msg: string;
                                    const normalized = backendMsg && typeof backendMsg === 'string' ? backendMsg.trim().toLowerCase() : '';
                                    if (normalized && normalized !== 'not found') {
                                        msg = `${backendMsg} (${code})`;
                                    } else {
                                        msg = i18n.t('form.notifications.scanProductNotFound', { barcode: code, defaultValue: `Produkt für Barcode ${code} nicht gefunden — Formular manuell ausfüllen und speichern.` });
                                    }
                                    setLookupNotFound(msg);
                                    setBarcode(code);
                                } else {
                                    // Generic fallback: keep barcode populated so the user can manually fill
                                    setBarcode(code);
                                }
                            } catch (innerErr) {
                                // If anything goes wrong while interpreting the error, fallback to basic behavior
                                setBarcode(code);
                            }
                        }

                        // Close modal after lookup completed so user sees prefilled values.
                        // For minimal view keep immediate close to keep compact UX.
                        // small delay to ensure UI updates are visible before modal closes
                        setTimeout(() => setScannerVisible(false), 300);
                    }}
                    initialAutoStart={true}
                />
            </Modal>
        </div>
    );

}
