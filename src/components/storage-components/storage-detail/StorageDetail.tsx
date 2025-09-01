import { Image, Button, Alert, Tag } from 'antd';
import React, { ReactElement, SyntheticEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { itemsRoute, editItemRoute } from '../../../shared/Constants';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { NutrientValueModel } from '../StorageModel';
import { useUnitPreferences } from '../../../hooks/useUnitPreferences';
import { formatQuantity } from '../../../utils/unitFormatter';
import css from './StorageDetail.module.css';
import { useStore } from '../../../store/Store';
import { actionHandler } from '../../../store/Actions';
import { handleApiError } from '../../../hooks/useApi';
import { ensureDataUrlPrefix } from '../../../utils/imageUtils';
import { useTranslation } from 'react-i18next';

export default function StorageDetail(): ReactElement {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string>('');
    const { store, dispatch } = useStore();
    const unitPrefs = useUnitPreferences();

    const storageItem = store.storeItems.find((item) => id ? item.id === parseInt(id) : false);
    // Falls id nicht vorhanden ist, sofort einen Fehler anzeigen oder eine alternative UI rendern
    if (!id) {
        return <Alert style={{ marginBottom: 16 }} message={t('detail.noIdError')} type="error" showIcon />;
    }

    if (!storageItem) {
        return <LoadingSpinner message={t('detail.loadingItems')} />;
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

    const fq = formatQuantity(storageItem.amount, storageItem.unit, unitPrefs);

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
                                {t('detail.imageLoading')}
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
                        <label>{t('detail.labels.id')}</label>
                        <div>{storageItem.id}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>{t('detail.labels.amount')}</label>
                        <div>{fq.value}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>{t('detail.labels.unit')}</label>
                        <div>{fq.unit && fq.unit.trim() !== '' ? fq.unit : '-'}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>{t('detail.labels.categories')}</label>
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
                <div className={css.itemHeader}>{t('detail.sections.details')}</div>
                <div className={css.itemFields}>
                    <div className={css.itemFieldRow}>
                        <label>{t('detail.labels.lowThreshold')}</label>
                        <div>{storageItem.lowestAmount}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>{t('detail.labels.midThreshold')}</label>
                        <div>{storageItem.midAmount}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>{t('detail.labels.storageLocation')}</label>
                        <div>{storageItem.storageLocation ? storageItem.storageLocation : '-'}</div>
                    </div>
                </div>
            </div>

            {/* Verpackung */}
            <div className={css.itemFormCard}>
                <div className={css.itemHeader}>{t('detail.sections.packaging')}</div>
                <div className={css.itemFields}>
                    <div className={css.itemFieldRow}>
                        <label>{t('detail.labels.packageQty')}</label>
                        <div>{typeof storageItem.packageQuantity === 'number' ? storageItem.packageQuantity : '-'}</div>
                    </div>
                    <div className={css.itemFieldRow}>
                        <label>{t('detail.labels.packageUnit')}</label>
                        <div>{storageItem.packageUnit && storageItem.packageUnit.trim() !== '' ? storageItem.packageUnit : '-'}</div>
                    </div>
                </div>
            </div>

            {/* Nährwerte */}
            {storageItem.nutrients && (
                <div className={css.itemFormCard}>
                    <div className={css.nutrientSectionHeader}>
                        {t('detail.nutrientsHeader', { amount: storageItem.nutrients.amount, unit: storageItem.nutrients.unit })}
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
                                                <th style={{ textAlign: 'right' }}>{t('detail.table.value')}</th>
                                                <th style={{ textAlign: 'right' }}>{t('detail.table.unit')}</th>
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
                <Button onClick={onGoBack} type="default">{t('detail.buttons.back')}</Button>
                <Button onClick={onGoToEdit} type="primary">{t('detail.buttons.edit')}</Button>
                <Button onClick={onDelete} danger loading={saving}>{t('detail.buttons.delete')}</Button>
            </div>
        </div>
    );
}
