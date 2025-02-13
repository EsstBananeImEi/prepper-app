// StorageForm.tsx
import React, { ReactElement, SyntheticEvent, useState, useEffect } from 'react';
import { Descriptions, Image, Input, Select, Button } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import {
    editItemRoute,
    errorRoute,
    itemIdApi,
    itemIdRoute,
    itemsRoute,
    nutrientsApi,
    optionsCategoriesApi,
    optionsItemUnitsApi,
    optionsNutrientUnitsApi,
    optionsPackageUnitsApi,
    optionsStorageLocationsApi
} from '../../../shared/Constants';
import { Action, useStore } from '../../../store/Store';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { NutrientTypModel, NutrientValueModel, StorageModel } from '../StorageModel';
import css from './StorageForm.module.css';

export default function StorageDetailForm(): ReactElement {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const { store, dispatch } = useStore();
    const [dimensions] = useDemensions(() => 1, 0);
    const [storageItem, , axiosResponse] = useStorageApi<StorageModel>('GET', itemIdApi(id));

    // Fallback-Objekt: packageQuantity als undefined statt null
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
            values: [] as NutrientValueModel[]
        }
    };

    const [name, setName] = useState(initialItem.name);
    const [amount, setAmount] = useState(initialItem.amount);
    const [lowestAmount, setLowestAmount] = useState(initialItem.lowestAmount);
    const [midAmount, setMidAmount] = useState(initialItem.midAmount);
    const [unit, setUnit] = useState(initialItem.unit);
    const [packageQuantity, setPackageQuantity] = useState<number | undefined>(initialItem.packageQuantity);
    const [packageUnit, setPackageUnit] = useState(initialItem.packageUnit);
    const [storageLocation, setStorageLocation] = useState(initialItem.storageLocation);
    const [categories, setCategories] = useState<string[]>(initialItem.categories || []);
    const [icon, setIcon] = useState(initialItem.icon);
    const [nutrientDescription, setNutrientDescription] = useState(initialItem.nutrients?.description || '');
    const [nutrientUnit, setNutrientUnit] = useState(initialItem.nutrients?.unit || '');
    const [nutrientAmount, setNutrientAmount] = useState(initialItem.nutrients?.amount);
    const [nutrients, setNutrients] = useState<NutrientValueModel[]>(initialItem.nutrients?.values || []);

    // Optionen aus der Datenbank laden
    const [dbCategories, setDbCategories] = useState<{ id: number; name: string }[]>([]);
    const [dbStorageLocations, setDbStorageLocations] = useState<{ id: number; name: string }[]>([]);
    const [dbItemUnits, setDbItemUnits] = useState<{ id: number; name: string }[]>([]);
    const [dbPackageUnits, setDbPackageUnits] = useState<{ id: number; name: string }[]>([]);
    // Wir laden dbNutrientUnits zwar, nutzen sie aber hier nicht – wir verwenden stattdessen die Item Units
    const [dbNutrientUnits, setDbNutrientUnits] = useState<{ id: number; name: string }[]>([]);

    // Beim Laden des Items: Falls noch keine Nährstoffe vorhanden sind, lege einen Default‑Eintrag an.
    useEffect(() => {
        if (storageItem) {
            setName(storageItem.name);
            setAmount(storageItem.amount);
            setLowestAmount(storageItem.lowestAmount);
            setMidAmount(storageItem.midAmount);
            setUnit(storageItem.unit);
            setPackageQuantity(storageItem.packageQuantity);
            setPackageUnit(storageItem.packageUnit || '');
            setStorageLocation(storageItem.storageLocation);
            setCategories(storageItem.categories || []);
            setIcon(storageItem.icon);
            setNutrientDescription(storageItem.nutrients?.description || '');
            setNutrientUnit(storageItem.nutrients?.unit || '');
            setNutrientAmount(storageItem.nutrients?.amount);

            if (!storageItem.nutrients || storageItem.nutrients.values.length === 0) {
                // Default-Nährstoff "Kalorien" mit einem Default-Typ "kcal"
                setNutrients([{
                    id: 1, // Beispielhafter Wert – ggf. an Deine Logik anpassen
                    name: 'Kalorien',
                    color: '#ff0000',
                    values: [{
                        typ: 'kcal',
                        value: 0
                    }]
                }]);
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

    // Fehlerbehandlung
    axiosResponse && axiosResponse.catch((e) => {
        history.push(errorRoute(e.message));
    });

    if (!storageItem) {
        return <LoadingSpinner message="Loading storage item..." />;
    }

    const showLegend = dimensions.width > 450;

    // Aktualisiert Felder eines Nährstoff-Eintrags (z.B. Name oder Farbe)
    const onChangeNutrient = (nutrientIndex: number, key: string, value: string | number) => {
        setNutrients(curr => {
            const updated = [...curr];
            updated[nutrientIndex] = { ...updated[nutrientIndex], [key]: value };
            return updated;
        });
    };

    // Aktualisiert einen Typ innerhalb eines Nährstoffs
    const onChangeNutrientType = (nutrientIndex: number, typeIndex: number, key: string, value: string | number) => {
        setNutrients(curr => {
            const updated = [...curr];
            const nutrient = { ...updated[nutrientIndex] };
            const updatedTypes = [...nutrient.values];
            updatedTypes[typeIndex] = {
                ...updatedTypes[typeIndex],
                [key]: key === 'value' ? Number(value) : value
            };
            nutrient.values = updatedTypes;
            updated[nutrientIndex] = nutrient;
            return updated;
        });
    };

    // Fügt einen neuen Nährstoff (NutrientValueModel) hinzu
    const addNutrient = () => {
        setNutrients(curr => [
            ...curr,
            {
                id: Date.now(), // Beispielhafte ID-Vergabe
                name: '',
                color: '#000000',
                values: [] // Startet ohne Typen – der User kann dann Typen hinzufügen
            }
        ]);
    };

    // Entfernt einen kompletten Nährstoff
    const removeNutrient = (nutrientIndex: number) => {
        setNutrients(curr => {
            const updated = [...curr];
            updated.splice(nutrientIndex, 1);
            return updated;
        });
    };

    // Fügt einem vorhandenen Nährstoff einen neuen Typ hinzu
    const addNutrientType = (nutrientIndex: number) => {
        setNutrients(curr => {
            const updated = [...curr];
            const nutrient = { ...updated[nutrientIndex] };
            nutrient.values = [
                ...nutrient.values,
                {
                    typ: '',
                    value: 0
                }
            ];
            updated[nutrientIndex] = nutrient;
            return updated;
        });
    };

    // Entfernt einen Typ aus einem Nährstoff
    const removeNutrientType = (nutrientIndex: number, typeIndex: number) => {
        setNutrients(curr => {
            const updated = [...curr];
            const nutrient = { ...updated[nutrientIndex] };
            nutrient.values = nutrient.values.filter((_, idx) => idx !== typeIndex);
            updated[nutrientIndex] = nutrient;
            return updated;
        });
    };

    const getUpdatedItem = (): StorageModel => ({
        ...storageItem,
        name,
        amount,
        lowestAmount,
        midAmount,
        unit,
        packageQuantity,
        packageUnit,
        storageLocation,
        categories,
        icon,
        nutrients: {
            description: nutrientDescription,
            unit: nutrientUnit,
            amount: nutrientAmount !== undefined ? nutrientAmount : 0,
            values: nutrients
        }
    });

    const onSave = () => {
        const updatedItem = getUpdatedItem();
        storageApi('PUT', itemIdApi(id), () => history.push(itemIdRoute(id)), updatedItem);
        storageApi('PUT', nutrientsApi(id), () => history.push(itemIdRoute(id)), updatedItem.nutrients);
    };

    const onCancel = () => history.goBack();

    const onDelete = (event: SyntheticEvent) => {
        event.preventDefault();
        dispatch({ type: 'CLEAR_ITEM_CARD', storeageItem: storageItem });
        storageApi('DELETE', itemIdApi(id), () => history.push(itemsRoute));
    };

    return (
        <div className={css.container}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <Image.PreviewGroup>
                    <Image width={150} alt={name} src={icon || 'https://via.placeholder.com/150'} />
                </Image.PreviewGroup>
            </div>
            <Descriptions
                title={
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name des Items"
                    />
                }
                bordered
                size="small"
                style={{ backgroundColor: "#f5f5f5" }}
                column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            >
                <Descriptions.Item label="ID">{storageItem.id}</Descriptions.Item>
                <Descriptions.Item label="Amount">
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
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
                        {dbCategories.map(category => (
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
                        onChange={(e) => setLowestAmount(Number(e.target.value))}
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Middel Warn">
                    <Input
                        type="number"
                        value={midAmount}
                        onChange={(e) => setMidAmount(Number(e.target.value))}
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Unit">
                    <Select
                        style={{ width: '100%' }}
                        value={unit}
                        placeholder="Item Unit"
                        onChange={setUnit}
                    >
                        {dbItemUnits.map(itemUnit => (
                            <Select.Option key={itemUnit.id} value={itemUnit.name}>
                                {itemUnit.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Descriptions.Item>
                <Descriptions.Item label="Package Quantity">
                    <Input
                        type="number"
                        value={packageQuantity !== undefined ? packageQuantity : ''}
                        onChange={(e) =>
                            setPackageQuantity(e.target.value ? Number(e.target.value) : undefined)
                        }
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Package Unit">
                    <Select
                        style={{ width: '100%' }}
                        value={packageUnit}
                        placeholder="Package Unit"
                        onChange={setPackageUnit}
                    >
                        {dbPackageUnits.map(pkgUnit => (
                            <Select.Option key={pkgUnit.id} value={pkgUnit.name}>
                                {pkgUnit.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Descriptions.Item>
                <Descriptions.Item label="Storage Location">
                    <Select
                        style={{ width: '100%' }}
                        value={storageLocation}
                        placeholder="Storage Location"
                        onChange={setStorageLocation}
                    >
                        {dbStorageLocations.map(location => (
                            <Select.Option key={location.id} value={location.name}>
                                {location.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Descriptions.Item>
            </Descriptions>

            {/* Überarbeitete Nutrients-Sektion mit Toolbar und Icons */}
            <Descriptions
                bordered
                style={{
                    backgroundColor: "#f5f5f5",
                    marginTop: 16,
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Descriptions.Item label="Nutrients" style={{ padding: '10px 10px' }}>
                    <div className={css.naehrwert_table}>
                        {/* Toolbar oberhalb der Tabelle */}
                        <div
                            className={css.nutrientToolbar}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px'
                            }}
                        >
                            <Input
                                disabled
                                value={`Nährwertangaben pro ${nutrientAmount} ${nutrientUnit}`}
                                placeholder="Beschreibung"
                                onChange={(e) => setNutrientDescription(e.target.value)}
                            />
                            <Input
                                style={{ width: 80, marginRight: 8 }}
                                value={nutrientAmount}
                                placeholder="Betrag"
                                onChange={(e) => setNutrientAmount(Number(e.target.value))}
                            />
                            {/* Hier verwenden wir nun die gleichen Optionen wie beim Item Unit */}
                            <Select
                                style={{ width: 120, marginLeft: 8 }}
                                value={nutrientUnit}
                                placeholder="Einheit"
                                onChange={setNutrientUnit}
                            >
                                {dbItemUnits.map(itemUnit => (
                                    <Select.Option key={itemUnit.id} value={itemUnit.name}>
                                        {itemUnit.name}
                                    </Select.Option>
                                ))}
                            </Select>
                            <PlusOutlined
                                onClick={addNutrient}
                                style={{ cursor: 'pointer', fontSize: '20px', color: 'green' }}
                            />
                        </div>
                        <table cellSpacing={0} style={{ width: '100%' }}>
                            <tbody>
                                {nutrients
                                    .sort((a, b) => a.id - b.id)
                                    .map((nutrient, nutrientIndex) => (
                                        <React.Fragment key={nutrient.id}>
                                            {/* Kopfzeile des Nährstoffs */}
                                            <tr className={css.nutrientHeaderRow}>
                                                {showLegend && (
                                                    <td className={css.legend}>
                                                        <span style={{ backgroundColor: nutrient.color }}></span>
                                                    </td>
                                                )}
                                                <td colSpan={3} style={{ padding: '8px' }}>
                                                    <Input
                                                        value={nutrient.name}
                                                        placeholder="Nährstoffname"
                                                        onChange={(e) =>
                                                            onChangeNutrient(
                                                                nutrientIndex,
                                                                'name',
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td style={{ padding: '4px' }}>
                                                    <MinusOutlined
                                                        onClick={() => removeNutrient(nutrientIndex)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            color: 'red',
                                                            marginLeft: 8
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '4px' }}>
                                                    <PlusOutlined
                                                        onClick={() => addNutrientType(nutrientIndex)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            color: 'green',
                                                            marginLeft: 8
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                            {/* Zeilen für jeden Typ des aktuellen Nährstoffs */}
                                            {nutrient.values.map((nutrientTyp, typeIndex) => (
                                                <tr key={typeIndex} className={css.nutrientTypeRow}>
                                                    {showLegend && <td></td>}
                                                    <td style={{ padding: '4px' }}>
                                                        <Input
                                                            type="number"
                                                            value={nutrientTyp.value}
                                                            placeholder="Wert"
                                                            onChange={(e) =>
                                                                onChangeNutrientType(
                                                                    nutrientIndex,
                                                                    typeIndex,
                                                                    'value',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td style={{ padding: '4px' }}>
                                                        <Select
                                                            style={{ width: 120 }}
                                                            value={nutrientTyp.typ}
                                                            placeholder="Einheit"
                                                            onChange={(value) =>
                                                                onChangeNutrientType(
                                                                    nutrientIndex,
                                                                    typeIndex,
                                                                    'typ',
                                                                    value
                                                                )
                                                            }
                                                        >
                                                            {dbNutrientUnits.map(nutrientUnitOption => (
                                                                <Select.Option key={nutrientUnitOption.id} value={nutrientUnitOption.name}>
                                                                    {nutrientUnitOption.name}
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                    </td>
                                                    <td style={{ padding: '4px' }}>
                                                        <MinusOutlined
                                                            onClick={() =>
                                                                removeNutrientType(
                                                                    nutrientIndex,
                                                                    typeIndex
                                                                )
                                                            }
                                                            style={{ cursor: 'pointer', color: 'red' }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </Descriptions.Item>
            </Descriptions>

            <div className={css.buttonContainer}>
                <Button className={css.formButton} onClick={onCancel} type="default">
                    Go Back
                </Button>
                <Button className={css.formButton} onClick={onSave} type="primary">
                    Save
                </Button>
                <Button className={css.formButton} onClick={(e) => onDelete(e)} danger>
                    Delete
                </Button>
            </div>
        </div>
    );
}
