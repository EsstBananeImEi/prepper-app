import { MinusCircleOutlined, PlusCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Avatar, Card } from 'antd';
import { BiSolidFridge } from 'react-icons/bi';
import { BsBookshelf } from 'react-icons/bs';
import React, { ReactElement, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageApi } from '../../../../hooks/StorageApi';
import { itemIdRoute, itemsApi, itemIdApi } from '../../../../shared/Constants';
import { pluralFormFactory } from '../../../../shared/Factories';
import { Action, useStore } from '../../../../store/Store';
import { StorageModel } from '../../StorageModel';
import { actionHandler } from '../../../../store/Actions';

interface Props {
    storageItem: StorageModel;
}

export default function StorageCardItem(props: Props): ReactElement {
    const storageItem = props.storageItem;
    const { Meta } = Card;
    const history = useNavigate();
    const { store, dispatch } = useStore();
    const [amount, setAmount] = useState(storageItem.amount);

    // Ref, um zu tracken, ob es der initiale Render ist
    const isInitialRender = useRef(true);

    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault();
        actionHandler(action, dispatch); // Deine Aktion, falls benötigt
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
            return <span title="Tiefkühler" style={{ marginLeft: '8px', fontSize: '20px' }}>❄️</span>;
        } else if (loc.includes('kühlschrank') || loc.includes('fach')) {
            return <span title="Kühlschrank" style={{ marginLeft: '8px', fontSize: '20px' }}><BiSolidFridge style={{ fontSize: '20px', color: '#1890ff' }} title="Kühlschrank" />
            </span>;
        } else if (loc.includes('lager') || loc.includes('keller') || loc.includes('speisekammer')) {
            return <span title="Tiefkühler" style={{ marginLeft: '8px', fontSize: '20px' }}><BsBookshelf style={{ fontSize: '20px', color: '#1890ff' }} title="Lager" /></span>
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

    useEffect(() => {
        if (isInitialRender.current) {
            // Beim allerersten Render überspringen und den Ref aktualisieren
            isInitialRender.current = false;
            return;
        }
        // Dieser PUT-Request wird nur ausgeführt, wenn sich der Wert von 'amount' ändert, NICHT beim initialen Rendern.
        const onGoToList = () => history(itemsApi);
        storageApi('PUT', itemIdApi(storageItem.id), onGoToList, { ...storageItem, amount: amount });
    }, [amount, history, storageItem]);

    return (
        <Card
            style={{ width: 300 }}
            actions={[
                <MinusCircleOutlined onClick={onDecrease} key="minus" />,
                <ShoppingCartOutlined
                    style={{ fontSize: '30px', cursor: 'pointer' }}
                    key={`shopping${storageItem.id}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onChangeCard(e, { type: 'ADD_TO_CARD', basketItems: getBasketModel(storageItem) });
                    }}
                />,

                <PlusCircleOutlined onClick={onIncrease} key="plus" />
            ]}
        >
            <Link to={itemIdRoute(storageItem.id)}>
                <Meta
                    avatar={<Avatar src={storageItem.icon || '/default.png'} />}
                    title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>{storageItem.name}</span>
                            {getLocationIcon(storageItem.storageLocation) || ""}

                        </div>
                    }
                    description={getAvailable()}
                />
            </Link>
        </Card>
    );
}
