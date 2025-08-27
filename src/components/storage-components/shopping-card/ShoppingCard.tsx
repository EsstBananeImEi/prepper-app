import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Badge, Card, Space } from 'antd'
import React, { ReactElement, SyntheticEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDemensions } from '../../../hooks/StorageApi'
import { itemIdRoute } from '../../../shared/Constants'
import { Action, useStore } from '../../../store/Store'
import { Dimension } from '../../../types/Types'
import { BasketModel, StorageModel } from '../StorageModel'
import { actionHandler } from '../../../store/Actions'
import SafeAvatar from '../../common/SafeAvatar'
import listStyles from '../storage-list/StorageList.module.css'

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
    const isPortrait = dimensions.height >= dimensions.width
    const isDesktop = !isPortrait && dimensions.width >= 1000
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

    const resolveStorageByName = (name: string): StorageModel | undefined =>
        store.storeItems.find(i => i.name === name)
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

        {props.storedItems.map(basketItem => {
            const storageItem = resolveStorageByName(basketItem.name)
            const idForLink = storageItem?.id ?? basketItem.id
            const basketCount = countItemsByName(basketItem.name)
            const subtitle = basketItem.categories && trimText(basketItem.categories.join(', '))

            // Desktop look: image banner above title, inventory row at bottom
            if (isDesktop) {
                return (
                    <div style={{ padding: '5px' }} key={`desk-${basketItem.id}`} className="space-align-block">
                        <Space>
                            <Badge count={basketCount} offset={[-20, 20]} style={{ backgroundColor: '#52c41a' }}>
                                <Card className={listStyles.desktopCard}
                                    actions={[
                                        <MinusCircleOutlined onClick={(e) => onDecreaseAmount(e, basketItem)} key='minus' />,
                                        <DeleteOutlined onClick={(e) => onChangeCard(e, { type: 'CLEAR_ITEM_CARD', basketItems: basketItem })} key="delete" />,
                                        <PlusCircleOutlined onClick={(e) => onIncreaseAmount(e, basketItem)} key="plus" />
                                    ]}
                                >
                                    <Link to={itemIdRoute(idForLink)}>
                                        <div className={listStyles.desktopContent}>
                                            <div className={listStyles.desktopHeader}>
                                                <SafeAvatar className={listStyles.desktopImage} src={basketItem.icon} showWarnings={process.env.NODE_ENV === 'development'} />
                                            </div>
                                            <div className={listStyles.desktopTitle} title={basketItem.name}>{basketItem.name}</div>
                                            <div className={listStyles.desktopInventoryRow}>
                                                {storageItem ? (
                                                    <span className={listStyles.desktopInventory}>
                                                        Bestand: {storageItem.amount} {storageItem.unit}
                                                    </span>
                                                ) : (
                                                    <span className={listStyles.desktopInventory}>&nbsp;</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </Card>
                            </Badge>
                        </Space>
                    </div>
                )
            }

            // Landscape/mobile cards: image left, title right, subtitle below, bottom info row
            return (
                <div style={{ padding: '5px' }} key={`land-${basketItem.id}`} className="space-align-block">
                    <Space>
                        <Badge count={basketCount} offset={[-20, 20]} style={{ backgroundColor: '#52c41a' }}>
                            <Card className={listStyles.storageCard}
                                actions={[
                                    <MinusCircleOutlined onClick={(e) => onDecreaseAmount(e, basketItem)} key='minus' />,
                                    <DeleteOutlined onClick={(e) => onChangeCard(e, { type: 'CLEAR_ITEM_CARD', basketItems: basketItem })} key="delete" />,
                                    <PlusCircleOutlined onClick={(e) => onIncreaseAmount(e, basketItem)} key="plus" />
                                ]}
                            >
                                <Link to={itemIdRoute(idForLink)}>
                                    <div className={listStyles.cardContent}>
                                        <div className={listStyles.cardHeader}>
                                            <div className={listStyles.cardImage}>
                                                <SafeAvatar className={listStyles.cardAvatar} src={basketItem.icon} showWarnings={process.env.NODE_ENV === 'development'} />
                                            </div>
                                            <div className={listStyles.cardInfo}>
                                                <div className={listStyles.cardTitleWrap}>
                                                    <div className={listStyles.cardTitle} title={basketItem.name}>{basketItem.name}</div>
                                                </div>
                                                <div className={listStyles.cardSubtitle} title={subtitle || ''}>{subtitle}</div>
                                            </div>
                                        </div>
                                        <div className={listStyles.cardInventory}>
                                            {storageItem ? (
                                                <span>Bestand: {storageItem.amount} {storageItem.unit}</span>
                                            ) : (
                                                <span>&nbsp;</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        </Badge>
                    </Space>
                </div>
            )
        })}


    </>
    )
}
