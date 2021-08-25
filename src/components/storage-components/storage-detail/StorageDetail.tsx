import { Descriptions, Image } from 'antd';
import Button from 'antd-button-color';
import React, { ReactElement, SyntheticEvent } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import { Action, useStore } from '../../../Store';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { NutrientValueModel, StorageModel } from '../StorageModel';
import css from './StorageDetail.module.css';


export default function StorageDetail(): ReactElement {
    const { id } = useParams<{ id: string }>()
    const history = useHistory()
    const { store, dispatch } = useStore()
    const [dimensions] = useDemensions(() => 1, 0)
    const [storageItem, , axiosResponse] = useStorageApi<StorageModel>('GET', `/storeditems/${id}`)

    const showLegend = dimensions.width > 450 ? true : false
    axiosResponse && axiosResponse.catch((e) => {
        history.push(`/storeditems/error/${e.message}`)
    })

    if (!storageItem) { return <LoadingSpinner message="load storage items ..." /> }

    // mapOrder sorts the NutrientValueModel list by its id's
    const orderNutrients = (array: NutrientValueModel[]) => {
        return array.sort((objA, objB) => objA.id - objB.id)
    };

    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault()
        dispatch(action)
    }

    const onGoToList = () => history.push('/storedItems')
    const onGoBack = () => history.goBack()
    const onGoToEdit = () => history.push(`/storedItems/${storageItem.id}/edit`)
    const onDelete = (event: SyntheticEvent) => {
        onChangeCard(event, { type: 'CLEAR_ITEM_CARD', storeageItem: storageItem })
        storageApi('DELETE', `/storedItems/${id}`, onGoToList)
    }

    return (
        <div className={css.container}>
            <div style={{ justifyContent: 'center', display: 'flex' }}>
                <Image.PreviewGroup>
                    <Image width={150} alt={storageItem.name} src={storageItem.icon} />
                </Image.PreviewGroup>

            </div>
            <div>
                <Descriptions
                    title={storageItem.name}
                    bordered
                    size='small'
                    style={{ backgroundColor: "#f5f5f5" }}
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}

                >

                    <Descriptions.Item label="ID">{storageItem.id}</Descriptions.Item>
                    <Descriptions.Item label="Amount">{storageItem.amount}</Descriptions.Item>
                    <Descriptions.Item label="Categories">{storageItem.categories ? storageItem.categories?.join(', ') : ''}</Descriptions.Item>
                    <Descriptions.Item label="Minimal Warn">{storageItem.lowestAmount}</Descriptions.Item>
                    <Descriptions.Item label="Middel Warn">{storageItem.midAmount}</Descriptions.Item>
                    <Descriptions.Item label="Unit">{storageItem.unit}</Descriptions.Item>
                    <Descriptions.Item label="Package Quentitiy">{storageItem.packageQuantity ? storageItem.packageQuantity : ''}</Descriptions.Item>
                    <Descriptions.Item label="Package Unit">{storageItem.packageUnit ? storageItem.packageUnit : ''}</Descriptions.Item>
                    <Descriptions.Item label="Storage Location">{storageItem.storageLocation ? storageItem.storageLocation : ''}</Descriptions.Item>

                </Descriptions>
                {storageItem.nutrients && storageItem.nutrients.values.length > 0 &&
                    <Descriptions
                        bordered
                        style={{ backgroundColor: "#f5f5f5", display: 'flex', justifyContent: 'center' }}
                    >
                        <Descriptions.Item label="Nutrients" style={{ padding: '16px 20px' }}>
                            <div className={css.naehrwert_table}>
                                <div className={css.bg_color}>
                                    {`Angaben für ${storageItem.nutrients.amount} ${storageItem.nutrients.unit}`}
                                </div>
                                <table cellSpacing={0}>
                                    <tbody>
                                        {
                                            storageItem.nutrients.values.length > 0
                                                ? orderNutrients(storageItem.nutrients.values)
                                                    .map((nutrient, index) =>
                                                        <tr key={index}>
                                                            {showLegend && <td className={css.legend}><span style={{ backgroundColor: nutrient.color }}></span></td>}
                                                            <th>{nutrient.name}</th>
                                                            <td className={css.text_right}>{nutrient.values.value}</td>
                                                            <td className={css.unit}>{nutrient.values.typ}</td>

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
                    <Button className={css.formButton} onClick={onGoBack} type="success" >Go Back</Button>
                    <Button className={css.formButton} onClick={onGoToEdit} type="warning" >Edit</Button>
                    <Button className={css.formButton} onClick={(e) => onDelete(e)} danger>Delete</Button>
                </div>
            </div>
        </div>
    );
}

