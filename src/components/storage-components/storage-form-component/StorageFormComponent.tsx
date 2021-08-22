import React, { ReactElement, useState } from 'react'
import { Form, Input, InputNumber, Button, Select } from 'antd';
import css from './StorageFormComponent.module.css'
import { NutrientModel, NutrientValueModel, StorageModel } from '../StorageModel';
import { storageApi } from '../../../hooks/StorageApi';
import { useHistory } from 'react-router-dom';
import { Method } from 'axios';

interface Props {
    id?: string
    name: string
    amount: string
    lowestAmount: string
    midAmount: string
    unit: string
    isEdit: boolean
    // this attributes only required if isEdit == True
    packageQuantity?: string
    packageUnit?: string
    categories?: string[]
    nutrients?: NutrientModel
    icon?: string
}

export default function StorageFormComponent(props: Props): ReactElement {
    const buildIngrientTypModel = () => ({ id: 1, name: '', color: '', values: { typ: '', value: 0 } })
    const [id, setId] = useState(props.id)
    const [name, setName] = useState(props.name)
    const [amount, setAmount] = useState(props.amount)
    const [lowestAmount, setLowestAmount] = useState(props.lowestAmount)
    const [midAmount, setMidAmount] = useState(props.midAmount)
    const [unit, setUnit] = useState(props.unit)
    const [packageQuantity, setPackageQuantity] = useState(props.packageQuantity ? props.packageQuantity : '') // optional !!
    const [packageUnit, setPackageUnit] = useState(props.packageUnit ? props.packageUnit : '') // optional !!
    const [categories, setCategories] = useState(props.categories ? props.categories : []) // Optional !!
    const [nutrientUnit, setNutrientUnit] = useState(props.nutrients ? props.nutrients.unit : '') // Optional !!
    const [nutrientAmount, setNutrientAmount] = useState(props.nutrients ? props.nutrients.amount : '') // Optional !!
    const [nutrients, setNutrients] = useState(props.nutrients && props.nutrients.values ? props.nutrients.values : []) // Optional !!
    const [icon, setIcon] = useState(props.icon ? props.icon : '') // Optional !!
    const history = useHistory()

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
    return (
        <div className='ui container'>

            <form className={`ui form ${css.bookForm}`} onSubmit={onSubmit}>
                <label>Name</label>
                <input placeholder="Titel" required value={name} onChange={(e) => setName(e.target.value)} />

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
                                    <input required placeholder="123" value={amount} onChange={(e) => setAmount(e.target.value)} />
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
                                    <input required placeholder="123" value={lowestAmount} onChange={(e) => setLowestAmount(e.target.value)} />
                                </div>
                                <div>

                                    <label>Warn Yellow</label>
                                    <input required placeholder="123" value={midAmount} onChange={(e) => setMidAmount(e.target.value)} />
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
                                    <input placeholder="123" value={packageQuantity} onChange={(e) => setPackageQuantity(e.target.value)} />
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
                                    <input placeholder="123" value={nutrientAmount} onChange={(e) => setNutrientAmount(Number(e.target.value))} />
                                </div>
                                <div>

                                    <label>nutritional value unit</label>
                                    <input placeholder="ml/g..." value={nutrientUnit} onChange={(e) => setNutrientUnit(e.target.value)} />
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
                <label>Nutrients</label>
                <button onClick={onAddIngredient} className="ui mini button" type="button">+</button>
                <button onClick={onRemoveIngredient} className="ui mini button" type="button">-</button>
                <div>

                    {nutrients.length > 0 &&
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
                                        <input className={css.ingredientInput} value={nutrient.id} placeholder="123" onChange={(e) => onChangeNutrient(index, 'id', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Name</label>
                                        <input className={css.ingredientInput} value={nutrient.name} placeholder="name" onChange={(e) => onChangeNutrient(index, 'name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Color</label>
                                        <input className={css.ingredientInput} value={nutrient.color} placeholder="red / #123456" onChange={(e) => onChangeNutrient(index, 'color', e.target.value)} />
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

                <button className="ui button">Submit</button>
            </form >

        </div >
    )
}
