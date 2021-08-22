import React, { ReactElement, useState } from 'react'
import { Form, Input, InputNumber, Button, Select } from 'antd';
import css from './StorageFromComponent.module.css'
import { NutrientValueModel, StorageModel } from '../StorageModel';
import { storageApi } from '../../../hooks/StorageApi';
import { useHistory } from 'react-router-dom';

export default function StorageFormComponent(): ReactElement {
    const buildIngrientTypModel = () => ({ id: 0, name: '', color: '', values: { typ: '', value: 0, } })
    const [id, setId] = useState<number>()
    const [name, setName] = useState<string>()
    const [amount, setAmount] = useState<number>()
    const [lowestAmount, setLowestAmount] = useState<number>()
    const [midAmount, setMidAmount] = useState<number>()
    const [unit, setUnit] = useState<string>()
    const [packageQuantity, setPackageQuantity] = useState<number>() // optional !!
    const [packageUnit, setPackageUnit] = useState<string>() // optional !!
    const [categories, setCategories] = useState<string[]>() // Optional !!
    const [nutrientUnit, setNutrientUnit] = useState<string>() // Optional !!
    const [nutrientAmount, setNutrientAmount] = useState<number>() // Optional !!
    const [nutrients, setNutrients] = useState<NutrientValueModel[]>([buildIngrientTypModel()]) // Optional !!
    const [icon, setIcon] = useState<string>('') // Optional !!
    const history = useHistory()

    const buildIngrientModel = () => ({ description: '', unit: nutrientUnit, amount: nutrientAmount, values: nutrients })

    const getStorageItem = () => {
        return { id, name, amount, lowestAmount, midAmount, unit, categories: categories, packageQuantity, packageUnit, nutrients: buildIngrientModel(), icon }
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        storageApi('POST', '/storedItems', onGoToList, getStorageItem())
    };

    const onGoToList = () => { history.push('/storedItems') }

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
                                    <input required placeholder="123" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                                </div>
                                <div>

                                    <label>Item Unit</label>
                                    <input required placeholder="unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
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

                                    <label>Warn Crit</label>
                                    <input required placeholder="123" value={lowestAmount} onChange={(e) => setLowestAmount(Number(e.target.value))} />
                                </div>
                                <div>

                                    <label>Warn Low</label>
                                    <input required placeholder="123" value={midAmount} onChange={(e) => setMidAmount(Number(e.target.value))} />
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
                                    <input placeholder="Contents" value={packageQuantity} onChange={(e) => setPackageQuantity(Number(e.target.value))} />
                                </div>
                                <div>

                                    <label>Packaging Unit</label>
                                    <input placeholder="Unit" value={packageUnit} onChange={(e) => setPackageUnit(e.target.value)} />
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
                                    <input placeholder="Amount" value={nutrientAmount} onChange={(e) => setNutrientAmount(Number(e.target.value))} />
                                </div>
                                <div>

                                    <label>nutritional value unit</label>
                                    <input placeholder="Unit" value={nutrientUnit} onChange={(e) => setNutrientUnit(e.target.value)} />
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
                                        <input className={css.ingredientInput} value={nutrient.id} placeholder="id" onChange={(e) => onChangeNutrient(index, 'id', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Name</label>
                                        <input className={css.ingredientInput} value={nutrient.name} placeholder="name" onChange={(e) => onChangeNutrient(index, 'name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Color</label>
                                        <input className={css.ingredientInput} value={nutrient.color} placeholder="color" onChange={(e) => onChangeNutrient(index, 'color', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Typ</label>
                                        <input className={css.ingredientInput} value={nutrient.values.typ} placeholder="typ" onChange={(e) => onChangeNutrientTypValues(index, 'typ', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Value</label>
                                        <input className={css.ingredientInput} value={nutrient.values.value} placeholder="value" onChange={(e) => onChangeNutrientTypValues(index, 'value', e.target.value)} />
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
