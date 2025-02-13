import React, { ReactElement, SyntheticEvent, useState, useEffect } from 'react';
import { Descriptions, Image, Input, Select, Button, Alert } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
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
import { NutrientValueModel, StorageModel } from '../StorageModel';
import css from './StorageForm.module.css';

// No‑Op Callback (anstatt leerer Funktionen)
const noop = () => {
    // intentionally left blank
};

export default function StorageDetailForm(): ReactElement {
    const { id } = useParams<{ id?: string }>();
    const isNew = !id;
    const history = useHistory();
    const { store, dispatch } = useStore();
    const [dimensions] = useDemensions(() => 1, 0);

    const apiUrl: string = id ? itemIdApi(id) : '';
    const [storageItem, , axiosResponse] = useStorageApi<StorageModel>('GET', apiUrl);

    // Wird aus storageItem übernommen – bei neuen Items stehen Default-Werte (0) in der DB,
    // wir wollen aber leere Felder (als String) anzeigen.
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
        icon: '',
        nutrients: {
            description: '',
            unit: '',
            amount: 100,
            values: [] as NutrientValueModel[],
        },
    };

    // Für numerische Felder speichern wir den Wert als string,
    // sodass bei neuen Items kein "0" voreingestellt ist.
    const [amount, setAmount] = useState<string>(isNew ? '' : initialItem.amount.toString());
    const [lowestAmount, setLowestAmount] = useState<string>(
        isNew ? '' : initialItem.lowestAmount.toString()
    );
    const [midAmount, setMidAmount] = useState<string>(isNew ? '' : initialItem.midAmount.toString());
    const [packageQuantity, setPackageQuantity] = useState<string>(
        isNew || initialItem.packageQuantity == null
            ? ''
            : initialItem.packageQuantity.toString()
    );
    const [nutrientAmount, setNutrientAmount] = useState<string>(
        isNew || !initialItem.nutrients?.amount ? '' : initialItem.nutrients.amount.toString()
    );

    // Für Textfelder
    const [name, setName] = useState<string>(initialItem.name);
    const [unit, setUnit] = useState<string>(initialItem.unit);
    const [packageUnit, setPackageUnit] = useState<string>(initialItem.packageUnit || '');
    const [storageLocation, setStorageLocation] = useState<string>(initialItem.storageLocation);
    const [categories, setCategories] = useState<string[]>(initialItem.categories || []);
    const [icon, setIcon] = useState<string>(initialItem.icon || '');
    const [nutrientDescription, setNutrientDescription] = useState<string>(
        initialItem.nutrients?.description || ''
    );
    const [nutrientUnit, setNutrientUnit] = useState<string>(initialItem.nutrients?.unit || '');
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

    useEffect(() => {
        if (storageItem) {
            setName(storageItem.name);
            setAmount(storageItem.amount.toString());
            setLowestAmount(storageItem.lowestAmount.toString());
            setMidAmount(storageItem.midAmount.toString());
            setUnit(storageItem.unit);
            setPackageQuantity(
                storageItem.packageQuantity != null ? storageItem.packageQuantity.toString() : ''
            );
            setPackageUnit(storageItem.packageUnit || '');
            setStorageLocation(storageItem.storageLocation);
            setCategories(storageItem.categories || []);
            setIcon(storageItem.icon || '');
            setNutrientDescription(storageItem.nutrients?.description || '');
            setNutrientUnit(storageItem.nutrients?.unit || '');
            setNutrientAmount(
                storageItem.nutrients && storageItem.nutrients.amount
                    ? storageItem.nutrients.amount.toString()
                    : ''
            );
            if (!storageItem.nutrients || storageItem.nutrients.values.length === 0) {
                // Vordefinierte Nährstoffdaten
                setNutrients([
                    {
                        id: 1,
                        name: 'Kalorien',
                        color: '#FFA500',
                        values: [
                            { typ: 'kcal', value: 0 },
                            { typ: 'kJ', value: 0 },
                        ],
                    },
                    {
                        id: 2,
                        name: 'Fett',
                        color: '#FF4500',
                        values: [{ typ: 'g', value: 0 }],
                    },
                    {
                        id: 3,
                        name: 'Kohlenhydrate',
                        color: '#FFD700',
                        values: [{ typ: 'g', value: 0 }],
                    },
                    {
                        id: 4,
                        name: 'davon Zucker',
                        color: '#DC143C',
                        values: [{ typ: 'g', value: 0 }],
                    },
                    {
                        id: 5,
                        name: 'Ballaststoffe',
                        color: '#32CD32',
                        values: [{ typ: 'g', value: 0 }],
                    },
                    {
                        id: 6,
                        name: 'Eiweiß',
                        color: '#1E90FF',
                        values: [{ typ: 'g', value: 0 }],
                    },
                ]);
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

    if (axiosResponse) {
        axiosResponse.catch((e) => {
            history.push(e.message);
        });
    }

    if (!storageItem && !isNew) {
        return <LoadingSpinner message="Loading storage item..." />;
    }

    const showLegend = dimensions.width > 450;
    const isMobile = dimensions.width < 600;

    const onChangeNutrient = (nutrientIndex: number, key: string, value: string | number) => {
        setNutrients((curr) => {
            const updated = [...curr];
            updated[nutrientIndex] = { ...updated[nutrientIndex], [key]: value };
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
                values: [],
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

    // Beim Speichern werden die numerischen Werte in Zahlen konvertiert.
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
        icon,
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
            unit.trim() === '' ||
            storageLocation.trim() === ''
        ) {
            setSaveError(
                'Bitte füllen Sie alle Pflichtfelder aus: Name, Amount, Unit und Storage Location'
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
                await storageApi('POST', itemsRoute, noop, updatedItem);
            } else if (id) {
                await Promise.all([
                    storageApi('PUT', itemIdApi(id), noop, updatedItem),
                    storageApi('PUT', nutrientsApi(id), noop, updatedItem.nutrients),
                ]);
            }
            history.push(itemsRoute);
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

    const onCancel = () => history.goBack();

    const onDelete = (event: SyntheticEvent) => {
        event.preventDefault();
        if (id && storageItem) {
            dispatch({ type: 'CLEAR_ITEM_CARD', storeageItem: storageItem });
            storageApi('DELETE', itemIdApi(id), noop, {}).then(() => history.push(itemsRoute));
        }
    };

    return (
        <div className={css.container}>
            {/* Fehleranzeige oben */}
            {saveError && (
                <Alert style={{ marginBottom: 16 }} message={saveError} type="error" showIcon />
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <Image.PreviewGroup>
                    <Image width={150} alt={name} src={icon || 'https://via.placeholder.com/150'} />
                </Image.PreviewGroup>
            </div>
            <Descriptions
                title={
                    <span>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name des Items"
                        />
                        <span style={{ color: 'red' }}> *</span>
                    </span>
                }
                bordered
                size="small"
                style={{ backgroundColor: '#f5f5f5' }}
                column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
            >
                <Descriptions.Item label="ID">{storageItem?.id ?? '-'}</Descriptions.Item>
                <Descriptions.Item
                    label={
                        <span>
                            Amount <span style={{ color: 'red' }}> *</span>
                        </span>
                    }
                >
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Pflichtfeld"
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Categories">
                    <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        value={categories}
                        placeholder="Kategorie(n)"
                        onChange={setCategories}
                    >
                        {dbCategories.map((category) => (
                            <Select.Option key={category.id} value={category.name}>
                                {category.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Descriptions.Item>
                <Descriptions.Item label="Minimal Warn">
                    <Input
                        type="number"
                        value={lowestAmount}
                        onChange={(e) => setLowestAmount(e.target.value)}
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Middel Warn">
                    <Input
                        type="number"
                        value={midAmount}
                        onChange={(e) => setMidAmount(e.target.value)}
                    />
                </Descriptions.Item>
                <Descriptions.Item
                    label={
                        <span>
                            Unit <span style={{ color: 'red' }}> *</span>
                        </span>
                    }
                >
                    <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        value={unit ? [unit] : []}
                        placeholder="Pflichtfeld"
                        onChange={(val: string[]) => setUnit(val[0] || '')}
                    >
                        {dbItemUnits.map((itemUnit) => (
                            <Select.Option key={itemUnit.id} value={itemUnit.name}>
                                {itemUnit.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Descriptions.Item>
                <Descriptions.Item label="Package Quantity">
                    <Input
                        type="number"
                        value={packageQuantity}
                        onChange={(e) => setPackageQuantity(e.target.value)}
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Package Unit">
                    <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        value={packageUnit ? [packageUnit] : []}
                        placeholder="Package Unit"
                        onChange={(val: string[]) => setPackageUnit(val[0] || '')}
                    >
                        {dbPackageUnits.map((pkgUnit) => (
                            <Select.Option key={pkgUnit.id} value={pkgUnit.name}>
                                {pkgUnit.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Descriptions.Item>
                <Descriptions.Item
                    label={
                        <span>
                            Storage Location <span style={{ color: 'red' }}> *</span>
                        </span>
                    }
                >
                    <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        value={storageLocation ? [storageLocation] : []}
                        placeholder="Pflichtfeld"
                        onChange={(val: string[]) => setStorageLocation(val[0] || '')}
                    >
                        {dbStorageLocations.map((location) => (
                            <Select.Option key={location.id} value={location.name}>
                                {location.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Descriptions.Item>
            </Descriptions>
            <Descriptions
                bordered
                style={{
                    backgroundColor: '#f5f5f5',
                    marginTop: 16,
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column', // Vertikale Ausrichtung für kleine Bildschirme
                }}
            >
                <Descriptions.Item label="Nutrients" style={{ padding: '10px 10px', display: 'block' }}>
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
                                            <div className={css.nutrientName}>{nutrient.name}</div>
                                            {/* Optional: Farbcode anzeigen */}
                                            <div className={css.nutrientColorCode}>{nutrient.color}</div>
                                        </div>
                                        <MinusOutlined
                                            onClick={() => removeNutrient(nutrientIndex)}
                                            className={css.removeNutrientIcon}
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
                                                    mode="tags"
                                                    value={nutrientType.typ ? [nutrientType.typ] : []}
                                                    placeholder="Einheit"
                                                    onChange={(val: string[]) =>
                                                        onChangeNutrientType(nutrientIndex, typeIndex, 'typ', val[0] || '')
                                                    }
                                                    className={css.nutrientTypeSelect}
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
