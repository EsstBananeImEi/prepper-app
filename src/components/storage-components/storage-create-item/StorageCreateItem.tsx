import React, { ReactElement, useState } from 'react'
import { Form, Input, InputNumber, Button, Select } from 'antd';
import css from './StorageCreateItem.module.css'

export default function StorageCreateItem(): ReactElement {
    const [categories, setCategories] = useState<string[]>([])

    const { Option } = Select;
    const onSubmit = () => {
        console.log('values');
    };

    const test = (event: string[]) => {
        setCategories(event)
    }

    return (
        <div className='ui container'>

            <form className={`ui form ${css.bookForm}`} onSubmit={onSubmit}>
                <label>Name</label>
                <input placeholder="Titel" required />

                <label>Categories</label>
                <Select mode="tags" style={{ width: '100%' }} value={categories} placeholder="Categorie1" onChange={(e) => test(e)}>
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

                                    <label>Contents</label>
                                    <input placeholder="123" />
                                </div>
                                <div>

                                    <label>Item Unit</label>
                                    <input placeholder="unit" />
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

                                    <label>Warn Low</label>
                                    <input placeholder="123" />
                                </div>
                                <div>

                                    <label>Warn Crit</label>
                                    <input placeholder="123" />
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
                                    <input placeholder="Contents" />
                                </div>
                                <div>

                                    <label>Packaging Unit</label>
                                    <input placeholder="Unit" />
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

                                    <label>nutritional value unit</label>
                                    <input placeholder="Unit" />
                                </div>
                                <div>

                                    <label>nutritional value</label>
                                    <input placeholder="Amount" />
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
                <label>Ingredient Name</label>
                <input placeholder="Proteine" required />
                <label>Ingredient Color</label>
                <input placeholder="#101111 o. red" required />
                <br />

                <label>Ingredients</label>
                <button className="ui mini button" type="button">+</button>
                <button className="ui mini button" type="button">-</button>
                <div className="fields">
                    <div className="sixteen wide field">
                        <input required placeholder="author" />
                    </div>
                </div>

                <label>Bild</label>
                <div className="field">
                    <input type='url' placeholder="https://baconmockup.com/800/600" />
                </div>
                <button className="ui button">Submit</button>
            </form >

        </div >
    )


}
