import { SearchOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Input, Pagination, Space } from 'antd';
import React, { ReactElement, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { storageApi, useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import ShoppingList from '../shopping-card/ShoppingList';
import StorageCardItem from '../storage-item/StorageCardItem';
import StorageListItem from '../storage-item/StorageListItem';
import StorageSearchItem from '../storage-search-item/StorageSearchItem';
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
    const [maxValue, setMaxValue] = useState(Math.floor(Math.floor(dimensions.height - 160) / 155) * Math.floor(Math.floor(dimensions.width - 20) / 310))
    const pageSize = Math.floor(Math.floor(dimensions.height - 160) / 155) * Math.floor(Math.floor(dimensions.width - 20) / 310)

    axiosResponse && axiosResponse.catch((e) => {
        history.push(`/storeditems/error/${e.message}`)
    })

    if (!storageItems) { return <LoadingSpinner message="load storage items ..." /> }

    const onSearch = (searchString: string) => {
        storageApi('get', `/storedItems?q=${searchString}`, setStorageItems)
    }

    const onGoToNew = () => history.push(`/storeditems/new`)

    return (
        <>
            {storageItems.length < 0
                && <Empty
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
                </Empty >}
            <div className="space-align-container" style={{ justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}>
                <StorageSearchItem callback={setStorageItems} />
                {dimensions.width > 450
                    ? <>
                        {storageItems.slice(minValue, maxValue).map((storageItem, index) =>
                            <div style={{ padding: '5px' }} key={index} className="space-align-block">
                                <Space>
                                    <StorageCardItem storageItem={storageItem} />
                                </Space>

                            </div>

                        )}
                        {
                            storageItems.length !== 0 &&
                            <Pagination responsive
                                pageSize={pageSize}
                                current={currentPage}
                                total={storageItems.length}
                                onChange={handleChange}
                                style={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: '10px' }}
                            />
                        }

                    </>
                    : <>
                        {storageItems.map((storageItem, index) =>
                            <>
                                {index >= 0 && <Divider />}

                                <StorageListItem key={index} storageItem={storageItem} />
                                {index + 1 === storageItems.length && <Divider />}
                            </>
                        )
                        }
                    </>

                }
            </div >
        </>
    )
}
