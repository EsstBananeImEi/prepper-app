import { Descriptions, Image, Button, Alert } from 'antd';
import React, { ReactElement, SyntheticEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import { editItemRoute, errorRoute, itemIdApi, itemsRoute } from '../../../shared/Constants';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { NutrientValueModel, StorageModel } from '../StorageModel';
import css from './StorageDetail.module.css';

export default function StorageDetail(): ReactElement {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [dimensions] = useDemensions(() => 1, 0);


    const endpoint = id ? itemIdApi(id) : '';
    const [storageItem, , axiosResponse] = useStorageApi<StorageModel>('GET', endpoint);
    // Falls id nicht vorhanden ist, sofort einen Fehler anzeigen oder eine alternative UI rendern
    if (!id) {
        return <div>Error: Keine ID angegeben</div>;
    }

    // Jetzt ist id garantiert ein string
    const showLegend = dimensions.width > 450;

    if (axiosResponse) {
        axiosResponse.catch((e) => {
            navigate(errorRoute(e.message));
        });
    }

    if (!storageItem) {
        return <LoadingSpinner message="Loading storage items ..." />;
    }

    // Sortiere die Nutrient-Werte nach ID
    const orderNutrientValues = (array: NutrientValueModel[]) => {
        return array.sort((a, b) => a.id - b.id);
    };

    // In React Router v6: navigate(-1) geht einen Schritt zurück
    const onGoBack = () => navigate(-1);
    const onGoToEdit = () => navigate(editItemRoute(id));
    const onDelete = (event: SyntheticEvent) => {
        event.preventDefault();
        // Optional: Bestätigung einbauen
        storageApi('DELETE', itemIdApi(id), () => navigate(itemsRoute));
    };

    return (
        <div className={css.container}>
            {/* Bildanzeige */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <Image.PreviewGroup>
                    <Image width={150} alt={storageItem.name} src={storageItem.icon || '/default.png'} />
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
