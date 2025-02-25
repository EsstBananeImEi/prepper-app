import React, { ReactElement, SyntheticEvent, useState, useEffect } from 'react';
import { Descriptions, Image, Input, Select, Button, Alert, Upload } from 'antd';
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
import { i } from 'react-router/dist/development/fog-of-war-CCAcUMgB';

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

    // Für Speichern & Fehleranzeige
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string>('');

    // Bei Laden des Items aus der DB initialisieren wir die States
    useEffect(() => {
        if (storageItem) {
            setName(storageItem.name);
            setAmount(storageItem.amount.toString());
            setLowestAmount(storageItem.lowestAmount.toString());
            setMidAmount(storageItem.midAmount.toString());
            setUnit(storageItem.unit);
            setPackageQuantity(storageItem.packageQuantity != null ? storageItem.packageQuantity.toString() : '');
            setPackageUnit(storageItem.packageUnit || '');
            setStorageLocation(storageItem.storageLocation);
            setCategories(storageItem.categories || []);
            setIcon(storageItem.icon || ''); // icon kommt als Base64-String aus der DB
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
        storageApi('GET', optionsCategoriesApi, setDbCategories);
        storageApi('GET', optionsStorageLocationsApi, setDbStorageLocations);
        storageApi('GET', optionsItemUnitsApi, setDbItemUnits);
        storageApi('GET', optionsPackageUnitsApi, setDbPackageUnits);
        storageApi('GET', optionsNutrientUnitsApi, setDbNutrientUnits);
    }, [storageItem]);



    if (!storageItem && !isNew) {
        return <LoadingSpinner message="Loading storage item..." />;
    }

    // Custom Upload Handler: Wandelt die ausgewählte Bilddatei in einen Base64-String um
    const handleBeforeUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result as string;
            setIcon(base64String);
        };
        reader.onerror = () => {
            console.error("Fehler beim Lesen der Datei.");
        };
        reader.readAsDataURL(file);
        // Rückgabe false verhindert den automatischen Upload
        return false;
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
    };

    // Beim Speichern werden numerische Werte konvertiert
    const getUpdatedItem = (): StorageModel => ({
        ...initialItem,
        name,
        amount: Number(amount),
        lowestAmount: Number(lowestAmount),
        midAmount: Number(midAmount),
        unit,
        packageQuantity: packageQuantity !== '' ? Number(packageQuantity) : undefined,
        packageUnit,
        storageLocation,
        categories,
        icon, // icon als Base64-String
        nutrients: {
            description: nutrientDescription,
            unit: nutrientUnit,
            amount: Number(nutrientAmount),
            values: nutrients,
        },
    });

    // Validierung der Pflichtfelder: Name, Amount, Unit, Storage Location
    const validateRequiredFields = (): boolean => {
        if (
            name.trim() === '' ||
            amount.trim() === '' ||
            unit.trim() === ''
        ) {
            setSaveError(
                'Bitte füllen Sie alle Pflichtfelder aus: Name, Amount und Unit'
            );
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
        }
        return true;
    };

    const onSave = async () => {
        setSaving(true);
        setSaveError('');
        if (!validateRequiredFields()) {
            setSaving(false);
            return;
        }
        const updatedItem = getUpdatedItem();
        try {
            if (isNew) {
                await actionHandler({ type: 'ADD_STORAGE_ITEM', storageItem: updatedItem }, dispatch);
            } else if (id) {
                await Promise.all([
                    actionHandler({ type: 'UPDATE_STORAGE_ITEM', storageItem: updatedItem }, dispatch),
                    actionHandler({ type: 'UPDATE_NUTRIENT_ITEM', storageItem: updatedItem }, dispatch),
                ]);
                if (store.shoppingCard.find(item => item.name === updatedItem.name || item.name === initialItem.name)) {
                    await actionHandler({ type: 'UPDATE_CARD_ITEM', basketItems: getBasketModel(updatedItem) }, dispatch);
                }
            }
            history(itemsRoute);
        } catch (error: unknown) {
            let errorMessage = 'Fehler beim Speichern des Items';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.error || error.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error('Fehler beim Speichern:', error);
            setSaveError(errorMessage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSaving(false);
        }
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
            {/* Bildvorschau und Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                <Image.PreviewGroup>
                    <Image width={150} alt={name} src={icon || '/default.png'} />
                </Image.PreviewGroup>
                <Upload beforeUpload={handleBeforeUpload} showUploadList={false}>
                    <Button icon={<UploadOutlined />}>Bild hochladen</Button>
                </Upload>
            </div>

            <div className={css.itemFormCard}>
                <div className={css.itemHeader}>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name des Items"
                    />
                    <span style={{ color: 'red' }}> *</span>
                </div>
                <div className={css.itemFields}>
                    <div className={css.itemFieldRow}>
                        <label>Amount<span style={{ color: 'red' }}> *</span></label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Pflichtfeld"
                        />
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Categories</label>
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            value={categories}
                            placeholder="Kategorie(n)"
                            onChange={(value) => setCategories(value.slice(-1))}  // entweder auswählen oder eigenen Eintrag verwenden
                        >
                            {dbCategories.map((category) => (
                                <Select.Option key={category.id} value={category.name}>
                                    {category.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Minimal Warn</label>
                        <Input
                            type="number"
                            value={lowestAmount}
                            onChange={(e) => setLowestAmount(e.target.value)}
                        />
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Middel Warn</label>
                        <Input
                            type="number"
                            value={midAmount}
                            onChange={(e) => setMidAmount(e.target.value)}
                        />
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Unit<span style={{ color: 'red' }}> *</span></label>
                        <Select
                            style={{ width: '100%' }}
                            value={unit ? unit : ''}
                            placeholder="Pflichtfeld"
                            onChange={(val: string) => setUnit(val || '')}
                        >
                            {dbItemUnits.map((itemUnit) => (
                                <Select.Option key={itemUnit.id} value={itemUnit.name}>
                                    {itemUnit.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Package Quantity</label>
                        <Input
                            type="number"
                            value={packageQuantity}
                            onChange={(e) => setPackageQuantity(e.target.value)}
                        />
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Package Unit</label>
                        <Select
                            style={{ width: '100%' }}
                            value={packageUnit ? packageUnit : ''}
                            placeholder="Package Unit"
                            onChange={(val: string) => setPackageUnit(val || '')}
                        >
                            {dbPackageUnits.map((pkgUnit) => (
                                <Select.Option key={pkgUnit.id} value={pkgUnit.name}>
                                    {pkgUnit.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Storage Location</label>
                        <Select
                            style={{ width: '100%' }}
                            value={storageLocation ? storageLocation : ''}
                            placeholder="Pflichtfeld"
                            onChange={(val: string) => setStorageLocation(val || '')}
                        >
                            {dbStorageLocations.map((location) => (
                                <Select.Option key={location.id} value={location.name}>
                                    {location.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>
            <Descriptions
                bordered
                style={{
                    backgroundColor: '#f5f5f5',
                    marginTop: 16,
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                <Descriptions.Item label={"Nährstoffangaben pro " + nutrientAmount + " " + nutrientUnit} style={{ fontWeight: 'bold', padding: '10px 10px', display: 'block', textAlign: 'center' }}>
                    <div className={css.nutrientAmountUnit}>
                        <div className={css.nutrientField}>
                            <label>Amount</label>
                            <Input
                                type="number"
                                value={nutrientAmount}
                                onChange={(e) => setNutrientAmount(e.target.value)}
                                placeholder="Amount"
                            />
                        </div>
                        <div className={css.nutrientField}>
                            <label>Unit</label>
                            <Select
                                style={{ width: '100%' }}
                                value={nutrientUnit || ''}
                                placeholder="Unit"
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
                                                    placeholder="Wert"
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
            <div className={css.buttonContainer}>
                <Button className={css.formButton} onClick={onCancel} type="default">
                    Go Back
                </Button>
                <Button className={css.formButton} onClick={onSave} type="primary" loading={saving}>
                    Save
                </Button>
                <Button className={css.formButton} onClick={(e) => onDelete(e)} danger>
                    Delete
                </Button>
            </div>
        </div>
    );
}
