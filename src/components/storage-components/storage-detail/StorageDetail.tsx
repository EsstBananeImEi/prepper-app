import { Descriptions, Image } from 'antd';
import Button from 'antd-button-color';
import React, { ReactElement, SyntheticEvent } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import { editItemRoute, errorRoute, itemIdApi, itemsRoute } from '../../../shared/Constants';
import { Action, useStore } from '../../../store/Store';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { NutrientValueModel, StorageModel } from '../StorageModel';
import css from './StorageDetail.module.css';

export default function StorageDetail(): ReactElement {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const { store, dispatch } = useStore();
    const [dimensions] = useDemensions(() => 1, 0);
    const [storageItem, , axiosResponse] = useStorageApi<StorageModel>('GET', itemIdApi(id));

    const showLegend = dimensions.width > 450;
    axiosResponse && axiosResponse.catch((e) => {
        history.push(errorRoute(e.message));
    });

    if (!storageItem) {
        return <LoadingSpinner message="load storage items ..." />;
    }

    // Sortiert die NutrientValueModel-Objekte nach ihrer ID
    const orderNutrientValues = (array: NutrientValueModel[]) => {
        return array.sort((a, b) => a.id - b.id);
    };

    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault();
        dispatch(action);
    };

    const onGoToList = () => history.push(itemsRoute);
    const onGoBack = () => history.goBack();
    const onGoToEdit = () => history.push(editItemRoute(id));
    const onDelete = (event: SyntheticEvent) => {
        onChangeCard(event, { type: 'CLEAR_ITEM_CARD', storeageItem: storageItem });
        storageApi('DELETE', itemIdApi(id), onGoToList);
    };

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
                    size="small"
                    style={{ backgroundColor: "#f5f5f5" }}
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                >
                    <Descriptions.Item label="ID">{storageItem.id}</Descriptions.Item>
                    <Descriptions.Item label="Amount">{storageItem.amount}</Descriptions.Item>
                    <Descriptions.Item label="Categories">
                        {storageItem.categories ? storageItem.categories.join(', ') : ''}
                    </Descriptions.Item>
                    <Descriptions.Item label="Minimal Warn">{storageItem.lowestAmount}</Descriptions.Item>
                    <Descriptions.Item label="Middel Warn">{storageItem.midAmount}</Descriptions.Item>
                    <Descriptions.Item label="Unit">{storageItem.unit}</Descriptions.Item>
                    <Descriptions.Item label="Package Quantity">
                        {storageItem.packageQuantity ? storageItem.packageQuantity : ''}
                    </Descriptions.Item>
                    <Descriptions.Item label="Package Unit">
                        {storageItem.packageUnit ? storageItem.packageUnit : ''}
                    </Descriptions.Item>
                    <Descriptions.Item label="Storage Location">
                        {storageItem.storageLocation ? storageItem.storageLocation : ''}
                    </Descriptions.Item>
                </Descriptions>
                {storageItem.nutrients && storageItem.nutrients.values.length > 0 && (
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
                                        {orderNutrientValues(storageItem.nutrients.values).map((nutrientValue, index) => (
                                            <tr key={index}>
                                                {showLegend && (
                                                    <td className={css.legend}>
                                                        <span style={{ backgroundColor: nutrientValue.color }}></span>
                                                    </td>
                                                )}
                                                <th>{nutrientValue.name}</th>
                                                <td className={css.text_right}>
                                                    {nutrientValue.values && nutrientValue.values.length > 0 ? (
                                                        nutrientValue.name === "Kalorien" ? (
                                                            // Für "Kalorien" werden die Werte in separaten <div>-Elementen angezeigt:
                                                            nutrientValue.values.map((v, i) => <div key={i}>{v.value}</div>)
                                                        ) : (
                                                            // Für alle anderen Nutrient-Werte werden die Werte wie bisher als kommagetrennte Liste dargestellt:
                                                            nutrientValue.values.map(v => v.value).join(", ")
                                                        )
                                                    ) : (
                                                        ""
                                                    )}
                                                </td>
                                                <td className={css.unit}>
                                                    {nutrientValue.values && nutrientValue.values.length > 0 ? (
                                                        nutrientValue.name === "Kalorien" ? (
                                                            nutrientValue.values.map((v, i) => <div key={i}>{v.typ}</div>)
                                                        ) : (
                                                            nutrientValue.values.map(v => v.typ).join(", ")
                                                        )
                                                    ) : (
                                                        ""
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                )}
                <div className={css.buttonContainer}>
                    <Button className={css.formButton} onClick={onGoBack} type="success">Go Back</Button>
                    <Button className={css.formButton} onClick={onGoToEdit} type="warning">Edit</Button>
                    <Button className={css.formButton} onClick={(e) => onDelete(e)} danger>Delete</Button>
                </div>
            </div>
        </div>
    );
}
