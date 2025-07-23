import { MinusCircleOutlined, PlusCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Card, Badge } from 'antd';
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
import SafeAvatar from '../../../common/SafeAvatar';

interface Props {
    storageItem: StorageModel;
}

export default function StorageCardItem(props: Props): ReactElement {
    const storageItem = props.storageItem;
    const { Meta } = Card;
    const history = useNavigate();
    const { store, dispatch } = useStore();
    const [amount, setAmount] = useState(storageItem.amount);
    const [basketAmount, setBasketAmount] = useState(store.shoppingCard.find(item => item.name === storageItem.name)?.amount || 0);

    // Track initial mount and prop changes separately  
    const isInitialMount = useRef(true);
    const previousStorageItemId = useRef(storageItem.id);

    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault();
        actionHandler(action, dispatch); // Deine Aktion, falls benötigt
        setBasketAmount(prevAmount => parseInt(prevAmount.toString()) + 1)
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

    const onAddToBasket = (e: React.FormEvent) => {
        e.stopPropagation();
        onChangeCard(e, { type: 'ADD_TO_CARD', basketItems: getBasketModel(storageItem) });
        setAmount(prevAmount => parseInt(prevAmount.toString()) + 1);
    };

    // Sync amount state when storageItem changes (e.g., in lists)
    useEffect(() => {
        if (previousStorageItemId.current !== storageItem.id) {
            // Different storage item - update amount without triggering API call
            setAmount(storageItem.amount);
            previousStorageItemId.current = storageItem.id;
            isInitialMount.current = true; // Reset for new item
        }
    }, [storageItem.id, storageItem.amount]);

    useEffect(() => {
        // Skip API call on initial mount or when switching between different storage items
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Only make API call when amount actually changes due to user interaction
        if (amount !== storageItem.amount) {
            console.log(`🔧 StorageCardItem: Amount changed for item ${storageItem.id} from ${storageItem.amount} to ${amount}, updating via API`);
            const onGoToList = () => {
                console.log(`📍 StorageCardItem: API update complete, but NOT navigating to avoid unwanted redirects`);
                // Remove automatic navigation - this was causing unwanted redirects
                // history(itemsApi);
            };
            storageApi('PUT', itemIdApi(storageItem.id), onGoToList, { ...storageItem, amount: amount });
        }
    }, [amount]); // Only depend on amount

    return (
        <Card
            style={{ width: 300 }}
            actions={[
                <MinusCircleOutlined onClick={onDecrease} key="minus" />,
                <Badge
                    key={`shopping${storageItem.id}`}
                    size="default"
                    count={basketAmount}
                    offset={[0, 0]}
                    style={{ backgroundColor: '#52c41a' }}
                >
                    <ShoppingCartOutlined
                        style={{ fontSize: '30px', cursor: 'pointer' }}
                        key={`shopping${storageItem.id}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToBasket(e);
                        }}
                    />
                </Badge>,

                <PlusCircleOutlined onClick={onIncrease} key="plus" />
            ]}
        >
            <Link to={itemIdRoute(storageItem.id)}>
                <Meta
                    avatar={<SafeAvatar src={storageItem.icon} showWarnings={process.env.NODE_ENV === 'development'} />}
                    title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>{storageItem.name}</span>
                            <span>{getLocationIcon(storageItem.storageLocation) || ""}</span>

                        </div>
                    }
                    description={getAvailable()}
                />
            </Link>
        </Card>
    );
}
