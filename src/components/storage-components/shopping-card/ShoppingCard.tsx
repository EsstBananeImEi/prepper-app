import React, { SyntheticEvent, useEffect, useState } from 'react'
import { ReactElement } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Message } from 'semantic-ui-react'
import { Action, useStore } from '../../../Store'
import StorageListItem from '../storage-list-item/StorageListItem'
import { StorageModel } from '../StorageModel'
import { Card, Col, Row, List, Avatar, Button, Badge, Space, Pagination, Switch, Divider } from 'antd';
import { EditOutlined, ShoppingCartOutlined, DeleteOutlined, InfoCircleOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import Meta from 'antd/lib/card/Meta'
import { storageApi, useDemensions } from '../../../hooks/StorageApi'
import { useInterval } from '../../../hooks/UseInterval'


export default function ShoppingCard(): ReactElement {
    const { store, dispatch } = useStore()
    const [show, setShow] = useState(false)
    const [amount, setAmount] = useState(0)
    const history = useHistory()
    const onChangeCard = (event: SyntheticEvent, action: Action): void => {
        event.preventDefault()
        dispatch(action)
    }
    const handleChange = (page: number) => {
        setCurrentPage(page)
        setMinValue(currentVal => (page - 1) * pageSize)
        setMaxValue(currentVal => page * pageSize)
    }
    const [currentPage, setCurrentPage] = useState(1)
    const [dimensions] = useDemensions(handleChange, currentPage)
    const [minValue, setMinValue] = useState(0)
    const [maxValue, setMaxValue] = useState(Math.floor(Math.floor(dimensions.height - 128) / 155) * Math.floor(Math.floor(dimensions.width - 20) / 310))
    const pageSize = Math.floor(Math.floor(dimensions.height - 128) / 155) * Math.floor(Math.floor(dimensions.width - 20) / 310)
    const [descWidth, setDescWidth] = useState(900)



    const onClear = (action: Action): void => {
        dispatch(action)
    }

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

    const storageItems = store.shoppingCard.reduce((acc: StorageModel[], storageItem) => {
        acc.find(storageItem_ => storageItem_.id === storageItem.id) || acc.push(storageItem)
        return acc
    }, [])
        .sort((storageItemA, storageItemB) => Number(storageItemA.id) - Number(storageItemB.id))

    const countItems = (id: number) => {
        return store.shoppingCard.filter(storageItem => storageItem.id === id).length
    }

    return (<>

        {store.shoppingCard.length > 0
            ?
            <div>
                <Switch checked={show} onChange={() => setShow(!show)} checkedChildren="List" unCheckedChildren="Cards" />
            </div>
            :
            <Message className='blue'
                icon='shopping cart'
                header='Der Einkaufswagen ist leer!'
                content='Scheint als brauchst du derzeit nichts'
            />
        }
        <div className="space-align-container" style={{ justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}>
            {!show
                ? storageItems
                    ? storageItems.slice(minValue, maxValue).map(storeageItem =>
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
                                        <Link to={`/storeditems/${storeageItem.id}`}>
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
                    ) : ''
                :
                <List
                    size="small"
                    bordered
                    style={{ width: '100%', border: 'none' }}
                >
                    {storageItems && storageItems.map((listItem, listIndex) =>
                        <>
                            {listIndex >= 0 && <Divider />}

                            <List.Item key={listIndex}
                                actions={
                                    [
                                        <MinusCircleOutlined onClick={(e) => onChangeCard(e, { type: 'REMOVE_FROM_CARD', storeageItem: listItem })} key='minus' />,
                                        <DeleteOutlined onClick={(e) => onChangeCard(e, { type: 'CLEAR_ITEM_CARD', storeageItem: listItem })} disabled key="shopping" />,
                                        <PlusCircleOutlined onClick={(e) => onChangeCard(e, { type: 'ADD_TO_CARD', storeageItem: listItem })} key="plus" />
                                    ]
                                }>
                                <List.Item.Meta
                                    avatar={<Avatar src={listItem.icon} />}
                                    title={<a href="https://ant.design">{listItem.name}</a>}
                                    description={listItem.categories && trimText(listItem.categories.join(', '))}
                                />
                                <Badge size='small' count={countItems(listItem.id)} offset={[0, -6]} style={{ backgroundColor: '#52c41a' }}>
                                    <ShoppingCartOutlined />
                                </Badge>
                            </List.Item>
                            {listIndex + 1 === storageItems.length && <Divider />}
                        </>
                    )
                    }

                </List>
            }
            {storageItems.length !== 0 &&
                <Pagination responsive
                    pageSize={pageSize}
                    current={currentPage}
                    total={storageItems.length}
                    onChange={handleChange}
                    style={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: '10px' }}
                />}




        </div>
    </>
    )
}
