import React, { ReactElement, SyntheticEvent, useState, useEffect, useMemo, useRef } from 'react';
import { Descriptions, Image, Input, Select, Button, Alert, Upload, message, Card, Steps } from 'antd';
import { Modal } from 'antd';
import { PlusOutlined, MinusOutlined, UploadOutlined } from '@ant-design/icons';
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
    const [scanQuota, setScanQuota] = useState<{ is_premium: boolean; remaining: number | null; limit?: number } | null>(null);
    const [packageQuantity, setPackageQuantity] = useState<string>(
        isNew || initialItem.packageQuantity == null ? '' : initialItem.packageQuantity.toString()
    );
    const [packageUnit, setPackageUnit] = useState<string>(initialItem.packageUnit || '');
    const [storageLocation, setStorageLocation] = useState<string>(initialItem.storageLocation);
    const [categories, setCategories] = useState<string[]>(initialItem.categories || []);
    // icon wird als Base64-String gespeichert
    const [icon, setIcon] = useState<string>(initialItem.icon || '');
    const [nutrientDescription, setNutrientDescription] = useState<string>(initialItem.nutrients?.description || '');
    const [nutrientUnit, setNutrientUnit] = useState<string>(initialItem.nutrients?.unit || '');
    const [nutrientAmount, setNutrientAmount] = useState<string>(
        isNew || !initialItem.nutrients?.amount ? '' : initialItem.nutrients.amount.toString()
    );
    const [nutrients, setNutrients] = useState<NutrientValueModel[]>(
        initialItem.nutrients?.values || []
    );

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

    // Load scan quota for user (if logged in) - only when scan API enabled
    useEffect(() => {
        let mounted = true;
        api({ method: 'GET', url: '/scans/quota' }).then((res) => {
            if (!mounted) return;
            setScanQuota(res.data || null);
        }).catch(() => { });
        return () => { mounted = false; };
    }, []);

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
            setNutrientDescription(storageItem.nutrients?.description || '');
            setNutrientUnit(storageItem.nutrients?.unit || '');
            setNutrientAmount(
                storageItem.nutrients && storageItem.nutrients.amount
                    ? storageItem.nutrients.amount.toString()
                    : ''
            );
            if (!storageItem.nutrients || storageItem.nutrients.values.length === 0) {
                setNutrients(NutrientFactory());
            } else {
                setNutrients(storageItem.nutrients.values);
            }
        }
    }, [id]); // Only depend on id, not the entire storageItem

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



    if (!storageItem && !isNew) {
        return <LoadingSpinner message={t('detail.loadingItems')} />;
    }    // Enhanced Upload Handler with validation and compression
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

    const addNutrient = () => {
        setNutrients((curr) => [
            ...curr,
            {
                id: Date.now(),
                name: '',
                color: '#000000',
                values: [
                    {
                        typ: '',
                        value: 0,
                    },
                ],
            },
        ]);
    };

    const removeNutrient = (nutrientIndex: number) => {
        setNutrients((curr) => {
            const updated = [...curr];
            updated.splice(nutrientIndex, 1);
            return updated;
        });
    };

    const addNutrientType = (nutrientIndex: number) => {
        setNutrients((curr) => {
            const updated = [...curr];
            const nutrient = { ...updated[nutrientIndex] };
            nutrient.values = [...nutrient.values, { typ: '', value: 0 }];
            updated[nutrientIndex] = nutrient;
            return updated;
        });
    };

    const removeNutrientType = (nutrientIndex: number, typeIndex: number) => {
        setNutrients((curr) => {
            const updated = [...curr];
            const nutrient = { ...updated[nutrientIndex] };
            nutrient.values = nutrient.values.filter((_, idx) => idx !== typeIndex);
            updated[nutrientIndex] = nutrient;
            return updated;
        });
    };    // Beim Speichern werden numerische Werte konvertiert und Daten validiert
    const getUpdatedItem = (): StorageModel => {
        const t = (s?: string | null) => (s ?? '').trim();
        // Validate and sanitize icon data for API
        let processedIcon = '';
        if (icon) {
            logger.group('🔧 Processing Icon for API');
            logger.log('Original icon length:', icon.length);
            logger.log('Icon starts with data URL:', icon.startsWith('data:'));

            const iconValidation = validateBase64Image(icon); logger.log('Icon validation result:', iconValidation); if (iconValidation.isValid) {
                // EXPERIMENTAL: Try data URL format first since backend might expect it
                // Many backends expect the full data URL instead of just Base64
                processedIcon = ensureDataUrlPrefix(iconValidation.processedData || icon);
                logger.log('Processed icon with data URL prefix');
                logger.log('Processed icon length:', processedIcon.length);
                logger.log('First 50 chars:', processedIcon.substring(0, 50));

                // Additional debugging: Test what backend might expect
                logger.group('🔬 Backend Format Testing'); logger.log('Option 1 - With data URL (NEW APPROACH):', processedIcon.substring(0, 50) + '...');
                logger.log('Option 2 - Pure Base64 (old approach):', sanitizeBase64ForApi(processedIcon).substring(0, 30) + '...');
                logger.log('Option 3 - Original icon:', icon.substring(0, 50) + '...');

                // Test if it's a valid image format
                try {
                    const binaryTest = window.atob(processedIcon.substring(0, 20));
                    const bytes = new Uint8Array(binaryTest.length);
                    for (let i = 0; i < binaryTest.length; i++) {
                        bytes[i] = binaryTest.charCodeAt(i);
                    }

                    // Check image signature
                    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
                        logger.log('✅ Detected JPEG format');
                    } else if (bytes[0] === 0x89 && bytes[1] === 0x50) {
                        logger.log('✅ Detected PNG format');
                    } else {
                        logger.warn('❓ Unknown image format, first bytes:', Array.from(bytes.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));
                    }
                } catch (e) {
                    logger.error('❌ Cannot decode Base64 for format detection:', e);
                }
                logger.groupEnd();
            } else {
                logger.warn('Invalid icon data, attempting repair:', iconValidation.error);
                logger.warn('Icon preview:', icon.substring(0, 100));

                // Try to repair the image data
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
                unit: t(nutrientUnit),
                amount: Number(nutrientAmount) || 100,
                values: (nutrients || []).map(nutrient => ({
                    ...nutrient,
                    name: t(nutrient.name),
                    color: t(nutrient.color),
                    values: (nutrient.values || []).filter(val => t(val.typ) !== '') // Remove empty values
                })).filter(nutrient => nutrient.name !== '') // Remove empty nutrients
            },
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

        // Validate icon if present
        if (icon && icon.trim() !== '') {
            const iconValidation = validateBase64Image(icon);
            if (!iconValidation.isValid) {
                errors.push(`Bild ungültig: ${iconValidation.error}`);
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
                                onChange={(e) => setName(e.target.value)}
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
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder={t('form.placeholders.barcode') || 'EAN / UPC / Code128'}
                                />
                                <Button onClick={async () => {
                                    // check quota before opening scanner (optional UX)
                                    try {
                                        const res = await api({ method: 'GET', url: '/scans/quota' });
                                        setScanQuota(res.data || null);
                                        if (res.data && res.data.remaining === 0 && !res.data.is_premium) {
                                            message.error(i18n.t('form.notifications.scanQuotaExceeded') || 'Scan-Limit erreicht. Upgrade auf Premium.');
                                            return;
                                        }
                                    } catch (e) {
                                        // ignore quota check failures and allow scanner
                                    }
                                    setScannerVisible(true);
                                }}>Scan</Button>
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
                                                {u}
                                            </Select.Option>
                                        ))}
                                    </Select.OptGroup>
                                )}
                                {itemUnitsFiltered.map((u) => (
                                    <Select.Option key={`u-${u}`} value={u}>
                                        {u}
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
                                                {pu}
                                            </Select.Option>
                                        ))}
                                    </Select.OptGroup>
                                )}
                                {packageUnitsFiltered.map((pu) => (
                                    <Select.Option key={`pu-${pu}`} value={pu}>
                                        {pu}
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
                        <Descriptions.Item label={t('form.nutrientsHeader', { amount: nutrientAmount || 100, unit: nutrientUnit })} style={{ fontWeight: 'bold', padding: '10px 10px', display: 'block', textAlign: 'center' }}>
                            <div className={css.nutrientAmountUnit}>
                                <div className={css.nutrientField}>
                                    <label>{t('form.labels.amount')}</label>
                                    <Input
                                        type="number"
                                        value={nutrientAmount}
                                        onChange={(e) => setNutrientAmount(e.target.value)}
                                        placeholder={t('form.placeholders.nutrientAmount')}
                                    />
                                </div>
                                <div className={css.nutrientField}>
                                    <label>{t('detail.table.unit')}</label>
                                    <Select
                                        style={{ width: '100%' }}
                                        value={nutrientUnit || ''}
                                        placeholder={t('form.placeholders.nutrientUnit')}
                                        onChange={(val: string) => setNutrientUnit(val || '')}
                                    >
                                        {mergedItemUnits.map((u) => (
                                            <Select.Option key={`mu-${u}`} value={u}>
                                                {u}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            <div className={css.nutrientCardsContainer}>
                                {nutrients
                                    .sort((a, b) => a.id - b.id)
                                    .map((nutrient, nutrientIndex) => (
                                        <div key={nutrient.id} className={css.nutrientCard}>
                                            <div className={css.nutrientHeader}>
                                                <div className={css.nutrientHeaderLeft}>
                                                    <div
                                                        className={css.nutrientColor}
                                                        style={{ backgroundColor: nutrient.color }}
                                                    ></div>
                                                    <Input
                                                        value={nutrient.color}
                                                        placeholder={t('form.placeholders.colorCode')}
                                                        onChange={(e) =>
                                                            onChangeNutrientColorCode(nutrientIndex, e.target.value)
                                                        }
                                                        className={css.nutrientColorInput}
                                                    />
                                                </div>
                                            </div>
                                            <div className={css.nutrientHeader}>
                                                <Input
                                                    value={nutrient.name}
                                                    placeholder={t('form.placeholders.nutrientName')}
                                                    onChange={(e) =>
                                                        onChangeNutrient(nutrientIndex, 'name', e.target.value)
                                                    }
                                                    className={css.nutrientNameInput}
                                                />
                                            </div>
                                            <div className={css.nutrientValues}>
                                                {nutrient.values.map((nutrientType, typeIndex) => (
                                                    <div key={typeIndex} className={css.nutrientValueRow}>
                                                        <Input
                                                            type="number"
                                                            value={nutrientType.value}
                                                            placeholder={t('form.placeholders.nutrientValue')}
                                                            onChange={(e) =>
                                                                onChangeNutrientType(nutrientIndex, typeIndex, 'value', e.target.value)
                                                            }
                                                            className={css.nutrientValueInput}
                                                        />
                                                        <Select
                                                            value={nutrientType.typ ? nutrientType.typ : ''}
                                                            placeholder={t('form.placeholders.nutrientUnit')}
                                                            onChange={(val: string) =>
                                                                onChangeNutrientType(nutrientIndex, typeIndex, 'typ', val || '')
                                                            }
                                                            className={css.nutrientTypeSelect}
                                                            style={{ fontWeight: 'normal' }}
                                                        >
                                                            {mergedNutrientUnits.map((nu) => (
                                                                <Select.Option key={`nu-${nu}`} value={nu}>
                                                                    {nu}
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                        <div className={css.nutrientValueActions}>
                                                            <MinusOutlined
                                                                onClick={() => removeNutrientType(nutrientIndex, typeIndex)}
                                                                className={css.removeNutrientTypeIcon}
                                                            />
                                                            {typeIndex === nutrient.values.length - 1 && (
                                                                <PlusOutlined
                                                                    onClick={() => addNutrientType(nutrientIndex)}
                                                                    className={css.addNutrientTypeButton}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={css.nutrientCardFooter}>
                                                <Button onClick={() => removeNutrient(nutrientIndex)} danger>
                                                    {t('form.buttons.removeNutrient')}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={addNutrient}
                                    className={css.addNutrientButton}
                                >
                                    {t('form.buttons.addNutrient')}
                                </Button>
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
                            if (body && body.product) {
                                const payload = body.product;
                                // Prefer product_name, fallback to generic name
                                if (payload.product_name || payload.name) setName(String(payload.product_name || payload.name));
                                // Use quantity (e.g. "330 g") or unit if available
                                const maybeUnit = (payload.quantity && String(payload.quantity)) || (payload.unit && String(payload.unit)) || '';
                                if (maybeUnit) setUnit(maybeUnit);
                                // Keep existing storageLocation (do not overwrite)
                                if (payload.image_url) setIcon(String(payload.image_url));
                                setBarcode(String(payload.barcode || code));
                                message.success(i18n.t('form.notifications.scanResolved') || 'Artikelvorschlag gefunden und vorgeladen');
                            } else {
                                // Not found: just fill barcode field
                                setBarcode(code);
                                message.info(i18n.t('form.notifications.scanRecorded') || 'Barcode erfasst');
                            }
                        } catch (e: unknown) {
                            // On error, fall back to local fill
                            setBarcode(code);
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
