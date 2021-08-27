import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Avatar, Badge, Card, Space } from 'antd'
import Meta from 'antd/lib/card/Meta'
import React, { ReactElement, SyntheticEvent, useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useDemensions } from '../../../hooks/StorageApi'
import { storedItemIdRoute } from '../../../shared/Constants'
import { Action, useStore } from '../../../store/Store'
import { Dimension } from '../../../types/Types'
import { StorageModel } from '../StorageModel'

interface Props {
    storedItems: StorageModel[]
    dimensions: Dimension
    pagination: { minValue: number, maxValue: number }
}

export default function ShoppingCard(props: Props): ReactElement {
    const { store, dispatch } = useStore()
    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault()
        dispatch(action)
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
        return store.shoppingCard.filter(storageItem => storageItem.id === id).length
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
                                    <MinusCircleOutlined onClick={(e) => onChangeCard(e, { type: 'REMOVE_FROM_CARD', storeageItem: storeageItem })} key='minus' />,
                                    <DeleteOutlined onClick={(e) => onChangeCard(e, { type: 'CLEAR_ITEM_CARD', storeageItem: storeageItem })} disabled key="shopping" />,
                                    <PlusCircleOutlined onClick={(e) => onChangeCard(e, { type: 'ADD_TO_CARD', storeageItem: storeageItem })} key="plus" />
                                ]}
                        >
                            <Link to={() => storedItemIdRoute(storeageItem.id)}>
                                <Meta
                                    avatar={<Avatar src={storeageItem.icon} />}
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
