import React, { ReactElement, useCallback, useState, useEffect } from 'react';
import { Form, Input, Select, AutoComplete, Button, Row, Col, Image } from 'antd';
import { debounce } from 'lodash';
import { useHistory } from 'react-router-dom';
import { bingImageSearchApi, storageApi } from '../../../hooks/StorageApi';
import {
    itemsApi,
    itemIdApi,
    itemsRoute,
    optionsCategoriesApi,
    optionsStorageLocationsApi,
    optionsItemUnitsApi,
    optionsPackageUnitsApi,
    optionsNutrientUnitsApi
} from '../../../shared/Constants';
import { NutrientFactory } from '../../../shared/Factories';
import { NutrientModel, NutrientValueModel } from '../StorageModel';
import css from './StorageForm.module.css';

interface Props {
    id?: number;
    name: string;
    amount: string;
    lowestAmount: string;
    midAmount: string;
    unit: string;
    storageLocation: string;
    isEdit: boolean;
    packageQuantity?: string;
    packageUnit?: string;
    categories?: string[];
    nutrients?: NutrientModel;
    icon?: string;
}

export default function StorageForm(props: Props): ReactElement {
    const history = useHistory();

    // Hilfsfunktion: Leeres NutrientValueModel (z.B. für das Hinzufügen eines neuen Nährwertfelds)
    const buildIngredientTypeModel = (): NutrientValueModel => ({
        id: 1,
        name: '',
        color: '',
        values: [{ typ: '', value: 0 }]
    });

    // Erzeuge initiale Nutrient-Werte mithilfe der Factory oder aus den übergebenen Props
    const nutrientFactory = NutrientFactory();
    const initialNutrients = props.nutrients && props.nutrients.values
        ? props.nutrients.values
        : nutrientFactory.map(obj => ({
            id: obj.id,
            name: obj.name,
            color: obj.color,
            values: [{ typ: '', value: 0 }]
        }));

    // Zustände
    const [id, setId] = useState(props.id);
    const [name, setName] = useState(props.name);
    const [amount, setAmount] = useState(props.amount ? Number(props.amount) : '');
    const [lowestAmount, setLowestAmount] = useState(props.lowestAmount ? Number(props.lowestAmount) : '');
    const [midAmount, setMidAmount] = useState(props.midAmount ? Number(props.midAmount) : '');
    const [unit, setUnit] = useState(props.unit);
    const [storageLocation, setStorageLocation] = useState(props.storageLocation);
    const [packageQuantity, setPackageQuantity] = useState(props.packageQuantity ? Number(props.packageQuantity) : '');
    const [packageUnit, setPackageUnit] = useState(props.packageUnit || '');
    const [categories, setCategories] = useState(props.categories || []);
    const [nutrientDescription, setNutrientDescription] = useState(
        props.nutrients ? props.nutrients.description : 'Nährwertangaben pro 100g'
    );
    const [nutrientUnit, setNutrientUnit] = useState(props.nutrients ? props.nutrients.unit : '');
    const [nutrientAmount, setNutrientAmount] = useState(props.nutrients ? Number(props.nutrients.amount) : 100);
    const [nutrients, setNutrients] = useState<NutrientValueModel[]>(initialNutrients);
    const [icon, setIcon] = useState(props.icon || '');

    // Optionen aus der Datenbank laden
    const [dbCategories, setDbCategories] = useState<{ id: number; name: string }[]>([]);
    const [dbStorageLocations, setDbStorageLocations] = useState<{ id: number; name: string }[]>([]);
    const [dbItemUnits, setDbItemUnits] = useState<{ id: number; name: string }[]>([]);
    const [dbPackageUnits, setDbPackageUnits] = useState<{ id: number; name: string }[]>([]);
    const [dbNutrientUnits, setDbNutrientUnits] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        storageApi('GET', optionsCategoriesApi, setDbCategories);
        storageApi('GET', optionsStorageLocationsApi, setDbStorageLocations);
        storageApi('GET', optionsItemUnitsApi, setDbItemUnits);
        storageApi('GET', optionsPackageUnitsApi, setDbPackageUnits);
        storageApi('GET', optionsNutrientUnitsApi, setDbNutrientUnits);
    }, []);

    // Debounce für Bildsuche (Bing API)
    const debounceHandler = useCallback(
        debounce((value: string) => {
            bingImageSearchApi(value, setIcon);
        }, 800),
        []
    );

    const handleNameChange = (value: string) => {
        setName(value);
        debounceHandler(value);
    };

    // Erstelle das NutrientModel-Objekt (als einzelnes Objekt, nicht Array)
    const buildNutrientModel = () => ({
        description: nutrientDescription,
        unit: nutrientUnit,
        amount: nutrientAmount,
        values: nutrients
    });

    const getStorageItem = () => ({
        id,
        name,
        amount,
        lowestAmount,
        midAmount,
        unit,
        categories,
        packageQuantity,
        packageUnit,
        storageLocation,
        nutrients: buildNutrientModel(),
        icon: icon || ''
    });

    // API-Parameter: PUT (bei Edit) oder POST (bei Add)
    const getStorageApiParameters = (): ['PUT' | 'POST', string, () => void] => {
        if (props.isEdit && id) {
            return ['PUT', itemIdApi(id), () => history.goBack()];
        }
        return ['POST', itemsApi, () => history.push(itemsRoute)];
    };

    const onSubmit = () => {
        const [method, route, onGoFunc] = getStorageApiParameters();
        storageApi(method, route, onGoFunc, getStorageItem());
    };

    // Funktionen zum Aktualisieren der Nutrient-Felder
    const onChangeNutrient = (index: number, key: string, value: string | number) => {
        setNutrients(curr => {
            const newArr = [...curr];
            newArr[index] = { ...newArr[index], [key]: value };
            return newArr;
        });
    };

    const onChangeNutrientTypeValue = (index: number, key: string, value: string | number) => {
        setNutrients(curr => {
            const newArr = [...curr];
            if (newArr[index].values && newArr[index].values.length > 0) {
                newArr[index].values[0] = { ...newArr[index].values[0], [key]: value };
            }
            return newArr;
        });
    };

    const onAddNutrient = () => {
        setNutrients(curr => [...curr, buildIngredientTypeModel()]);
    };

    const onRemoveNutrient = () => {
        setNutrients(curr => {
            const newArr = [...curr];
            if (newArr.length > 0) newArr.pop();
            return newArr;
        });
    };

    return (
        <div className={css.container}>
            {/* Oben: Bildvorschau – analog zu StorageDetail */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <Image.PreviewGroup>
                    <Image width={150} alt={name} src={icon || 'https://via.placeholder.com/150'} />
                </Image.PreviewGroup>
            </div>

            {/* Formularbereich mit einem grauen Hintergrund, wie in StorageDetail */}
            <div style={{ backgroundColor: "#f5f5f5", padding: 16, borderRadius: 4 }}>
                <Form layout="vertical" onFinish={onSubmit} className={css.bookForm}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Name" required>
                                <Input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Titel" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Categories">
                                <Select
                                    mode="tags"
                                    style={{ width: '100%' }}
                                    value={categories}
                                    placeholder="Kategorie auswählen oder eingeben"
                                    onChange={setCategories}
                                    options={dbCategories.map(cat => ({ value: cat.name }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Storage Location">
                                <AutoComplete
                                    style={{ width: '100%' }}
                                    placeholder="Storage Location"
                                    value={storageLocation}
                                    onChange={setStorageLocation}
                                    options={dbStorageLocations.map(loc => ({ value: loc.name }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Unit">
                                <Select
                                    showSearch
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={unit}
                                    onChange={setUnit}
                                    placeholder="Item Unit"
                                    options={dbItemUnits.map(u => ({ value: u.name }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Form.Item label="Amount" required>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item label="Minimal Warn" required>
                                <Input
                                    type="number"
                                    value={lowestAmount}
                                    onChange={(e) => setLowestAmount(e.target.value ? Number(e.target.value) : '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item label="Middel Warn" required>
                                <Input
                                    type="number"
                                    value={midAmount}
                                    onChange={(e) => setMidAmount(e.target.value ? Number(e.target.value) : '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Package Quantity">
                                <Input
                                    type="number"
                                    value={packageQuantity}
                                    onChange={(e) => setPackageQuantity(e.target.value ? Number(e.target.value) : '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Package Unit">
                                <Select
                                    showSearch
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={packageUnit}
                                    onChange={setPackageUnit}
                                    placeholder="Package Unit"
                                    options={dbPackageUnits.map(p => ({ value: p.name }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Nutrient Description */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <Form.Item label="Nutrient Description">
                                <Input
                                    value={nutrientDescription}
                                    onChange={(e) => setNutrientDescription(e.target.value)}
                                    placeholder="Nährwertangaben pro 100g"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Nutrient Values – analog zur Detail-Tabelle, aber mit Input-Feldern */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Button type="primary" onClick={onAddNutrient}>+</Button>
                                <Button type="primary" danger onClick={onRemoveNutrient}>-</Button>
                            </div>
                            {nutrients.map((nutrient, index) => (
                                <Row key={index} gutter={[8, 8]} align="middle">
                                    <Col xs={24} sm={3}>
                                        <Form.Item label="ID">
                                            <Input
                                                type="number"
                                                value={nutrient.id}
                                                onChange={(e) => onChangeNutrient(index, 'id', Number(e.target.value))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={3}>
                                        <Form.Item label="Name">
                                            <Input
                                                value={nutrient.name}
                                                onChange={(e) => onChangeNutrient(index, 'name', e.target.value)}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={3}>
                                        <Form.Item label="Color">
                                            <Input
                                                className={css.ingredientInput}
                                                style={{ color: nutrient.color }}
                                                value={nutrient.color}
                                                onChange={(e) => onChangeNutrient(index, 'color', e.target.value)}
                                                placeholder="red / #123456"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={3}>
                                        <Form.Item label="Typ">
                                            <Input
                                                className={css.ingredientInput}
                                                value={nutrient.values[0]?.typ || ''}
                                                onChange={(e) => onChangeNutrientTypeValue(index, 'typ', e.target.value)}
                                                placeholder="g/kcal/ml..."
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={3}>
                                        <Form.Item label="Value">
                                            <Input
                                                className={css.ingredientInput}
                                                type="number"
                                                value={nutrient.values[0]?.value || ''}
                                                onChange={(e) => onChangeNutrientTypeValue(index, 'value', e.target.value)}
                                                placeholder="123"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            ))}
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <Form.Item label="Bild URL">
                                <Input
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row justify="center">
                        <Col>
                            <div className={css.buttonContainer}>
                                <Button type="primary" htmlType="submit">Submit</Button>
                                <Button onClick={() => history.goBack()}>Cancel</Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
}
