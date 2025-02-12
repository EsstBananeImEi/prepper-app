// StorageDetailForm.tsx
import React, { ReactElement, SyntheticEvent, useState, useEffect } from 'react';
import { Descriptions, Image, Input, Select, Button } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import { editItemRoute, errorRoute, itemIdApi, itemsRoute } from '../../../shared/Constants';
import { Action, useStore } from '../../../store/Store';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { NutrientTypModel, NutrientValueModel, StorageModel } from '../StorageModel';
import css from './StorageDetail.module.css';

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
        storageApi('PUT', itemIdApi(id), () => history.goBack(), updatedItem);
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
                    />
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
                    <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
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
                    <Input value={packageUnit} onChange={(e) => setPackageUnit(e.target.value)} />
                </Descriptions.Item>
                <Descriptions.Item label="Storage Location">
                    <Input value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} />
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
                            <span style={{ fontWeight: 'bold' }}>
                                {`Angaben für ${nutrientAmount} ${nutrientUnit}`}
                            </span>
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
                                                        <Input
                                                            value={nutrientTyp.typ}
                                                            placeholder="Einheit (z.B. kcal, KJ)"
                                                            onChange={(e) =>
                                                                onChangeNutrientType(
                                                                    nutrientIndex,
                                                                    typeIndex,
                                                                    'typ',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
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
