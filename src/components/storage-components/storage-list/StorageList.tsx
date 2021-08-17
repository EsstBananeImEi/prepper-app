import React, { ReactElement, useState } from 'react'
import { List } from 'semantic-ui-react'
import { classicNameResolver } from 'typescript'
import { storageApi, useStorageApi } from '../../../hooks/StorageApi'
import LoadingSpinner from '../../loading-spinner/LoadingSpinner'
import StorageListItem from '../storage-list-item/StorageListItem'
import { StorageModel } from '../StorageModel'
import { Space, Empty, Button, Pagination } from 'antd';
import { Link, useHistory } from 'react-router-dom'

export default function StorageList(): ReactElement {
    const [storageItems, setStorageItems] = useStorageApi<StorageModel[]>('get', '/storedItems')
    const history = useHistory();
    const [currentPage, setCurrentPage] = useState(1)
    const [minValue, setMinValue] = useState(0)
    const [maxValue, setMaxValue] = useState(16)
    const pageSize = 16

    if (!storageItems) { return <LoadingSpinner message="load storage items ..." /> }
    const onGoToNew = () => history.push(`/storeditems/new`)
    const handleChange = (page: number) => {
        setCurrentPage(page)
        setMinValue(currentVal => (page - 1) * pageSize)
        setMaxValue(currentVal => page * pageSize)
    }

    return (

        <div className="space-align-container" style={{ justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}>
            {storageItems.length !== 0
                ? storageItems.slice(minValue, maxValue).map((storageItem, index) =>
                    <div style={{ padding: '5px' }} key={index} className="space-align-block">
                        <Space>
                            <StorageListItem storageItem={storageItem} />
                        </Space>

                    </div>
                )
                :
                <Empty
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                    imageStyle={{
                        height: 200,
                    }}
                    description={
                        <span style={{ color: 'red' }}>
                            no items in stock
                        </span>
                    }
                >
                    <Button onClick={onGoToNew} type="primary">Store item</Button>
                </Empty >
            }
            <Pagination
                pageSize={pageSize}
                current={currentPage}
                total={storageItems.length}
                onChange={handleChange}
                style={{ position: 'absolute', bottom: "60px", width: "100%", display: "flex", justifyContent: "center" }}
            />
        </div >
    )
}
