import { Select } from 'antd';
import Button from "antd-button-color";
import { Method } from 'axios';
import { debounce } from 'lodash';
import React, { ReactElement, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { bingImageSearchApi, storageApi } from '../../../hooks/StorageApi';
import { itemsApi, itemIdApi, itemsRoute } from '../../../shared/Constants';
import { NutrientFactory } from '../../../shared/Factories';
import { NutrientModel, NutrientValueModel } from '../StorageModel';
import css from './StorageForm.module.css';
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

export default function StorageForm(props: Props): ReactElement {
    const buildIngrientTypModel = () => ({ id: 1, name: '', color: '', values: { typ: '', value: 0 } })
    const [bingOject, setBingObject] = useState({ value: [{ thumbnailUrl: '' }] })
    const history = useHistory()
    const nutrientFactory = NutrientFactory()

    const handleNutrients = () => {
        const newNutrients: NutrientValueModel[] = []

        const array = nutrientFactory.map(object => {
            const newObject: NutrientValueModel = { id: object.id, name: object.name, color: object.color, values: { typ: '', value: 0 } }
            newNutrients.push(newObject)
        })
        return newNutrients
    }

    const isEdit = props.isEdit
    const [id, setId] = useState(props.id)
    const [name, setName] = useState(props.name)
    const [amount, setAmount] = useState(props.amount ? Number(props.amount) : '')
    const [lowestAmount, setLowestAmount] = useState(props.lowestAmount ? Number(props.lowestAmount) : '')
    const [midAmount, setMidAmount] = useState(props.midAmount ? Number(props.midAmount) : '')
    const [unit, setUnit] = useState(props.unit)
    const [storageLocation, setStorageLocation] = useState(props.storageLocation)
    const [packageQuantity, setPackageQuantity] = useState(props.packageQuantity ? Number(props.packageQuantity) : '') // optional !!
    const [packageUnit, setPackageUnit] = useState(props.packageUnit ? props.packageUnit : '') // optional !!
    const [categories, setCategories] = useState(props.categories ? props.categories : []) // Optional !!
    const [nutrientUnit, setNutrientUnit] = useState(props.nutrients ? props.nutrients.unit : '') // Optional !!
    const [nutrientAmount, setNutrientAmount] = useState(props.nutrients ? Number(props.nutrients.amount) : '') // Optional !!
    const [nutrients, setNutrients] = useState(props.nutrients && props.nutrients.values ? props.nutrients.values : handleNutrients()) // Optional !!
    const [icon, setIcon] = useState(props.icon ? props.icon : '') // Optional !!

    const debounceHandler = useCallback(
        debounce((name: string) => {
            bingImageSearchApi(name, setBingObject)
        }, 800),
        []
    );

    const buildIngrientModel = () => ({ description: '', unit: nutrientUnit, amount: nutrientAmount, values: nutrients })

    const getPicture = () => {
        const url = 'thumbnailUrl' in bingOject.value[0] ? bingOject.value[0].thumbnailUrl : ''
        return url
    }

    const handleChange = (name: string) => {
        setName(name)
        debounceHandler(name)
    }

    const getStorageItem = () => {
        return { id, name, amount, lowestAmount, midAmount, unit, categories: categories, packageQuantity, packageUnit, nutrients: buildIngrientModel(), icon: icon !== '' ? icon : getPicture() }
    }

    const getStorageApiParameters = (): [Method, string, () => void] => {
        if (props.isEdit && id) {
            return ['PUT', itemIdApi(id), onGoBack]
        }
        return ['POST', itemsApi, onGoToList]
    }

    const onSubmit = (e: React.FormEvent) => {
        const [method, route, onGoFunc] = getStorageApiParameters()

        e.preventDefault()
        storageApi(method, route, onGoFunc, getStorageItem())
    };

    const onGoToList = () => { history.push(itemsRoute) }
    const onGoBack = () => { history.goBack() }

    const onChangeNutrient = (index: number, key: string, value: string | number) => {
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

    const onSetCategories = (event: string[]) => { setCategories(event) }

    const onAddIngredient = () => setNutrients(currentIngredients => [...currentIngredients, buildIngrientTypModel()])
    const onRemoveIngredient = () => {
        setNutrients(currentIngredient => {
            const newIngredient = [...currentIngredient]
            newIngredient.length > 0 && newIngredient.pop()
            return newIngredient
        })
    }
    return (
        <div className='ui container'>

            <form className={`ui form ${css.bookForm}`} onSubmit={onSubmit}>
                <label>Name</label>
                <input placeholder="Titel" required value={name} onChange={(e) => handleChange(e.target.value)} />

                <label>Categories</label>
                <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    value={categories}
                    placeholder="Categorie1"
                    onChange={(e) => onSetCategories(e)}>
                </Select>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignContent: 'center',
                    alignItems: 'center',
                }}>
                    <br />

                    <div style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-around',
                        textAlign: 'center',
                    }}>

                        <div>
                            <span>Item Information</span>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                textAlign: 'center',
                            }}>

                                <div>

                                    <label>Item mount</label>
                                    <input required placeholder="123" type='number' value={amount} onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : e.target.value)} />
                                </div>
                                <div>

                                    <label>Item Unit</label>
                                    <input required placeholder="Pack/Bottle..." value={unit} onChange={(e) => setUnit(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <span>Warn Level</span>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                textAlign: 'center',
                            }}>

                                <div>

                                    <label>Warn Red</label>
                                    <input required placeholder="123" type='number' value={lowestAmount} onChange={(e) => setLowestAmount(e.target.value ? Number(e.target.value) : e.target.value)} />
                                </div>
                                <div>

                                    <label>Warn Yellow</label>
                                    <input required placeholder="123" type='number' value={midAmount} onChange={(e) => setMidAmount(e.target.value ? Number(e.target.value) : e.target.value)} />
                                </div>
                            </div>
                        </div>

                    </div>


                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignContent: 'center',
                    alignItems: 'center',
                }}>
                    <br />

                    <div style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-around',
                        textAlign: 'center',
                    }}>

                        <div>
                            <span>Package Information</span>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                textAlign: 'center',
                            }}>

                                <div>

                                    <label>package contents</label>
                                    <input placeholder="123" type='number' value={packageQuantity} onChange={(e) => setPackageQuantity(e.target.value)} />
                                </div>
                                <div>

                                    <label>Packaging Unit</label>
                                    <input placeholder="Gramm/Liter..." value={packageUnit} onChange={(e) => setPackageUnit(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <span>Nutritional Information</span>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                textAlign: 'center',
                            }}>

                                <div>

                                    <label>nutritional value</label>
                                    <input placeholder="123" type='number' value={nutrientAmount} onChange={(e) => setNutrientAmount(e.target.value ? Number(e.target.value) : e.target.value)} />
                                </div>
                                <div>

                                    <label>nutritional value unit</label>
                                    <input placeholder="ml/g..." type='text' value={nutrientUnit} onChange={(e) => setNutrientUnit(e.target.value.toLowerCase())} />
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                <label>Nutrients</label>
                <div>
                    <button onClick={onAddIngredient} className="ui mini button" type="button">+</button>
                    <button onClick={onRemoveIngredient} className="ui mini button" type="button">-</button>

                </div>
                <div>

                    {
                        nutrients.map((nutrient, index) =>
                            <div key={index} className="fields">
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-evenly',
                                        width: '100%'
                                    }}>
                                    <div>
                                        <label>Id</label>
                                        <input className={css.ingredientInput} type='number' value={nutrient.id} placeholder="123" onChange={(e) => onChangeNutrient(index, 'id', Number(e.target.value))} />
                                    </div>
                                    <div>
                                        <label>Name</label>
                                        <input className={css.ingredientInput} value={nutrient.name} placeholder="name" onChange={(e) => onChangeNutrient(index, 'name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Color</label>
                                        <input className={css.ingredientInput} style={{ color: nutrient.color }} value={nutrient.color} placeholder="red / #123456" onChange={(e) => onChangeNutrient(index, 'color', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Typ</label>
                                        <input className={css.ingredientInput} value={nutrient.values.typ} placeholder="g/kcal/ml..." onChange={(e) => onChangeNutrientTypValues(index, 'typ', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Value</label>
                                        <input className={css.ingredientInput} value={nutrient.values.value} placeholder="123" onChange={(e) => onChangeNutrientTypValues(index, 'value', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                        )}
                </div>

                <label>Bild</label>
                <div className="field">
                    <input type='url' value={icon} placeholder="https://baconmockup.com/800/600" onChange={(e) => setIcon(e.target.value)} />
                </div>

                <Button type="info" htmlType='submit'>Submit</Button>

                <Button onClick={onGoBack} ghost type="danger">Cancel</Button>
            </form >

        </div >
    )
}
