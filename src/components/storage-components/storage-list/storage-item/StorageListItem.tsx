import React, { ReactElement, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { MinusCircleOutlined, PlusCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Avatar, Badge, List, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { storageApi } from '../../../../hooks/StorageApi';
import { itemIdRoute, itemsApi, itemIdApi } from '../../../../shared/Constants';
import { pluralFormFactory } from '../../../../shared/Factories';
import { actionHandler } from '../../../../store/Actions';
import { Action, useStore } from '../../../../store/Store';
import { StorageModel } from '../../StorageModel';
// Icons aus react-icons importieren
import { BiSolidFridge } from 'react-icons/bi';
import { BsBookshelf } from 'react-icons/bs';
import styles from './StorageListItem.module.css';

interface Props {
    storageItem: StorageModel;
}

export default function StorageListItem(props: Props): ReactElement {
    const storageItem = props.storageItem;

    const history = useNavigate();
    const { store, dispatch } = useStore();
    const [amount, setAmount] = useState(storageItem.amount);

    // Ref für initialen Render, um PUT-Request zu vermeiden
    const isInitialRender = useRef(true);
    // Speichere den ursprünglichen Wert von amount
    const initialAmountRef = useRef(storageItem.amount);

    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault();
        actionHandler(action, dispatch);
    };

    const getAvailable = () => {
        let colorClass = styles.lowAmount;
        if (amount > storageItem.midAmount) {
            colorClass = styles.highAmount;
        } else if (amount <= storageItem.midAmount && amount > storageItem.lowestAmount) {
            colorClass = styles.midAmount;
        }
        return (
            <>
                <span>Bestand: </span>
                <span className={colorClass}>
                    {amount} {pluralFormFactory(storageItem.unit, amount)}
                </span>
            </>
        );
    };

    // Mapping-Funktion für die Storage-Location
    const getLocationIcon = (location: string) => {
        const loc = location.toLowerCase();
        if (loc.includes('kühlregal')) {
            return (
                <span title="Tiefkühler" className={styles.icon}>
                    ❄️
                </span>
            );
        } else if (loc.includes('kühlschrank') || loc.includes('fach')) {
            return (
                <span title="Kühlschrank" className={styles.icon}>
                    <BiSolidFridge className={styles.iconFridge} title="Kühlschrank" />
                </span>
            );
        } else if (loc.includes('lager') || loc.includes('keller') || loc.includes('speisekammer')) {
            return (
                <span title="Lager" className={styles.icon}>
                    <BsBookshelf className={styles.iconShelf} title="Lager" />
                </span>
            );
        }
        return null;
    };

    const onIncrease = (e: React.FormEvent) => {
        e.preventDefault();
        setAmount((currentAmount) => currentAmount + 1);
    };

    const onDecrease = (e: React.FormEvent) => {
        e.preventDefault();
        setAmount((currentAmount) => (currentAmount > 0 ? currentAmount - 1 : currentAmount));
    };

    const getBasketModel = (item: StorageModel) => {
        return {
            id: item.id,
            name: item.name,
            amount: "0",
            categories: item.categories || [],
            icon: item.icon || ""
        };
    };

    // useEffect für PUT-Request: Wird nur ausgeführt, wenn sich der amount-Wert ändert
    useEffect(() => {
        // Beim initialen Render nicht ausführen
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        // PUT-Request nur ausführen, wenn amount vom ursprünglichen Wert abweicht
        if (amount === initialAmountRef.current) return;

        const onGoToList = () => history(itemsApi);
        storageApi('PUT', itemIdApi(storageItem.id), onGoToList, { ...storageItem, amount });
    }, [amount, history, storageItem.id]);

    if (!storageItem) {
        return <Spin />;
    }

    const countItems = (name: string) => {
        return store.shoppingCard.filter(storageItem => storageItem.name === name).reduce((acc, item) => parseInt(item.amount), 0)
    }


    return (
        <List.Item
            onClick={() => history(itemIdRoute(storageItem.id))}
            className={`${styles.title}`}
            actions={[
                <MinusCircleOutlined
                    className={styles.iconAction}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDecrease(e);
                    }}
                    key={`minus${storageItem.id}`}
                />,
                <Badge key={`shopping${storageItem.id}`} size="default" count={countItems(storageItem.name)} offset={[0, 0]} style={{ backgroundColor: '#52c41a' }}>
                    <ShoppingCartOutlined
                        className={styles.iconAction}
                        onClick={(e) => {
                            e.stopPropagation();
                            onChangeCard(e, { type: 'ADD_TO_CARD', storeageItem: getBasketModel(storageItem) });
                        }}
                    />
                </Badge>,
                <PlusCircleOutlined
                    className={styles.iconAction}
                    onClick={(e) => {
                        e.stopPropagation();
                        onIncrease(e);
                    }}
                    key={`plus${storageItem.id}`}
                />
            ]}
        >
            <List.Item.Meta
                avatar={<Avatar src={storageItem.icon || '/default.png'} />}
                title={
                    <div
                        className={styles.metaTitleContainer}
                    >
                        <span>{storageItem.name}</span>
                        <span>{getLocationIcon(storageItem.storageLocation)}</span>
                    </div>
                }
                description={getAvailable()}
                key={`meta${storageItem.id}`}
            />
        </List.Item>
    );
}
