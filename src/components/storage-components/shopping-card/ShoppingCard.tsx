import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Badge, Card, Modal, Space } from 'antd'
import React, { ReactElement, SyntheticEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDemensions } from '../../../hooks/StorageApi'
import { itemIdRoute, newItemRoute } from '../../../shared/Constants'
import { Action, useStore } from '../../../store/Store'
import { Dimension } from '../../../types/Types'
import { BasketModel, StorageModel } from '../StorageModel'
import { actionHandler } from '../../../store/Actions'
import SafeAvatar from '../../common/SafeAvatar'
import listStyles from '../storage-list/StorageList.module.css'
import { useTranslation } from 'react-i18next'

interface Props {
    storedItems: BasketModel[]
    dimensions: Dimension
}

export default function ShoppingCard(props: Props): ReactElement {
    const { t } = useTranslation();
    const { store, dispatch } = useStore()
    const navigate = useNavigate();
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

    const resolveStorageByName = (name: string): StorageModel | undefined => {
        const target = (name || '').trim().toLowerCase();
        return store.storeItems.find(i => (i.name || '').trim().toLowerCase() === target);
    }

    const confirmAddToStorage = (basketItem: BasketModel) => {
        const name = basketItem.name;
        const totalAmount = countItemsByName(name);
        Modal.confirm({
            title: t('shopping.addToStorage.confirmTitle'),
            content: t('shopping.addToStorage.confirmDesc', { name }),
            okText: t('shopping.addToStorage.yes'),
            cancelText: t('shopping.addToStorage.no'),
            onOk: () => {
                navigate(`${newItemRoute}?name=${encodeURIComponent(name)}`, {
                    state: {
                        prefill: {
                            categories: basketItem.categories || [],
                            icon: basketItem.icon || '',
                            amount: totalAmount
                        }
                    }
                })
            }
        })
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

        {props.storedItems.map(basketItem => {
            const storageItem = resolveStorageByName(basketItem.name)
            const idForLink = storageItem?.id ?? basketItem.id
            const canLink = !!storageItem
            const basketCount = countItemsByName(basketItem.name)
            const effectiveCategories: string[] = (basketItem.categories && basketItem.categories.length > 0)
                ? basketItem.categories
                : (storageItem?.categories || [])
            const subtitle = effectiveCategories.length > 0 ? trimText(effectiveCategories.join(', ')) : undefined
            const mainCategory = (basketItem.categories && basketItem.categories.length > 0
                ? basketItem.categories[0]
                : (storageItem?.categories && storageItem.categories[0]) || '')
            const iconSrc = (basketItem.icon && basketItem.icon.trim().length > 0)
                ? basketItem.icon
                : (storageItem?.icon || '')

            // Desktop look: image banner above title, inventory row at bottom (without label text)
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
                                    {canLink ? (
                                        <Link to={itemIdRoute(idForLink)}>
                                            <div className={listStyles.desktopContent}>
                                                <div className={listStyles.desktopHeader}>
                                                    <SafeAvatar className={listStyles.desktopImage} src={iconSrc} showWarnings={process.env.NODE_ENV === 'development'} />
                                                </div>
                                                <div className={listStyles.desktopTitle} title={basketItem.name}>{basketItem.name}</div>
                                                <div className={listStyles.desktopInventoryRow}>
                                                    <span className={listStyles.desktopInventory}>{subtitle || '\u00A0'}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div
                                            className={listStyles.desktopContent}
                                            onClick={() => confirmAddToStorage(basketItem)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); confirmAddToStorage(basketItem); } }}
                                        >
                                            <div className={listStyles.desktopHeader}>
                                                <SafeAvatar className={listStyles.desktopImage} src={iconSrc} showWarnings={process.env.NODE_ENV === 'development'} />
                                            </div>
                                            <div className={listStyles.desktopTitle} title={basketItem.name}>{basketItem.name}</div>
                                            <div className={listStyles.desktopInventoryRow}>
                                                <span className={listStyles.desktopInventory}>{subtitle || '\u00A0'}</span>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </Badge>
                        </Space>
                    </div>
                )
            }

            // Landscape/mobile cards: image left, title right, subtitle below, bottom info row; badge top-right of image
            return (
                <div style={{ padding: '5px' }} key={`land-${basketItem.id}`} className="space-align-block">
                    <Space>
                        <Card className={listStyles.storageCard}
                            actions={[
                                <MinusCircleOutlined onClick={(e) => onDecreaseAmount(e, basketItem)} key='minus' />,
                                <DeleteOutlined onClick={(e) => onChangeCard(e, { type: 'CLEAR_ITEM_CARD', basketItems: basketItem })} key="delete" />,
                                <PlusCircleOutlined onClick={(e) => onIncreaseAmount(e, basketItem)} key="plus" />
                            ]}
                        >
                            {canLink ? (
                                <Link to={itemIdRoute(idForLink)}>
                                    <div className={listStyles.cardContent}>
                                        <div className={listStyles.cardHeader}>
                                            <div className={listStyles.cardImage}>
                                                <Badge count={basketCount} style={{ backgroundColor: '#52c41a' }} offset={[-6, 6]}>
                                                    <SafeAvatar className={listStyles.cardAvatar} src={iconSrc} showWarnings={process.env.NODE_ENV === 'development'} />
                                                </Badge>
                                            </div>
                                            <div className={listStyles.cardInfo}>
                                                <div className={listStyles.cardTitleWrap}>
                                                    <div className={listStyles.cardTitle} title={basketItem.name}>{basketItem.name}</div>
                                                </div>
                                                <div className={listStyles.cardSubtitle} title="">&nbsp;</div>
                                            </div>
                                        </div>
                                        <div className={listStyles.cardInventory}><span>{subtitle || '\u00A0'}</span></div>
                                    </div>
                                </Link>
                            ) : (
                                <div
                                    className={listStyles.cardContent}
                                    onClick={() => confirmAddToStorage(basketItem)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); confirmAddToStorage(basketItem); } }}
                                >
                                    <div className={listStyles.cardHeader}>
                                        <div className={listStyles.cardImage}>
                                            <Badge count={basketCount} style={{ backgroundColor: '#52c41a' }} offset={[-6, 6]}>
                                                <SafeAvatar className={listStyles.cardAvatar} src={iconSrc} showWarnings={process.env.NODE_ENV === 'development'} />
                                            </Badge>
                                        </div>
                                        <div className={listStyles.cardInfo}>
                                            <div className={listStyles.cardTitleWrap}>
                                                <div className={listStyles.cardTitle} title={basketItem.name}>{basketItem.name}</div>
                                            </div>
                                            <div className={listStyles.cardSubtitle} title="">&nbsp;</div>
                                        </div>
                                    </div>
                                    <div className={listStyles.cardInventory}><span>{subtitle || '\u00A0'}</span></div>
                                </div>
                            )}
                        </Card>
                    </Space>
                </div>
            )
        })}


    </>
    )
}
