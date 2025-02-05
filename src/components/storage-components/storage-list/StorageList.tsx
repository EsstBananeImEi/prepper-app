import { Button, Divider, Empty, Pagination, Space } from 'antd';
import React, { ReactElement, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import { sortByName, storedErrorRoute, storedItemsApi, storedItemsRoute, storedNewItemRoute } from '../../../shared/Constants';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import StorageSearchItem from '../storage-search-item/StorageSearchItem';
import { StorageModel } from '../StorageModel';
import StorageCardItem from './storage-item/StorageCardItem';
import StorageListItem from './storage-item/StorageListItem';

export default function StorageList(): ReactElement {
    const [storageItems, setStorageItems, axiosResponse] = useStorageApi<StorageModel[]>('get', `${storedItemsApi}`)
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
        history.push(storedErrorRoute(e.message))
    })

    if (!storageItems) { return <LoadingSpinner message="load storage items ..." /> }
    console.log(storageItems)
    const onGoToNew = () => history.push(storedNewItemRoute)

    return (
        <>
            {storageItems.length <= 0
                ? <Empty
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                    imageStyle={{
                        height: 200,
                    }}
                    description={
                        <span style={{ color: 'red' }}>
                            no items in stock
                        </span>
                    }
                    key={`empty`}
                >
                    <Button onClick={onGoToNew} key={`button`} type="primary">Store item</Button>
                </Empty >
                :
                <div className="space-align-container" key={`div`} style={{ justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}>
                    <StorageSearchItem callback={setStorageItems} key={`topsearch`} />
                    {dimensions.width > 450
                        ? <>
                            {storageItems.slice(minValue, maxValue).map((storageItem, index) =>
                                <div style={{ padding: '5px' }} key={`div${index}`} className="space-align-block">
                                    <Space key={`space${index}`}>
                                        <StorageCardItem storageItem={storageItem} key={`Item${index}`} />
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
                                    key={`pagi`}
                                />
                            }

                        </>
                        : <>
                            {storageItems.map((storageItem, index) =>
                                <div key={`div${index}`} style={{ width: '100%' }}>
                                    {index >= 0 && <Divider key={`top${index}`} />}

                                    <StorageListItem key={index} storageItem={storageItem} />
                                    {index + 1 === storageItems.length && <Divider key={`bottom${index}`} />}
                                </div>
                            )
                            }
                        </>

                    }
                </div >
            }

        </>
    )
}
