import { MinusCircleOutlined, PlusCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Card, Badge } from 'antd';
import React, { ReactElement, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { storageApi } from '../../../../hooks/StorageApi';
import { itemIdRoute, itemIdApi } from '../../../../shared/Constants';
import { pluralFormFactory } from '../../../../shared/Factories';
import { useTranslation } from 'react-i18next';
import { Action, useStore } from '../../../../store/Store';
import { StorageModel } from '../../StorageModel';
import { actionHandler } from '../../../../store/Actions';
import SafeAvatar from '../../../common/SafeAvatar';
import listStyles from '../StorageList.module.css';

interface Props {
    storageItem: StorageModel;
}

export default function StorageDesktopCardItem({ storageItem }: Props): ReactElement {
    const { t } = useTranslation();
    const { store, dispatch } = useStore();
    const [amount, setAmount] = useState(storageItem.amount);
    const [basketAmount, setBasketAmount] = useState(store.shoppingCard.find(item => item.name === storageItem.name)?.amount || 0);
    const isInitialMount = useRef(true);
    const prevId = useRef(storageItem.id);

    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault();
        actionHandler(action, dispatch);
    };

    const getAvailable = () => {
        const color: React.CSSProperties = { color: 'red' };
        if (amount > storageItem.midAmount) color.color = 'green';
        else if (amount <= storageItem.midAmount && amount > storageItem.lowestAmount) color.color = 'orange';
        return (
            <span className={listStyles.desktopInventory} style={color}>
                {t('storage.stock')}: {amount} {pluralFormFactory(storageItem.unit, amount)}
            </span>
        );
    };

    const onIncrease = (e: React.FormEvent) => { e.preventDefault(); setAmount(a => a + 1); };
    const onDecrease = (e: React.FormEvent) => { e.preventDefault(); setAmount(a => Math.max(0, a - 1)); };

    const getBasketModel = (it: StorageModel) => ({ id: it.id, name: it.name, amount: '0', categories: it.categories || [], icon: it.icon || '' });
    const onAddToBasket = (e: React.FormEvent) => {
        e.stopPropagation();
        onChangeCard(e, { type: 'ADD_TO_CARD', basketItems: getBasketModel(storageItem) });
        setBasketAmount(prev => (parseInt(String(prev)) + 1));
    };

    useEffect(() => {
        if (prevId.current !== storageItem.id) {
            setAmount(storageItem.amount);
            prevId.current = storageItem.id;
            isInitialMount.current = true;
        }
    }, [storageItem.id, storageItem.amount]);

    useEffect(() => {
        if (isInitialMount.current) { isInitialMount.current = false; return; }
        if (amount !== storageItem.amount) {
            if (amount === 0 && storageItem.amount === 0) return;
            const safeAmount = Math.max(0, amount);
            storageApi('PUT', itemIdApi(storageItem.id), () => { }, { ...storageItem, amount: safeAmount });
        }
    }, [amount]);

    return (
        <Card className={listStyles.desktopCard}
            actions={[
                <MinusCircleOutlined onClick={onDecrease} key="minus" />,
                <Badge key={`shopping${storageItem.id}`} size="default" count={basketAmount} offset={[0, 0]} style={{ backgroundColor: '#52c41a' }}>
                    <ShoppingCartOutlined style={{ fontSize: '22px', cursor: 'pointer' }} key={`shopping${storageItem.id}`}
                        onClick={(e) => { e.stopPropagation(); onAddToBasket(e); }} />
                </Badge>,
                <PlusCircleOutlined onClick={onIncrease} key="plus" />
            ]}
        >
            <Link to={itemIdRoute(storageItem.id)}>
                <div className={listStyles.desktopContent}>
                    <div className={listStyles.desktopHeader}>
                        <SafeAvatar className={listStyles.desktopImage} src={storageItem.icon} showWarnings={process.env.NODE_ENV === 'development'} />
                    </div>
                    <div className={listStyles.desktopTitle} title={storageItem.name}>{storageItem.name}</div>
                    <div className={listStyles.desktopInventoryRow}>{getAvailable()}</div>
                </div>
            </Link>
        </Card>
    );
}
