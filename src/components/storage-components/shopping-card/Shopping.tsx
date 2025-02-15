import { Pagination } from 'antd'
import React, { ReactElement, useState } from 'react'
import { Message } from 'semantic-ui-react'
import { useDemensions } from '../../../hooks/StorageApi'
import { useStore } from '../../../store/Store'
import { BasketModel, StorageModel } from '../StorageModel'
import ShoppingCard from './ShoppingCard'
import ShoppingList from './ShoppingList'

export default function Shopping(): ReactElement {
    const { store, dispatch } = useStore()

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
    const paginationValues = { minValue, maxValue }
    const storedItems = store.shoppingCard.reduce((acc: BasketModel[], storageItem) => {
        if (!acc.find(storageItem_ => storageItem_.name === storageItem.name)) {
            acc.push(storageItem);
        }
        return acc;
    }, [])
        .sort((storageItemA, storageItemB) => Number(storageItemA.id) - Number(storageItemB.id));

    return (<>
        {
            store.shoppingCard.length <= 0
            &&
            <Message className='blue'
                icon='shopping cart'
                header='Der Einkaufswagen ist leer!'
                content='Scheint als brauchst du derzeit nichts'
            />
        }
        <div className="space-align-container" style={{ justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}>
            {dimensions.width > 450
                ? <>
                    <ShoppingCard storedItems={storedItems} dimensions={dimensions} pagination={paginationValues} />
                    {storedItems.length !== 0 &&
                        <Pagination responsive
                            pageSize={pageSize}
                            current={currentPage}
                            total={storedItems.length}
                            onChange={handleChange}
                            style={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: '10px' }}
                        />}
                </>
                :
                <ShoppingList storedItems={storedItems} dimensions={dimensions} key={`list`} />
            }
        </div>
    </>
    )
}
