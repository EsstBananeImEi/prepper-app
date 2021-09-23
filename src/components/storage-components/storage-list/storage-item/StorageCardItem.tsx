import { MinusCircleOutlined, PlusCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Avatar, Badge, Card } from 'antd';
import React, { ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { storageApi } from '../../../../hooks/StorageApi';
import { storedItemIdRoute, storedItemsApi, storedItemsIdApi } from '../../../../shared/Constants';
import { pluralFormFactory } from '../../../../shared/Factories';
import { Action, useStore } from '../../../../store/Store';
import { StorageModel } from '../../StorageModel';

interface Props {
    storageItem: StorageModel
}

export default function StorageCardItem(props: Props): ReactElement {
    const storageItem = props.storageItem
    const { Meta } = Card;
    const history = useHistory()
    const { store, dispatch } = useStore()
    const [amount, setAmount] = useState(storageItem.amount)
    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault()
        dispatch(action)
    }

    const getAvailable = () => {
        const color = { color: 'red' };

        if (amount > storageItem.midAmount) {
            color['color'] = 'green'
        }
        else if (amount <= storageItem.midAmount && amount > storageItem.lowestAmount) {
            color['color'] = 'orange'
        }

        return <span style={color}>Inventory: {amount} {pluralFormFactory(storageItem.unit, amount)}</span>

    }
    const countItems = (id: number) => {
        return store.shoppingCard.filter(item => item.id === id).length
    }

    const onIncrease = (e: React.FormEvent) => {
        e.preventDefault()
        setAmount(currentAmount => currentAmount + 1)
    }
    const onDecrease = (e: React.FormEvent) => {
        e.preventDefault()
        setAmount(currentAmount => currentAmount > 0 ? currentAmount - 1 : currentAmount)

    }

    useEffect(() => {
        const onGoToList = () => history.push(storedItemsApi)
        storageApi('PUT', storedItemsIdApi(storageItem.id), onGoToList, { ...storageItem, amount: amount })
    }, [amount, history, storageItem])


    return (

        <Card
            style={{ width: 300 }}
            actions={
                [
                    <MinusCircleOutlined onClick={onDecrease} key='minus' />,
                    // <Badge key='shopping' offset={[5, 0]} size="small" count={countItems(storageItem.id)}>
                    //     <ShoppingCartOutlined disabled key="shopping" onClick={(e) => onChangeCard(e, { type: 'ADD_TO_CARD', storeageItem: storageItem })} />
                    // </Badge>,
                    <PlusCircleOutlined onClick={onIncrease} key="plus" />
                ]}
        >
            <Link to={() => storedItemIdRoute(storageItem.id)}>
                <Meta
                    avatar={<Avatar src={storageItem.icon} />}
                    title={storageItem.name}
                    description={getAvailable()}
                />
            </Link>
        </Card>
    )
}
