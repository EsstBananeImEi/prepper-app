import React, { ReactElement } from 'react'
import { List } from 'semantic-ui-react'
import { classicNameResolver } from 'typescript'
import { storageApi, useStorageApi } from '../../../hooks/StorageApi'
import LoadingSpinner from '../../loading-spinner/LoadingSpinner'
import StorageListItem from '../storage-list-item/StorageListItem'
import { StorageModel } from '../StorageModel'
import { Space } from 'antd';

export default function StorageList(): ReactElement {
    const [storageItems, setStorageItems] = useStorageApi<StorageModel[]>('get', '/storedItems')

    if (!storageItems) { return <LoadingSpinner message="load storage items ..." /> }

    return (

        <div className="space-align-container" style={{ justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}>
            {storageItems.length !== 0
                ? storageItems.map((storageItem, index) =>
                    <div style={{ padding: '5px' }} key={index} className="space-align-block">
                        <Space >
                            <StorageListItem storageItem={storageItem} />
                        </Space>

                    </div>
                )
                :
                <div className="ui message red">
                    <div className="header">
                        <p>Es wurden keine Bücher gefunden</p>
                        <button className="ui button red" ><i className='sync alternate icon'></i>Zurücksetzen</button>
                    </div>
                </div>
            }
        </div>
    )
}
