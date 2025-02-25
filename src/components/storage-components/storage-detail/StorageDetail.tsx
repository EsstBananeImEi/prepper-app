import { Descriptions, Image, Button, Alert } from 'antd';
import React, { ReactElement, SyntheticEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import { editItemRoute, errorRoute, itemIdApi, itemsRoute } from '../../../shared/Constants';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { BasketModel, NutrientValueModel, StorageModel } from '../StorageModel';
import css from './StorageDetail.module.css';
import { useStore } from '../../../store/Store';
import { actionHandler } from '../../../store/Actions';
import axios from 'axios';

export default function StorageDetail(): ReactElement {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [dimensions] = useDemensions(() => 1, 0);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string>('');
    const endpoint = id ? itemIdApi(id) : '';
    const { store, dispatch } = useStore();

    const storageItem = store.storeItems.find((item) => id ? item.id === parseInt(id) : false);
    // Falls id nicht vorhanden ist, sofort einen Fehler anzeigen oder eine alternative UI rendern
    if (!id) {
        return <Alert style={{ marginBottom: 16 }} message="Keine ID gefunden" type="error" showIcon />;
    }

    // Jetzt ist id garantiert ein string
    const showLegend = dimensions.width > 450;

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

    const onDelete = async (event: SyntheticEvent) => {
        event.preventDefault();
        setSaving(true);
        setSaveError('');
        try {
            const basketItems = store.shoppingCard.find((item) => item.name === storageItem.name);

            await actionHandler({ type: 'DELETE_STORAGE_ITEM', storageItem: storageItem }, dispatch);
            if (basketItems)
                await actionHandler({ type: 'CLEAR_ITEM_CARD', basketItems }, dispatch);
            navigate(itemsRoute);
        } catch (error) {
            let errorMessage = 'Fehler beim Löschen des Elements';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.error || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            setSaveError(errorMessage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSaving(false);
        }

    };

    return (
        <div className={css.container}>
            {saveError && (
                <Alert style={{ marginBottom: 16 }} message={saveError} type="error" showIcon />
            )}
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
