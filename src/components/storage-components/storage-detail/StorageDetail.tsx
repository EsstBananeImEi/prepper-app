import { Descriptions, Image, Button, Alert } from 'antd';
import React, { ReactElement, SyntheticEvent } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import { editItemRoute, errorRoute, itemIdApi, itemsRoute } from '../../../shared/Constants';
import { useStore } from '../../../store/Store';
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
        return <LoadingSpinner message="Loading storage items ..." />;
    }

    // Sortiere die Nutrient-Werte nach ID
    const orderNutrientValues = (array: NutrientValueModel[]) => {
        return array.sort((a, b) => a.id - b.id);
    };

    const onGoBack = () => history.goBack();
    const onGoToEdit = () => history.push(editItemRoute(id));
    const onDelete = (event: SyntheticEvent) => {
        event.preventDefault();
        // Optional: Bestätigung einbauen
        storageApi('DELETE', itemIdApi(id), () => history.push(itemsRoute));
    };

    return (
        <div className={css.container}>
            {/* Bildanzeige */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <Image.PreviewGroup>
                    <Image width={150} alt={storageItem.name} src={storageItem.icon || 'https://via.placeholder.com/150'} />
                </Image.PreviewGroup>
            </div>

            {/* Allgemeine Felder als Card (read‑only) */}
            <div className={css.itemFormCard}>
                <div className={css.itemHeader}>{storageItem.name}</div>
                <div className={css.itemFields}>
                    <div className={css.itemFieldRow}>
                        <label>ID</label>
                        <div>{storageItem.id}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Amount</label>
                        <div>{storageItem.amount}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Categories</label>
                        <div>{storageItem.categories ? storageItem.categories.join(', ') : '-'}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Minimal Warn</label>
                        <div>{storageItem.lowestAmount}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Middel Warn</label>
                        <div>{storageItem.midAmount}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Unit</label>
                        <div>{storageItem.unit}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Package Quantity</label>
                        <div>{storageItem.packageQuantity ? storageItem.packageQuantity : '-'}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Package Unit</label>
                        <div>{storageItem.packageUnit ? storageItem.packageUnit : '-'}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Storage Location</label>
                        <div>{storageItem.storageLocation ? storageItem.storageLocation : '-'}</div>
                    </div>
                </div>
            </div>

            {/* Nutrients-Bereich als Card Layout */}
            {storageItem.nutrients && storageItem.nutrients.values.length > 0 && (
                <div className={css.nutrientSection}>
                    <div className={css.nutrientSectionHeader}>
                        {`Nährstoffangaben pro ${storageItem.nutrients.amount} ${storageItem.nutrients.unit}`}
                    </div>
                    <div className={css.nutrientCardsContainer}>
                        {orderNutrientValues(storageItem.nutrients.values).map((nutrientValue, index) => (
                            <div key={index} className={css.nutrientCard}>
                                <div className={css.nutrientHeader}>

                                    <div
                                        className={css.nutrientColor}
                                        style={{ backgroundColor: nutrientValue.color }}
                                    ></div>
                                    <div className={css.nutrientName}>{nutrientValue.name}</div>
                                    <div className={css.nutrientColorCode}>{nutrientValue.color}</div>
                                </div>
                                <div className={css.nutrientValues}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'right' }}>Value</th>
                                                <th style={{ textAlign: 'right' }}>Unit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {nutrientValue.values.map((val, i) => (
                                                <tr key={i}>
                                                    <td className={css.text_right}>{val.value}</td>
                                                    <td className={css.unit}>{val.typ}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Entferne den Footer-Button, da in der Read-Only Ansicht kein "Entfernen" vorgesehen ist */}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Aktions-Buttons */}
            <div className={css.buttonContainer}>
                <Button onClick={onGoBack} type="default">
                    Zurück
                </Button>
                <Button onClick={onGoToEdit} type="primary">
                    Bearbeiten
                </Button>
                <Button onClick={onDelete} danger>
                    Löschen
                </Button>
            </div>
        </div>
    );
}
