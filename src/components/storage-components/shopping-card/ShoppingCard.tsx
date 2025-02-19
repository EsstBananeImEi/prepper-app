import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Avatar, Badge, Card, Space } from 'antd'
import Meta from 'antd/lib/card/Meta'
import React, { ReactElement, SyntheticEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDemensions } from '../../../hooks/StorageApi'
import { itemIdRoute } from '../../../shared/Constants'
import { Action, useStore } from '../../../store/Store'
import { Dimension } from '../../../types/Types'
import { BasketModel, StorageModel } from '../StorageModel'
import { actionHandler } from '../../../store/Actions'

interface Props {
    storedItems: BasketModel[]
    dimensions: Dimension
    pagination: { minValue: number, maxValue: number }
}

export default function ShoppingCard(props: Props): ReactElement {
    const { store, dispatch } = useStore()
    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault()
        actionHandler(action, dispatch)
    }

    const dimensions = props.dimensions
    const [descWidth, setDescWidth] = useState(900)
    const { minValue, maxValue } = props.pagination
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

    const countItems = (id: number) => {
        return store.shoppingCard.filter(storageItem => storageItem.id === id).reduce((acc, item) => acc + parseInt(item.amount), 0)
    }
    const onDecreaseAmount = (event: SyntheticEvent, storeageItem: BasketModel) => {
        const action: Action = {
            type: 'DECREASE_AMOUNT', storeageItem:
            {
                ...storeageItem,
                amount: String(Number(storeageItem.amount) - 1)
            }
        }
        actionHandler(action, dispatch)
    }

    const onIncreaseAmount = (event: SyntheticEvent, storeageItem: BasketModel) => {
        const action: Action = {
            type: 'INCREASE_AMOUNT', storeageItem:
            {
                ...storeageItem,
                amount: String(Number(storeageItem.amount) + 1)
            }
        }
        actionHandler(action, dispatch)
    }
    return (<>

        {props.storedItems.slice(minValue, maxValue).map(storeageItem =>
            <div style={{ padding: '5px' }} key={storeageItem.id} className="space-align-block">
                <Space >
                    <Badge count={countItems(storeageItem.id)} offset={[-20, 20]} style={{ backgroundColor: '#52c41a' }}>

                        <Card
                            style={{ width: 300 }}
                            actions={
                                [
                                    <MinusCircleOutlined onClick={(e) => onDecreaseAmount(e, storeageItem)} key='minus' />,
                                    <DeleteOutlined onClick={(e) => onChangeCard(e, { type: 'CLEAR_ITEM_CARD', storeageItem: storeageItem })} disabled key="shopping" />,
                                    <PlusCircleOutlined onClick={(e) => onIncreaseAmount(e, storeageItem)} key="plus" />
                                ]}
                        >
                            <Link to={itemIdRoute(storeageItem.id)}>
                                <Meta
                                    avatar={<Avatar src={storeageItem.icon || '/default.png'} />}
                                    title={storeageItem.name}
                                    description={storeageItem.categories && trimText(storeageItem.categories.join(', '))}

                                />
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
