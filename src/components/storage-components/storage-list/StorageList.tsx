import React, { ReactElement, useEffect, useState } from 'react'
import { List } from 'semantic-ui-react'
import { classicNameResolver } from 'typescript'
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi'
import LoadingSpinner from '../../loading-spinner/LoadingSpinner'
import StorageListItem from '../storage-list-item/StorageListItem'
import { StorageModel } from '../StorageModel'
import { Space, Empty, Button, Pagination } from 'antd';
import { Link, useHistory } from 'react-router-dom'
import MyErrorMessage from '../../my-error-component/MyErrorMessage'

export default function StorageList(): ReactElement {
    const [storageItems, , axiosResponse] = useStorageApi<StorageModel[]>('get', '/storedItems')
    const history = useHistory();
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

    axiosResponse && axiosResponse.catch((e) => {
        history.push(`/storeditems/error/${e.message}`)
    })

    if (!storageItems) { return <LoadingSpinner message="load storage items ..." /> }

    const onGoToNew = () => history.push(`/storeditems/new`)


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
            {storageItems.length !== 0 &&
                <Pagination responsive
                    pageSize={pageSize}
                    current={currentPage}
                    total={storageItems.length}
                    onChange={handleChange}
                    style={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: '10px' }}
                />}
        </div >
    )
}
