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
import i18n from '../../../i18n';

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

    const normalizeKey = (s?: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    // prefer nutrient group's metadata (amount/unit) when present
    const nutrientGroup = Array.isArray(storageItem.nutrients) ? (storageItem.nutrients[0] || null) : (storageItem.nutrients || null);
    const nutrientAmountDisplay = nutrientGroup && nutrientGroup.amount ? nutrientGroup.amount : undefined;
    const nutrientUnitDisplay = nutrientGroup && nutrientGroup.unit ? nutrientGroup.unit : undefined;

    const unitAbbreviations: Record<string, string> = {
        'milliliter': 'ml',
        'liter': 'l',
        'gramm': 'g',
        'kilogramm': 'kg',
        'stück': 'Stk',
        'päckchen': 'Pck',
        'packung': 'Pck',
        'dose': 'Dose',
        'glas': 'Glas',
        'flasche': 'Fl',
        'beutel': 'Beutel',
        'kartons': 'Kart',
        'mg': 'mg',
        'g': 'g',
        'kg': 'kg',
        'kcal': 'kcal',
        'kj': 'kJ'
    };
    const unitShortFor = (full?: string) => {
        const norm = normalizeKey(full);
        try {
            const key = `units.short.${norm}`;
            if (i18n.exists && i18n.exists(key)) {
                const v = i18n.t(key);
                if (v && typeof v === 'string' && v.trim() !== '') return v;
            }
        } catch { /* ignore */ }
        return unitAbbreviations[norm] || (full || '');
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

            {/* Zutaten + Nährwerte: versuche zuerst das rohe OpenFoodFacts-Objekt `nutriments` zu nutzen, dann Fallback */}
            <div className={css.itemFormCard}>
                <div className={css.itemHeader}>{t('detail.sections.nutrients')}</div>

                {/* Zutaten: aus ingredients ein kommagetrennter Satz, sortiert nach rank */}
                <div className={css.itemFields}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 600 }}>{t('detail.labels.ingredients')}: </label>
                        <span>
                            {Array.isArray(storageItem.ingredients) && storageItem.ingredients.length > 0
                                ? (() => {
                                    // Ingredient shape expected from backend
                                    interface Ingredient {
                                        text?: string;
                                        percent?: number;
                                        rank?: number;
                                    }

                                    const ings = Array.isArray(storageItem.ingredients) ? (storageItem.ingredients.slice() as Ingredient[]) : [];
                                    const L = ings.length;
                                    return ings
                                        .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
                                        .map((ing, idx) => {
                                            const pct = typeof ing.percent === 'number' ? ` (${ing.percent}%)` : '';
                                            const txt = ing.text ?? '';
                                            return `${txt}${pct}${idx < L - 1 ? ', ' : ''}`;
                                        })
                                        .join('');
                                })()
                                : t('detail.labels.ingredientsNotAvailable')}
                        </span>
                    </div>

                    {/* Wenn das rohe nutriments-Objekt vorhanden ist: baue eine produktähnliche Tabelle (100g / Portion) */}
                    {storageItem.nutriments && typeof storageItem.nutriments === 'object' ? (
                        (() => {
                            const n = storageItem.nutriments as Record<string, unknown>;
                            // Eine kleine Auswahl an üblichen Feldern in gewünschter Reihenfolge
                            const rows = [
                                { key: 'energy-kcal', label: 'Energie (kcal)' },
                                { key: 'energy', label: 'Energie (kJ)' },
                                { key: 'fat', label: 'Fett' },
                                { key: 'saturated-fat', label: 'davon: gesättigte Fettsäuren' },
                                { key: 'carbohydrates', label: 'Kohlenhydrate' },
                                { key: 'sugars', label: 'davon: Zucker' },
                                { key: 'proteins', label: 'Eiweiß' },
                                { key: 'fiber', label: 'Ballaststoffe' },
                                { key: 'salt', label: 'Salz' }
                            ];

                            const getVal = (baseKey: string, scope: '100g' | 'serving') => {
                                const suffix = scope === '100g' ? '_100g' : '_serving';
                                const k1 = `${baseKey}${suffix}`;
                                const k2 = `${baseKey}_${scope}`; // fallback (some variants)
                                const raw = n[k1] ?? n[k2] ?? n[`${baseKey}_${scope}`] ?? null;
                                if (raw === null || raw === undefined) return '-';
                                // coerce to string for safe rendering
                                try {
                                    return typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
                                } catch {
                                    return '-';
                                }
                            };

                            // detect if there is any serving value
                            const hasServing = rows.some(r => getVal(r.key, 'serving') !== '-');

                            const headerAmount = (nutrientAmountDisplay !== undefined && nutrientAmountDisplay !== null && nutrientAmountDisplay !== '') ? nutrientAmountDisplay : fq.value;
                            const headerUnit = (nutrientUnitDisplay && String(nutrientUnitDisplay).trim() !== '') ? unitShortFor(String(nutrientUnitDisplay)) : unitShortFor(fq.unit || storageItem.unit);
                            return (
                                <div>
                                    <table className={css.nutritionTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left' }}></th>
                                                <th style={{ textAlign: 'right' }}>{`pro ${headerAmount} ${headerUnit}`}</th>
                                                {hasServing && <th style={{ textAlign: 'right' }}>pro Portion</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((r) => {
                                                const v100 = getVal(r.key, '100g');
                                                const vServ = hasServing ? getVal(r.key, 'serving') : null;
                                                return (
                                                    <tr key={r.key}>
                                                        <td style={{ padding: '6px 8px' }}>{r.label}</td>
                                                        <td style={{ textAlign: 'right', padding: '6px 8px' }}>{v100}</td>
                                                        {hasServing && <td style={{ textAlign: 'right', padding: '6px 8px' }}>{vServ}</td>}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {/* Falls noch raw-objekt spezifische Energie-Einheiten vorhanden sind, zeige kurze Meta-Zeile */}
                                    <div style={{ marginTop: 8, color: '#666' }}>
                                        {n['energy-kcal_unit'] ? `Energie-Einheit: ${String(n['energy-kcal_unit'])}` : ''}
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        // Fallback: simple list view for legacy `nutrients` groups (no card layout)
                        Array.isArray(storageItem.nutrients) && storageItem.nutrients.length > 0 && (() => {
                            const sN = storageItem.nutrients[0];
                            return (
                                <div>
                                    <div className={css.nutrientSectionHeader}>
                                        {`pro ${(nutrientAmountDisplay !== undefined && nutrientAmountDisplay !== null && nutrientAmountDisplay !== '') ? nutrientAmountDisplay : fq.value} ${(nutrientUnitDisplay && String(nutrientUnitDisplay).trim() !== '') ? unitShortFor(String(nutrientUnitDisplay)) : unitShortFor(fq.unit || storageItem.unit)}`}
                                    </div>
                                    {sN.description && (
                                        <div style={{ marginBottom: 12, textAlign: 'center' }}>
                                            {sN.description}
                                        </div>
                                    )}
                                    <div style={{ display: 'grid', gap: 12 }}>
                                        {orderNutrientValues(sN.values).map((nutrientValue, index) => (
                                            <div key={index} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                                                <div style={{ fontWeight: 600 }}>{nutrientValue.name}</div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                                    {nutrientValue.values.map((val, i) => (
                                                        <div key={i} style={{ textAlign: 'right' }}>
                                                            {val.value} {val.typ}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()
                    )}
                </div>
            </div>

            {/* Aktions-Buttons (sticky, wie im Formular) */}
            <div className={css.actionBar}>
                <Button onClick={onGoBack} type="default">{t('detail.buttons.back')}</Button>
                <Button onClick={onGoToEdit} type="primary">{t('detail.buttons.edit')}</Button>
                <Button onClick={onDelete} danger loading={saving}>{t('detail.buttons.delete')}</Button>
            </div>
        </div>
    );
}
