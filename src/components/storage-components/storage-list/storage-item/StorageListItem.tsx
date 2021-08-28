import { MinusCircleOutlined, PlusCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Avatar, Badge, List } from 'antd';
import React, { ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { storageApi } from '../../../../hooks/StorageApi';
import { storedItemIdRoute, storedItemsApi, storedItemsIdApi } from '../../../../shared/Constants';
import { pluralFormFactory } from '../../../../shared/Factories';
import { actionHandler } from '../../../../store/Actions';
import { Action, useStore } from '../../../../store/Store';
import { StorageModel } from '../../StorageModel';

interface Props {
    storageItem: StorageModel
}

export default function StorageListItem(props: Props): ReactElement {
    const storageItem = props.storageItem
    const history = useHistory()
    const { store, dispatch } = useStore()
    const [amount, setAmount] = useState(storageItem.amount)
    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault()
        actionHandler(action, dispatch)
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
    const countItems = (name: string) => {
        return store.shoppingCard.filter(item => item.name === name).length
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

        <List
            size="small"
            bordered
            style={{ width: '100%', border: 'none' }}
            key={`top${storageItem.id}`}
        >
            {storageItem &&
                <>

                    <List.Item
                        actions={
                            [
                                <MinusCircleOutlined style={{ fontSize: '20px' }} onClick={onDecrease} key={`minus${storageItem.id}`} />,

                                <Badge key={`badge${storageItem.id}`} offset={[0, 0]} size="small" count={countItems(storageItem.name)} >
                                    <ShoppingCartOutlined style={{ fontSize: '20px' }} key={`shoppimg${storageItem.id}`} onTouchMove={(e) => onChangeCard(e, { type: 'REMOVE_FROM_CARD', storeageItem: storageItem })} onClick={(e) => onChangeCard(e, { type: 'ADD_TO_CARD', storeageItem: storageItem })} />
                                </Badge>,
                                <PlusCircleOutlined style={{ fontSize: '20px' }} onClick={onIncrease} key={`plus${storageItem.id}`} />
                            ]
                        }
                    >

                        <List.Item.Meta
                            avatar={<Avatar src={storageItem.icon} />}
                            title={<Link to={() => storedItemIdRoute(storageItem.id)}>{storageItem.name}</Link>}
                            description={getAvailable()}
                            key={`meta${storageItem.id}`}
                        />

                    </List.Item>
                </>
            }
        </List>

    )
}
