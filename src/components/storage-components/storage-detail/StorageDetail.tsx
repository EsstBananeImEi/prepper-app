import { Image, Button, Alert, Tag } from 'antd';
import React, { ReactElement, SyntheticEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { itemsRoute, editItemRoute } from '../../../shared/Constants';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { NutrientValueModel } from '../StorageModel';
import css from './StorageDetail.module.css';
import { useStore } from '../../../store/Store';
import { actionHandler } from '../../../store/Actions';
import { handleApiError } from '../../../hooks/useApi';
import { ensureDataUrlPrefix } from '../../../utils/imageUtils';

export default function StorageDetail(): ReactElement {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string>('');
    const { store, dispatch } = useStore();

    const storageItem = store.storeItems.find((item) => id ? item.id === parseInt(id) : false);
    // Falls id nicht vorhanden ist, sofort einen Fehler anzeigen oder eine alternative UI rendern
    if (!id) {
        return <Alert style={{ marginBottom: 16 }} message="Keine ID gefunden" type="error" showIcon />;
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
    const onGoToEdit = () => {
        try {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        } catch {
            window.scrollTo(0, 0);
        }
        navigate(editItemRoute(id));
    };

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
            const errorMessage = handleApiError(error, false);
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

            {/* Bild */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <Image.PreviewGroup>
                    <Image
                        width={150}
                        alt={storageItem.name}
                        src={storageItem.icon ? ensureDataUrlPrefix(storageItem.icon) : '/default.png'}
                        placeholder={
                            <div style={{
                                width: 150,
                                height: 150,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #d9d9d9',
                                borderRadius: '6px'
                            }}>
                                Bild wird geladen...
                            </div>
                        }
                        fallback="/default.png"
                    />
                </Image.PreviewGroup>
            </div>

            {/* Basis */}
            <div className={css.itemFormCard}>
                <div className={css.itemHeader}>{storageItem.name}</div>
                <div className={css.itemFields}>
                    <div className={css.itemFieldRow}>
                        <label>ID</label>
                        <div>{storageItem.id}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Menge</label>
                        <div>{storageItem.amount}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Mengeneinheit</label>
                        <div>{storageItem.unit && storageItem.unit.trim() !== '' ? storageItem.unit : '-'}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Kategorien</label>
                        <div>
                            {storageItem.categories && storageItem.categories.length > 0
                                ? storageItem.categories.map((c, idx) => (
                                    <Tag key={`${c}-${idx}`} style={{ marginBottom: 4 }}>{c}</Tag>
                                ))
                                : '-'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className={css.itemFormCard}>
                <div className={css.itemHeader}>Details</div>
                <div className={css.itemFields}>
                    <div className={css.itemFieldRow}>
                        <label>Warnschwelle (minimal)</label>
                        <div>{storageItem.lowestAmount}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Warnschwelle (mittel)</label>
                        <div>{storageItem.midAmount}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Lagerort</label>
                        <div>{storageItem.storageLocation ? storageItem.storageLocation : '-'}</div>
                    </div>
                </div>
            </div>

            {/* Verpackung */}
            <div className={css.itemFormCard}>
                <div className={css.itemHeader}>Verpackung</div>
                <div className={css.itemFields}>
                    <div className={css.itemFieldRow}>
                        <label>Packungsmenge</label>
                        <div>{storageItem.packageQuantity != null ? storageItem.packageQuantity : '-'}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>Packungseinheit</label>
                        <div>{storageItem.packageUnit ? storageItem.packageUnit : '-'}</div>
                    </div>
                </div>
            </div>

            {/* Nährwerte */}
            {storageItem.nutrients && storageItem.nutrients.values.length > 0 && (
                <div className={css.nutrientSection}>
                    <div className={css.nutrientSectionHeader}>
                        {`Nährwertangaben pro ${storageItem.nutrients.amount} ${storageItem.nutrients.unit}`}
                    </div>
                    {storageItem.nutrients.description && (
                        <div style={{ marginBottom: 12, textAlign: 'center' }}>
                            {storageItem.nutrients.description}
                        </div>
                    )}
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
                                                <th style={{ textAlign: 'right' }}>Wert</th>
                                                <th style={{ textAlign: 'right' }}>Einheit</th>
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

            {/* Aktions-Buttons (sticky, wie im Formular) */}
            <div className={css.actionBar}>
                <Button onClick={onGoBack} type="default">
                    Zurück
                </Button>
                <Button onClick={onGoToEdit} type="primary">
                    Bearbeiten
                </Button>
                <Button onClick={onDelete} danger loading={saving}>
                    Löschen
                </Button>
            </div>
        </div>
    );
}
