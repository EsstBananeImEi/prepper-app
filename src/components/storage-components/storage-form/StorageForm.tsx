import React, { ReactElement, SyntheticEvent, useState, useEffect, useMemo } from 'react';
import { Descriptions, Image, Input, Select, Button, Alert, Upload, message, Card, Steps } from 'antd';
import { PlusOutlined, MinusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
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

// No‑Op Callback (anstatt leerer Funktionen)
const noop = () => {
    // intentionally left blank
};

export default function StorageDetailForm(): ReactElement {
    const { id } = useParams<{ id?: string }>();
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

    // Optionen aus der DB
    const [dbCategories, setDbCategories] = useState<{ id: number; name: string }[]>([]);
    const [dbStorageLocations, setDbStorageLocations] = useState<{ id: number; name: string }[]>([]);
    const [dbItemUnits, setDbItemUnits] = useState<{ id: number; name: string }[]>([]);
    const [dbPackageUnits, setDbPackageUnits] = useState<{ id: number; name: string }[]>([]);
    const [dbNutrientUnits, setDbNutrientUnits] = useState<{ id: number; name: string }[]>([]);

    // Wizard state
    const [currentStep, setCurrentStep] = useState<number>(0);

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
    const dbItemUnitsFiltered = useMemo(() => dbItemUnits.filter(u => !popularUnits.includes(u.name)), [dbItemUnits, popularUnits]);
    const dbStorageLocationsFiltered = useMemo(() => dbStorageLocations.filter(l => !popularLocations.includes(l.name)), [dbStorageLocations, popularLocations]);
    const dbPackageUnitsFiltered = useMemo(() => dbPackageUnits.filter(p => !popularPackageUnits.includes(p.name)), [dbPackageUnits, popularPackageUnits]);

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

    // Load options once when component mounts
    useEffect(() => {
        storageApi('GET', optionsCategoriesApi, setDbCategories);
        storageApi('GET', optionsStorageLocationsApi, setDbStorageLocations);
        storageApi('GET', optionsItemUnitsApi, setDbItemUnits);
        storageApi('GET', optionsPackageUnitsApi, setDbPackageUnits);
        storageApi('GET', optionsNutrientUnitsApi, setDbNutrientUnits);
    }, []); // Run only once



    if (!storageItem && !isNew) {
        return <LoadingSpinner message="Loading storage item..." />;
    }    // Enhanced Upload Handler with validation and compression
    const handleBeforeUpload = async (file: File) => {
        try {
            message.loading('Bild wird verarbeitet...', 0);

            console.group('🖼️ Image Upload Debug');
            console.log('File info:', {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified
            });

            // Validate and convert file to Base64
            const validationResult = await fileToBase64(file);

            console.log('Validation result:', validationResult);

            if (!validationResult.isValid) {
                console.error('Validation failed:', validationResult.error);
                console.groupEnd();
                message.destroy();
                message.error(`${validationResult.error || 'Ungültige Bilddaten'} [File: ${file.name}, Type: ${file.type}]`);
                return false;
            } let processedImage = validationResult.processedData!;

            // Enhanced debugging with detailed image analysis
            debugImageData(processedImage, `Upload Handler - ${file.name}`);

            console.log('Processed image info:', {
                length: processedImage.length,
                startsWithDataUrl: processedImage.startsWith('data:'),
                mimeType: processedImage.split(',')[0]
            });

            // Compress if image is large
            const imageSizeKB = (processedImage.length * 3) / 4 / 1024;
            console.log('Image size:', Math.round(imageSizeKB * 100) / 100, 'KB');

            if (imageSizeKB > 500) { // Compress if larger than 500KB
                try {
                    console.log('Compressing image...');
                    processedImage = await compressBase64Image(processedImage, 800, 600, 0.8);
                    const newSizeKB = (processedImage.length * 3) / 4 / 1024;
                    console.log('Compressed to:', Math.round(newSizeKB * 100) / 100, 'KB');
                    message.info('Bild wurde komprimiert für bessere Performance');
                } catch (compressionError) {
                    console.warn('Compression failed, using original:', compressionError);
                }
            }

            setIcon(processedImage);
            console.log('Image set successfully');
            console.groupEnd();
            message.destroy();
            message.success('Bild erfolgreich geladen');
        } catch (error) {
            console.error('Image processing error:', error);
            console.groupEnd();
            message.destroy();
            message.error('Fehler beim Verarbeiten des Bildes');
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
        // Validate and sanitize icon data for API
        let processedIcon = '';
        if (icon) {
            console.group('🔧 Processing Icon for API');
            console.log('Original icon length:', icon.length);
            console.log('Icon starts with data URL:', icon.startsWith('data:'));

            const iconValidation = validateBase64Image(icon); console.log('Icon validation result:', iconValidation); if (iconValidation.isValid) {
                // EXPERIMENTAL: Try data URL format first since backend might expect it
                // Many backends expect the full data URL instead of just Base64
                processedIcon = ensureDataUrlPrefix(iconValidation.processedData || icon);
                console.log('Processed icon with data URL prefix');
                console.log('Processed icon length:', processedIcon.length);
                console.log('First 50 chars:', processedIcon.substring(0, 50));

                // Additional debugging: Test what backend might expect
                console.group('🔬 Backend Format Testing'); console.log('Option 1 - With data URL (NEW APPROACH):', processedIcon.substring(0, 50) + '...');
                console.log('Option 2 - Pure Base64 (old approach):', sanitizeBase64ForApi(processedIcon).substring(0, 30) + '...');
                console.log('Option 3 - Original icon:', icon.substring(0, 50) + '...');

                // Test if it's a valid image format
                try {
                    const binaryTest = window.atob(processedIcon.substring(0, 20));
                    const bytes = new Uint8Array(binaryTest.length);
                    for (let i = 0; i < binaryTest.length; i++) {
                        bytes[i] = binaryTest.charCodeAt(i);
                    }

                    // Check image signature
                    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
                        console.log('✅ Detected JPEG format');
                    } else if (bytes[0] === 0x89 && bytes[1] === 0x50) {
                        console.log('✅ Detected PNG format');
                    } else {
                        console.warn('❓ Unknown image format, first bytes:', Array.from(bytes.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));
                    }
                } catch (e) {
                    console.error('❌ Cannot decode Base64 for format detection:', e);
                }
                console.groupEnd();
            } else {
                console.warn('Invalid icon data, attempting repair:', iconValidation.error);
                console.warn('Icon preview:', icon.substring(0, 100));

                // Try to repair the image data
                const repairResult = repairBase64Image(icon);
                if (repairResult.isValid && repairResult.processedData) {
                    console.log('✅ Image data repaired successfully');
                    processedIcon = ensureDataUrlPrefix(repairResult.processedData);
                } else {
                    console.error('❌ Could not repair image data:', repairResult.error);
                    // Set empty icon if repair also fails
                    processedIcon = '';
                }
            }
            console.groupEnd();
        }

        return {
            ...initialItem,
            name: name.trim(),
            amount: Number(amount) || 0,
            lowestAmount: Number(lowestAmount) || 0,
            midAmount: Number(midAmount) || 0,
            unit: unit.trim(),
            packageQuantity: packageQuantity && packageQuantity.trim() !== '' ? Number(packageQuantity) : undefined,
            packageUnit: packageUnit.trim(),
            storageLocation: storageLocation.trim(),
            categories: categories.filter(cat => cat && cat.trim() !== ''), // Remove empty categories
            icon: processedIcon,
            nutrients: {
                description: nutrientDescription.trim(),
                unit: nutrientUnit.trim(),
                amount: Number(nutrientAmount) || 100, values: nutrients.map(nutrient => ({
                    ...nutrient,
                    name: nutrient.name.trim(),
                    color: nutrient.color.trim(),
                    values: nutrient.values.filter(val => val.typ && val.typ.trim() !== '') // Remove empty values
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

        console.group('💾 Saving Storage Item');
        console.log('Item Data:', updatedItem);
        console.log('Is New:', isNew);
        console.log('ID:', id);

        // Detailed debugging for icon if icon is != ''
        if (updatedItem.icon && updatedItem.icon !== '') {
            console.group('🖼️ Icon Details for Save');
            console.log('Icon length:', updatedItem.icon.length);
            console.log('First 50 chars:', updatedItem.icon.substring(0, 50));
            console.log('Last 50 chars:', updatedItem.icon.substring(Math.max(0, updatedItem.icon.length - 50)));
            console.log('Contains data URL prefix:', updatedItem.icon.startsWith('data:'));

            // Test Base64 validity
            try {
                const testData = updatedItem.icon.startsWith('data:') ? updatedItem.icon.split(',')[1] : updatedItem.icon;
                window.atob(testData.substring(0, Math.min(100, testData.length)));
                console.log('✅ Icon Base64 is valid');
            } catch (error) {
                console.error('❌ Icon Base64 is invalid:', error);
            }
            console.groupEnd();
        }
        console.groupEnd();

        try {
            if (isNew) {
                await actionHandler({ type: 'ADD_STORAGE_ITEM', storageItem: updatedItem }, dispatch);
                message.success('Item erfolgreich erstellt');
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

                message.success('Item erfolgreich aktualisiert');
            }
            history(itemsRoute);
        } catch (error: unknown) {
            console.group('🚨 Save Error Details');
            console.error('Error object:', error);
            console.error('Error type:', typeof error);
            console.error('Error constructor:', error?.constructor?.name);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            console.groupEnd();

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
                <Steps
                    current={currentStep}
                    onChange={onStepChange}
                    items={[
                        { title: 'Basis' },
                        { title: 'Details' },
                        { title: 'Verpackung' },
                        { title: 'Bild' },
                        { title: 'Nährwerte' },
                    ]}
                />

                {currentStep === 0 && (
                    <div className={css.itemFields} style={{ marginTop: 16 }}>
                        <div className={css.itemFieldRow}>
                            <label>Name<span style={{ color: 'red' }}> *</span></label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Name"
                            />
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>Menge<span style={{ color: 'red' }}> *</span></label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Menge (Zahl)"
                            />
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>Mengeneinheit (optional)</label>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                value={unit ? [unit] : []}
                                placeholder="z. B. Stück, kg, l – oder eigenen Wert eingeben"
                                onChange={(vals: string[]) => setUnit(vals.slice(-1)[0] || '')}
                            >
                                {popularUnits.length > 0 && (
                                    <Select.OptGroup label="Beliebt">
                                        {popularUnits.map((u) => (
                                            <Select.Option key={`pop-u-${u}`} value={u}>
                                                {u}
                                            </Select.Option>
                                        ))}
                                    </Select.OptGroup>
                                )}
                                {dbItemUnitsFiltered.map((itemUnit) => (
                                    <Select.Option key={itemUnit.id} value={itemUnit.name}>
                                        {itemUnit.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className={css.itemFields} style={{ marginTop: 16 }}>
                        <div className={css.itemFieldRow}>
                            <label>Kategorien</label>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                value={categories}
                                placeholder="Kategorie eingeben oder auswählen"
                                onChange={(value) => setCategories(value.slice(-1))}
                            >
                                {dbCategories.map((category) => (
                                    <Select.Option key={category.id} value={category.name}>
                                        {category.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>Aufbewahrungsort</label>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                value={storageLocation ? [storageLocation] : []}
                                placeholder="Aufbewahrungsort eingeben oder auswählen"
                                onChange={(val: string[]) => setStorageLocation((val.slice(-1)[0] || ''))}
                            >
                                {popularLocations.length > 0 && (
                                    <Select.OptGroup label="Beliebt">
                                        {popularLocations.map((loc) => (
                                            <Select.Option key={`pop-l-${loc}`} value={loc}>
                                                {loc}
                                            </Select.Option>
                                        ))}
                                    </Select.OptGroup>
                                )}
                                {dbStorageLocationsFiltered.map((location) => (
                                    <Select.Option key={location.id} value={location.name}>
                                        {location.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>Warnschwelle (niedrig)</label>
                            <Input
                                type="number"
                                value={lowestAmount}
                                onChange={(e) => setLowestAmount(e.target.value)}
                                placeholder="z. B. 2 – warnt bei Bestand ≤ 2"
                            />
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>Warnschwelle (mittel)</label>
                            <Input
                                type="number"
                                value={midAmount}
                                onChange={(e) => setMidAmount(e.target.value)}
                                placeholder="z. B. 5 – zusätzliche Warnstufe"
                            />
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className={css.itemFields} style={{ marginTop: 16 }}>
                        <div className={css.itemFieldRow}>
                            <label>Packungsgröße</label>
                            <Input
                                type="number"
                                value={packageQuantity}
                                onChange={(e) => setPackageQuantity(e.target.value)}
                                placeholder="z. B. 6"
                            />
                        </div>
                        <div className={css.itemFieldRow}>
                            <label>Packungseinheit</label>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                value={packageUnit ? [packageUnit] : []}
                                placeholder="z. B. Stück, Packung – oder eigenen Wert eingeben"
                                onChange={(val: string[]) => setPackageUnit((val.slice(-1)[0] || ''))}
                            >
                                {popularPackageUnits.length > 0 && (
                                    <Select.OptGroup label="Beliebt">
                                        {popularPackageUnits.map((pu) => (
                                            <Select.Option key={`pop-pu-${pu}`} value={pu}>
                                                {pu}
                                            </Select.Option>
                                        ))}
                                    </Select.OptGroup>
                                )}
                                {dbPackageUnitsFiltered.map((pkgUnit) => (
                                    <Select.Option key={pkgUnit.id} value={pkgUnit.name}>
                                        {pkgUnit.name}
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
                                src={icon ? ensureDataUrlPrefix(icon) : '/default.png'}
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
                                        Bildvorschau
                                    </div>
                                }
                                fallback="/default.png"
                            />
                        </Image.PreviewGroup>
                        <Upload beforeUpload={handleBeforeUpload} showUploadList={false} accept="image/*">
                            <Button icon={<UploadOutlined />}>Bild hochladen</Button>
                        </Upload>
                        {icon && (
                            <Button
                                type="link"
                                size="small"
                                onClick={() => setIcon('')}
                                style={{ marginTop: 4 }}
                            >
                                Bild entfernen
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
                        <Descriptions.Item label={"Nährwertangaben pro " + nutrientAmount + " " + nutrientUnit} style={{ fontWeight: 'bold', padding: '10px 10px', display: 'block', textAlign: 'center' }}>
                            <div className={css.nutrientAmountUnit}>
                                <div className={css.nutrientField}>
                                    <label>Menge</label>
                                    <Input
                                        type="number"
                                        value={nutrientAmount}
                                        onChange={(e) => setNutrientAmount(e.target.value)}
                                        placeholder="z. B. 100"
                                    />
                                </div>
                                <div className={css.nutrientField}>
                                    <label>Einheit</label>
                                    <Select
                                        style={{ width: '100%' }}
                                        value={nutrientUnit || ''}
                                        placeholder="Einheit"
                                        onChange={(val: string) => setNutrientUnit(val || '')}
                                    >
                                        {dbItemUnits.map((itemUnit) => (
                                            <Select.Option key={itemUnit.id} value={itemUnit.name}>
                                                {itemUnit.name}
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
                                                        placeholder="Farbcode"
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
                                                    placeholder="Nährstoff"
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
                                                            placeholder="Wert (Zahl)"
                                                            onChange={(e) =>
                                                                onChangeNutrientType(nutrientIndex, typeIndex, 'value', e.target.value)
                                                            }
                                                            className={css.nutrientValueInput}
                                                        />
                                                        <Select
                                                            value={nutrientType.typ ? nutrientType.typ : ''}
                                                            placeholder="Einheit"
                                                            onChange={(val: string) =>
                                                                onChangeNutrientType(nutrientIndex, typeIndex, 'typ', val || '')
                                                            }
                                                            className={css.nutrientTypeSelect}
                                                            style={{ fontWeight: 'normal' }}
                                                        >
                                                            {dbNutrientUnits.map((option) => (
                                                                <Select.Option key={option.id} value={option.name}>
                                                                    {option.name}
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
                                                    Gesamten Nährstoff entfernen
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={addNutrient}
                                    className={css.addNutrientButton}
                                >
                                    Nährstoff hinzufügen
                                </Button>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Card>

            <div className={css.actionBar}>
                {!isNew && (
                    <Button className={css.formButton} onClick={onCancel} type="default">Go Back</Button>
                )}
                <Button className={css.formButton} onClick={prev} disabled={currentStep === 0}>Zurück</Button>
                {currentStep < 4 && (
                    <Button className={css.formButton} type="default" onClick={next}>Weiter</Button>
                )}
                <Button className={css.formButton} onClick={onSave} type="primary" loading={saving}>Speichern</Button>
                {isNew ? (
                    <Button className={css.formButton} onClick={onCancel}>Cancel</Button>
                ) : (
                    <Button className={css.formButton} onClick={(e) => onDelete(e)} danger>Delete</Button>
                )}
            </div>
        </div>
    );
}
