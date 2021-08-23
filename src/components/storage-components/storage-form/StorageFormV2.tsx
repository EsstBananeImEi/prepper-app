import { Button, Descriptions, Image } from 'antd';
import { Method } from 'axios';
import React, { ReactElement, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { displayPartsToString } from 'typescript';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { NutrientModel, NutrientValueModel, StorageModel } from '../StorageModel';
import css from './StorageFormV2.module.css'
interface Props {
    id?: number
    name: string
    amount: string
    lowestAmount: string
    midAmount: string
    unit: string
    storageLocation: string
    isEdit: boolean
    // this attributes only required if isEdit == True
    packageQuantity?: string
    packageUnit?: string
    categories?: string[]
    nutrients?: NutrientModel
    icon?: string
}
export default function StorageFormV2(props: Props): ReactElement {
    const buildIngrientTypModel = () => ({ id: 1, name: '', color: '', values: { typ: '', value: 0 } })
    const [dimensions] = useDemensions(() => 1, 0)

    const [id, setId] = useState(props.id)
    const [name, setName] = useState(props.name)
    const [amount, setAmount] = useState(props.amount)
    const [lowestAmount, setLowestAmount] = useState(props.lowestAmount)
    const [midAmount, setMidAmount] = useState(props.midAmount)
    const [unit, setUnit] = useState(props.unit)
    const [storageLocation, setStorageLocation] = useState(props.storageLocation)
    const [packageQuantity, setPackageQuantity] = useState(props.packageQuantity ? props.packageQuantity : '') // optional !!
    const [packageUnit, setPackageUnit] = useState(props.packageUnit ? props.packageUnit : '') // optional !!
    const [categories, setCategories] = useState(props.categories ? props.categories : []) // Optional !!
    const [nutrientUnit, setNutrientUnit] = useState(props.nutrients ? props.nutrients.unit : '') // Optional !!
    const [nutrientAmount, setNutrientAmount] = useState(props.nutrients ? props.nutrients.amount : '') // Optional !!
    const [nutrients, setNutrients] = useState(props.nutrients && props.nutrients.values ? props.nutrients.values : []) // Optional !!
    const [icon, setIcon] = useState(props.icon ? props.icon : '') // Optional !!
    const history = useHistory()
    const sequence: number[] = [1, 2, 3, 4, 5, 6, 7]
    const showLegend = dimensions.width > 450 ? true : false

    const buildIngrientModel = () => ({ description: '', unit: nutrientUnit, amount: nutrientAmount, values: nutrients })

    const getStorageItem = () => {
        return { id, name, amount, lowestAmount, midAmount, unit, categories: categories, packageQuantity, packageUnit, nutrients: buildIngrientModel(), icon }
    }

    const getStorageApiParameters = (): [Method, string, () => void] => {
        if (props.isEdit) {
            return ['PUT', `/storedItems/${id}`, onGoToDetails]
        }
        return ['POST', `/storedItems/`, onGoToList]
    }

    const onSubmit = (e: React.FormEvent) => {
        const [method, route, onGoFunc] = getStorageApiParameters()

        e.preventDefault()
        storageApi(method, route, onGoFunc, getStorageItem())
    };

    const onGoToList = () => { history.push('/storedItems') }
    const onGoToDetails = () => { history.push(`/storedItems/${id}`) }

    const onChangeNutrient = (index: number, key: string, value: string) => {
        setNutrients(currentThumbnails => {
            const newNutrient = [...currentThumbnails]
            newNutrient[index] = { ...newNutrient[index], [key]: value }
            return newNutrient
        })
    }
    const onChangeNutrientTypValues = (index: number, key: string, value: string) => {
        setNutrients(currentThumbnails => {
            const newNutrient = [...currentThumbnails]
            newNutrient[index]['values'] = { ...newNutrient[index]['values'], [key]: value }
            return newNutrient
        })
    }

    const onSetCategories = (event: string[]) => {
        setCategories(event)
    }

    const onAddIngredient = () => setNutrients(currentIngredients => [...currentIngredients, buildIngrientTypModel()])
    const onRemoveIngredient = () => {
        setNutrients(currentIngredient => {
            const newIngredient = [...currentIngredient]
            newIngredient.length > 0 && newIngredient.pop()
            return newIngredient
        })
    }

    const mapOrder = (array: NutrientValueModel[], order: number[], key: string) => {
        array.sort(function (nutrientA, nutrientB) {
            if (order.indexOf(nutrientA.id) > order.indexOf(nutrientB.id)) {
                return 1;
            } else {
                return -1;
            }
        });
        return array;
    };

    return (
        <div className={css.container}>
            <div style={{ justifyContent: 'center', display: 'flex' }}>
                <Image.PreviewGroup>
                    <Image width={150} alt={name} src={icon} />
                </Image.PreviewGroup>

            </div>
            <div>
                <Descriptions
                    title={name}
                    bordered
                    size='small'
                    style={{ backgroundColor: "#f5f5f5" }}
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}

                >

                    <Descriptions.Item label="ID">{id}</Descriptions.Item>
                    <Descriptions.Item label="Amount">{amount}</Descriptions.Item>
                    <Descriptions.Item label="Categories">{categories ? categories?.join(', ') : ''}</Descriptions.Item>
                    <Descriptions.Item label="Minimal Warn">{lowestAmount}</Descriptions.Item>
                    <Descriptions.Item label="Middel Warn">{midAmount}</Descriptions.Item>
                    <Descriptions.Item label="Unit">{unit}</Descriptions.Item>
                    <Descriptions.Item label="Package Quentitiy">{packageQuantity ? packageQuantity : ''}</Descriptions.Item>
                    <Descriptions.Item label="Package Unit">{packageUnit ? packageUnit : ''}</Descriptions.Item>
                    <Descriptions.Item label="Storage Location">{storageLocation ? storageLocation : ''}</Descriptions.Item>

                </Descriptions>
                {nutrients.length > 0 &&
                    <Descriptions
                        bordered
                        style={{ backgroundColor: "#f5f5f5", display: 'flex', justifyContent: 'center' }}
                    >
                        <Descriptions.Item label="Nutrients" style={{ padding: '16px 20px' }}>
                            <div className={css.naehrwert_table}>
                                <div className={css.bg_color}>
                                    {`Angaben für ${nutrientAmount} ${nutrientUnit}`}
                                </div>
                                <table cellSpacing={0}>
                                    <tbody>
                                        {
                                            nutrients.length > 0
                                                ? mapOrder(nutrients, sequence, 'id')
                                                    .map((nutrient, index) =>
                                                        <tr key={index} style={{ display: 'flex' }}>
                                                            {showLegend && <td className={css.legend}>
                                                                <input className={css.ingredientInput} value={nutrient.color} placeholder="red / #123456" onChange={(e) => onChangeNutrient(index, 'color', e.target.value)} />
                                                            </td>}
                                                            <th>
                                                                <input className={css.ingredientInput} value={nutrient.color} placeholder="red / #123456" onChange={(e) => onChangeNutrient(index, 'color', e.target.value)} />
                                                            </th>
                                                            <td className={css.text_right}>
                                                                <input className={css.ingredientInput} value={nutrient.color} placeholder="red / #123456" onChange={(e) => onChangeNutrient(index, 'color', e.target.value)} />
                                                            </td>
                                                            <td className={css.unit}>
                                                                <input className={css.ingredientInput} value={nutrient.color} placeholder="red / #123456" onChange={(e) => onChangeNutrient(index, 'color', e.target.value)} />

                                                            </td>

                                                        </tr>
                                                    )
                                                : ''
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>}
                <div className={css.buttonContainer}>
                    <Button className={css.formButton} type="primary" >Go Back</Button>
                    <Button className={css.formButton} type="primary" >Edit</Button>
                    <Button className={css.formButton} danger>Delete</Button>
                </div>
            </div>
        </div>
    )
}
