import React, { ReactElement, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { MinusCircleOutlined, PlusCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Avatar, Badge, List, Spin } from 'antd';
import { useHistory } from 'react-router-dom';
import { storageApi } from '../../../../hooks/StorageApi';
import { itemIdRoute, itemsApi, itemIdApi } from '../../../../shared/Constants';
import { pluralFormFactory } from '../../../../shared/Factories';
import { actionHandler } from '../../../../store/Actions';
import { Action, useStore } from '../../../../store/Store';
import { StorageModel } from '../../StorageModel';
// Icons aus react-icons importieren
import { BiSolidFridge } from 'react-icons/bi';
import { BsBookshelf } from 'react-icons/bs';

interface Props {
    storageItem: StorageModel;
}

export default function StorageListItem(props: Props): ReactElement {
    const storageItem = props.storageItem;
    const history = useHistory();
    const { store, dispatch } = useStore();
    const [amount, setAmount] = useState(storageItem.amount);

    // Ref für initialen Render, um PUT-Request zu vermeiden
    const isInitialRender = useRef(true);

    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault();
        // Aktionen (z. B. Hinzufügen/Entfernen) behandeln
        actionHandler(action, dispatch);
    };

    const getAvailable = () => {
        const color = { color: 'red' };
        if (amount > storageItem.midAmount) {
            color['color'] = 'green';
        } else if (amount <= storageItem.midAmount && amount > storageItem.lowestAmount) {
            color['color'] = 'orange';
        }
        return (
            <span style={color}>
                Inventory: {amount} {pluralFormFactory(storageItem.unit, amount)}
            </span>
        );
    };

    // Mapping-Funktion für die Storage-Location
    const getLocationIcon = (location: string) => {
        const loc = location.toLowerCase();
        if (loc.includes('kühler')) {
            // Beispiel: Wenn "kühler" enthalten ist, zeige ein Schneeflocken-Emoji
            return (
                <span
                    title="Tiefkühler"
                    style={{ marginLeft: '8px', fontSize: '20px' }}
                >
                    ❄️
                </span>
            );
        } else if (loc.includes('kühlschrank') || loc.includes('fach')) {
            return (
                <span
                    title="Kühlschrank"
                    style={{ marginLeft: '8px', fontSize: '20px' }}
                >
                    <BiSolidFridge style={{ fontSize: '20px', color: '#1890ff' }} title="Kühlschrank" />
                </span>
            );
        } else if (loc.includes('lager') || loc.includes('keller') || loc.includes('speisekammer')) {
            return (
                <span
                    title="Lager"
                    style={{ marginLeft: '8px', fontSize: '20px' }}
                >
                    <BsBookshelf style={{ fontSize: '20px', color: '#1890ff' }} title="Lager" />
                </span>
            );
        }
        return null;
    };

    const onIncrease = (e: React.FormEvent) => {
        e.preventDefault();
        setAmount(currentAmount => currentAmount + 1);
    };

    const onDecrease = (e: React.FormEvent) => {
        e.preventDefault();
        setAmount(currentAmount => (currentAmount > 0 ? currentAmount - 1 : currentAmount));
    };

    const getBasketModel = (storeageItem: StorageModel) => {
        return {
            id: storeageItem.id,
            name: storeageItem.name,
            amount: "0",
            categories: storeageItem.categories || [],
            icon: storeageItem.icon || ""
        };
    }


    // PUT-Aufruf: Wird nur ausgeführt, wenn es nicht der initiale Render ist
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const onGoToList = () => history.push(itemsApi);
        storageApi('PUT', itemIdApi(storageItem.id), onGoToList, { ...storageItem, amount: amount });
    }, [amount, history, storageItem]);

    // Wenn das Item noch nicht verfügbar ist, zeige einen Spinner
    if (!storageItem) {
        return <Spin />;
    }

    const countItems = (name: string) => {
        return store.shoppingCard.filter(item => item.name === name).length
    }

    return (
        // Das gesamte List.Item reagiert auf den Klick, um zur Detailseite zu navigieren
        <List.Item
            onClick={() => history.push(itemIdRoute(storageItem.id))}
            style={{ cursor: 'pointer' }}
            actions={[
                // Bei den Aktions-Buttons wird event.stopPropagation() aufgerufen,
                // damit der Klick nicht an den übergeordneten List.Item weitergegeben wird.
                <MinusCircleOutlined
                    style={{ fontSize: '30px' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDecrease(e);
                    }}
                    key={`minus${storageItem.id}`}
                />,
                <ShoppingCartOutlined
                    style={{ fontSize: '30px', cursor: 'pointer' }}
                    key={`shopping${storageItem.id}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onChangeCard(e, { type: 'ADD_TO_CARD', storeageItem: getBasketModel(storageItem) });
                    }}
                />,
                <PlusCircleOutlined
                    style={{ fontSize: '30px' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onIncrease(e);
                    }}
                    key={`plus${storageItem.id}`}
                />
            ]}
        >
            <List.Item.Meta
                avatar={<Avatar src={storageItem.icon} />}
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>{storageItem.name}</span>
                        {getLocationIcon(storageItem.storageLocation) || ""}
                    </div>
                }
                description={getAvailable()}
                key={`meta${storageItem.id}`}
            />
        </List.Item>
    );
}
