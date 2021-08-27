import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { Avatar, Badge, Divider, List } from 'antd'
import React, { ReactElement, SyntheticEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Action, useStore } from '../../../store/Store'
import { Dimension } from '../../../types/Types'
import { StorageModel } from '../StorageModel'

interface Props {
    storedItems: StorageModel[]
    dimensions: Dimension
}

export default function ShoppingList(props: Props): ReactElement {
    const { store, dispatch } = useStore()
    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault()
        dispatch(action)
    }
    const dimensions = props.dimensions
    const [descWidth, setDescWidth] = useState(900)

    const trimText = (text: string) => {
        const maxTextChars = (descWidth / 7) - 3
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

    return (
        <>
            {<List
                size="small"
                bordered
                style={{ width: '100%', border: 'none' }}
            >
                {props.storedItems && props.storedItems.map((listItem, listIndex) =>
                    <div key={listIndex}>

                        {listIndex > 0 && <Divider />}
                        <List.Item key={listIndex}
                            actions={
                                [
                                    <MinusCircleOutlined style={{ fontSize: '20px' }} onClick={(e) => onChangeCard(e, { type: 'REMOVE_FROM_CARD', storeageItem: listItem })} key='minus' />,
                                    <DeleteOutlined style={{ fontSize: '20px' }} onClick={(e) => onChangeCard(e, { type: 'CLEAR_ITEM_CARD', storeageItem: listItem })} disabled key="shopping" />,
                                    <PlusCircleOutlined style={{ fontSize: '20px' }} onClick={(e) => onChangeCard(e, { type: 'ADD_TO_CARD', storeageItem: listItem })} key="plus" />
                                ]
                            }>

                            <List.Item.Meta
                                avatar={<Avatar src={listItem.icon} />}
                                title={
                                    <Link to={`/storedItems/${listItem.id}`}>
                                        <p>{listItem.name}</p>
                                    </Link>
                                }
                                description={listItem.categories && trimText(listItem.categories.join(', '))}
                            />
                            <Badge size='small' count={countItems(listItem.id)} offset={[0, 0]} style={{ backgroundColor: '#52c41a' }}>
                                <ShoppingCartOutlined style={{ fontSize: '20px' }} />
                            </Badge>
                        </List.Item>
                        {listIndex + 1 === props.storedItems.length && <Divider />}
                    </div>
                )}
            </List>}
        </>
    )
}
