import { Button, Descriptions, Image } from 'antd';
import React, { ReactElement } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { NutrientValueModel, StorageModel } from '../StorageModel';
import css from './StorageDetail.module.css';


export default function StorageDetail(): ReactElement {
    const { id } = useParams<{ id: string }>()
    const history = useHistory()
    const [dimensions] = useDemensions(() => 1, 0)
    const [storageItem, , axiosResponse] = useStorageApi<StorageModel>('GET', `/storeditems/${id}`)

    const sequence: number[] = [1, 2, 3, 4, 5, 6, 7]

    const showLegend = dimensions.width > 450 ? true : false
    axiosResponse && axiosResponse.catch((e) => {
        history.push(`/storeditems/error/${e.message}`)
    })

    if (!storageItem) { return <LoadingSpinner message="load storage items ..." /> }

    // mapOrder sorts the NutrientValueModel list by its id's
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

    const onGoToList = () => history.push('/storedItems')

    const onGoBack = () => history.goBack()
    const onGoToEdit = () => history.push(`/storedItems/${storageItem.id}/edit`)
    const onDelete = () => storageApi('DELETE', `/storedItems/${id}`, onGoToList)




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

                </Descriptions>
                {storageItem.nutrients &&
                    <Descriptions
                        bordered
                        style={{ backgroundColor: "#f5f5f5", display: 'flex', justifyContent: 'center' }}
                    >
                        <Descriptions.Item label="Nutrients" style={{ padding: '16px 20px' }}>
                            <div className={css.naehrwert_table}>
                                <div className={css.bg_color}>
                                    {`Angaben fürs ${storageItem.nutrients.amount} ${storageItem.nutrients.unit}`}
                                </div>
                                <table cellSpacing={0}>
                                    <tbody>
                                        {
                                            storageItem.nutrients.values.length > 0
                                                ? mapOrder(storageItem.nutrients.values, sequence, 'id')
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
                    <Button className={css.formButton} onClick={onGoBack} type="primary" >Go Back</Button>
                    <Button className={css.formButton} onClick={onGoToEdit} type="primary" >Edit</Button>
                    <Button className={css.formButton} onClick={onDelete} danger>Delete</Button>
                </div>
            </div>
        </div>
    );
}

