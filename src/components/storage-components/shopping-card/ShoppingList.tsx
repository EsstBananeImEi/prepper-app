import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Avatar, Badge, Divider, List } from 'antd';
import React, { ReactElement, SyntheticEvent, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { itemIdRoute } from '../../../shared/Constants';
import { Action, useStore } from '../../../store/Store';
import { Dimension } from '../../../types/Types';
import { BasketModel } from '../StorageModel';
import { actionHandler } from '../../../store/Actions';
import styles from '../storage-list/storage-item/StorageListItem.module.css';
import listStyles from './ShoppingList.module.css';

interface Props {
    storedItems: BasketModel[];
    dimensions: Dimension;
    groupByCategory?: boolean;
}

export default function ShoppingList(props: Props): ReactElement {
    const { store, dispatch } = useStore();
    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        console.log('onChangeCard', action);
        actionHandler(action, dispatch);
    };
    const dimensions = props.dimensions;
    const [descWidth, setDescWidth] = useState(900);

    const trimText = (text: string) => {
        const maxTextChars = descWidth / 7 - 3;
        return text.length > maxTextChars ? text.substring(0, maxTextChars) + '...' : text;
    };

    useEffect(() => {
        if (document.getElementsByClassName('ant-list-item-meta-description').length > 0) {
            setDescWidth(
                (document.querySelector('.ant-list-item-meta-description') as HTMLElement).offsetWidth
            );
        } else if (document.getElementsByClassName('ant-card-meta-description').length > 0) {
            setDescWidth(
                (document.querySelector('.ant-card-meta-description') as HTMLElement).offsetWidth
            );
        }
    }, [dimensions]);

    const countItems = (name: string) => {
        return store.shoppingCard
            .filter(item => item.name === name)
            .reduce((acc, item) => parseInt(item.amount), 0);
    };

    const onDecreaseAmount = (event: SyntheticEvent, basketItem: BasketModel) => {
        const action: Action = {
            type: 'DECREASE_AMOUNT',
            basketItems: { ...basketItem, amount: String(Number(basketItem.amount) - 1) }
        };
        actionHandler(action, dispatch);
    };

    const onIncreaseAmount = (event: SyntheticEvent, basketItem: BasketModel) => {
        const action: Action = {
            type: 'INCREASE_AMOUNT',
            basketItems: { ...basketItem, amount: String(Number(basketItem.amount) + 1) }
        };
        actionHandler(action, dispatch);
    };

    // useMemo immer unconditionally aufrufen
    const groupedItems = useMemo(() => {
        if (props.groupByCategory) {
            const groups = new Map<string, BasketModel[]>();
            props.storedItems.forEach(item => {
                const category =
                    item.categories && item.categories.length > 0 ? item.categories[0] : 'Ohne Kategorie';
                if (!groups.has(category)) {
                    groups.set(category, []);
                }
                groups.get(category)!.push(item);
            });
            return Array.from(groups.entries());
        }
        return null;
    }, [props.storedItems, props.groupByCategory]);

    if (props.groupByCategory && groupedItems) {
        return (
            <>
                {groupedItems.map(([category, items]) => (
                    <React.Fragment key={category}>
                        <Divider orientation="left">{category}</Divider>
                        {items.map((listItem, index) => (
                            <div key={`div-${listItem.id}`} style={{ width: '100%' }}>
                                <List.Item
                                    key={listItem.id}
                                    className={listStyles.devider}
                                    actions={[
                                        <MinusCircleOutlined
                                            className={styles.iconAction}
                                            onClick={e => onDecreaseAmount(e, listItem)}
                                            key="minus"
                                        />,
                                        <DeleteOutlined
                                            className={styles.iconAction}
                                            onClick={e =>
                                                onChangeCard(e, { type: 'CLEAR_ITEM_CARD', basketItems: listItem })
                                            }
                                            key="delete"
                                        />,
                                        <PlusCircleOutlined
                                            className={styles.iconAction}
                                            onClick={e => onIncreaseAmount(e, listItem)}
                                            key="plus"
                                        />
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={listItem.icon || '/default.png'} />}
                                        title={
                                            <div className={styles.metaTitleContainer}>
                                                <span>{listItem.name}</span>
                                            </div>
                                        }

                                        key={`meta${listItem.id}`}
                                    />
                                    <Badge
                                        size="default"
                                        count={countItems(listItem.name)}
                                        offset={[0, 0]}
                                        style={{ backgroundColor: '#52c41a' }}
                                    />
                                </List.Item>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </>
        );
    }

    // Standardanzeige ohne Gruppierung
    return (
        <>
            {props.storedItems.map((listItem, index) => (
                <div key={`div-${listItem.id}`} style={{ width: '100%' }}>
                    <Divider />
                    <List.Item
                        key={index}
                        className={styles.title}
                        actions={[
                            <MinusCircleOutlined
                                className={styles.iconAction}
                                onClick={e => onDecreaseAmount(e, listItem)}
                                key="minus"
                            />,
                            <DeleteOutlined
                                className={styles.iconAction}
                                onClick={e =>
                                    onChangeCard(e, { type: 'CLEAR_ITEM_CARD', basketItems: listItem })
                                }
                                key="delete"
                            />,
                            <PlusCircleOutlined
                                className={styles.iconAction}
                                onClick={e => onIncreaseAmount(e, listItem)}
                                key="plus"
                            />
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={listItem.icon || '/default.png'} />}
                            title={
                                <div className={styles.metaTitleContainer}>
                                    <span>{listItem.name}</span>
                                </div>
                            }
                            description={
                                listItem.categories && trimText(listItem.categories.join(', '))
                            }
                            key={`meta${listItem.id}`}
                        />
                        <Badge
                            size="default"
                            count={countItems(listItem.name)}
                            offset={[0, 0]}
                            style={{ backgroundColor: '#52c41a' }}
                        />
                    </List.Item>
                    {index + 1 === props.storedItems.length && <Divider />}
                </div>
            ))}
        </>
    );
}
