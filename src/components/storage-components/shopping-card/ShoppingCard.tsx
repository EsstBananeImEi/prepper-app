import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Badge, Card, Space } from 'antd'
import Meta from 'antd/lib/card/Meta'
import React, { ReactElement, SyntheticEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDemensions } from '../../../hooks/StorageApi'
import { itemIdRoute } from '../../../shared/Constants'
import { Action, useStore } from '../../../store/Store'
import { Dimension } from '../../../types/Types'
import { BasketModel, StorageModel } from '../StorageModel'
import { actionHandler } from '../../../store/Actions'
import SafeAvatar from '../../common/SafeAvatar'

interface Props {
    storedItems: BasketModel[]
    dimensions: Dimension
}

export default function ShoppingCard(props: Props): ReactElement {
    const { store, dispatch } = useStore()
    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault()
        actionHandler(action, dispatch)
    }

    const dimensions = props.dimensions
    const [descWidth, setDescWidth] = useState(900)
    const trimText = (text: string) => {
        const maxTextChars = (descWidth / 8) - 3
        const cuttedText = text.length > maxTextChars ? text.substring(0, (maxTextChars)) + '...' : text
        return cuttedText
    }

    useEffect(() => {
        if (document.getElementsByClassName('ant-list-item-meta-description').length > 0) {
            setDescWidth(((document.querySelector(".ant-list-item-meta-description") as HTMLElement).offsetWidth))
        } else if (document.getElementsByClassName('ant-card-meta-description').length > 0) {
            setDescWidth(((document.querySelector(".ant-card-meta-description") as HTMLElement).offsetWidth))

        }
    }, [dimensions])

    // Count by name to be robust if basket IDs ever get out of sync
    const countItemsByName = (name: string) => {
        return store.shoppingCard
            .filter(storageItem => storageItem.name === name)
            .reduce((acc, item) => acc + parseInt(item.amount), 0)
    }
    const onDecreaseAmount = (event: SyntheticEvent, basketItems: BasketModel) => {
        const action: Action = {
            type: 'DECREASE_AMOUNT', basketItems:
            {
                ...basketItems,
                amount: String(Number(basketItems.amount) - 1)
            }
        }
        actionHandler(action, dispatch)
    }

    const onIncreaseAmount = (event: SyntheticEvent, basketItems: BasketModel) => {
        const action: Action = {
            type: 'INCREASE_AMOUNT', basketItems:
            {
                ...basketItems,
                amount: String(Number(basketItems.amount) + 1)
            }
        }
        actionHandler(action, dispatch)
    }
    return (<>

        {props.storedItems.map(storeageItem =>
            <div style={{ padding: '5px' }} key={storeageItem.id} className="space-align-block">
                <Space >
                    <Badge count={countItemsByName(storeageItem.name)} offset={[-20, 20]} style={{ backgroundColor: '#52c41a' }}>

                        <Card
                            style={{ width: 300, minHeight: '145px' }}
                            actions={
                                [
                                    <MinusCircleOutlined onClick={(e) => onDecreaseAmount(e, storeageItem)} key='minus' />,
                                    <DeleteOutlined onClick={(e) => onChangeCard(e, { type: 'CLEAR_ITEM_CARD', basketItems: storeageItem })} disabled key="shopping" />,
                                    <PlusCircleOutlined onClick={(e) => onIncreaseAmount(e, storeageItem)} key="plus" />
                                ]}
                        >
                            {/** Resolve the current storage item id by name to avoid wrong detail navigation if basket IDs drift */}
                            <Link to={itemIdRoute(
                                (store.storeItems.find(i => i.name === storeageItem.name)?.id) ?? storeageItem.id
                            )}>
                                <Meta
                                    avatar={<SafeAvatar src={storeageItem.icon} showWarnings={process.env.NODE_ENV === 'development'} />}
                                    title={storeageItem.name}
                                    description={(storeageItem.categories && trimText(storeageItem.categories.join(', '))) || <div style={{ minHeight: '22px' }} />}
                                />
                                {!storeageItem.categories && <span style={{ height: '1020px' }} />}
                            </Link>
                        </Card>
                    </Badge>
                </Space>
            </div>
        )

        }


    </>
    )
}
