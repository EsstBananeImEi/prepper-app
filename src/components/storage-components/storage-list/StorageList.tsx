import { SearchOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Pagination, Space } from 'antd';
import React, { ReactElement, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import StorageListItem from '../storage-list-item/StorageListItem';
import { StorageModel } from '../StorageModel';

export default function StorageList(): ReactElement {
    const [storageItems, setStorageItems, axiosResponse] = useStorageApi<StorageModel[]>('get', '/storedItems?_sort=name')
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

    const onSearch = (searchString: string) => {
        storageApi('get', `/storedItems?q=${searchString}`, setStorageItems)
    }

    const onGoToNew = () => history.push(`/storeditems/new`)

    return (
        <div className="space-align-container" style={{ justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}>
            <Input onChange={(e) => onSearch(e.target.value)} placeholder="input search" addonAfter={<SearchOutlined />} />
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
