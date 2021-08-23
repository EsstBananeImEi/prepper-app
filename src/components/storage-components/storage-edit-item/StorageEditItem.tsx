import React from 'react'
import { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { useStorageApi } from '../../../hooks/StorageApi'
import LoadingSpinner from '../../loading-spinner/LoadingSpinner'
import StorageForm from '../storage-form/StorageForm'
import StorageFormV2 from '../storage-form/StorageFormV2'
import { StorageModel } from '../StorageModel'

export default function StorageEditItem(): ReactElement {
    const { id } = useParams<{ id: string }>()
    const [storageItem, , axiosResponse] = useStorageApi<StorageModel>('GET', `/storeditems/${id}`)

    if (!storageItem) { return <LoadingSpinner message={`load storage item ${id}`} /> }


    return (
        <StorageForm
            id={storageItem.id}
            name={storageItem.name}
            amount={String(storageItem.amount)}
            lowestAmount={String(storageItem.lowestAmount)}
            midAmount={String(storageItem.midAmount)}
            unit={storageItem.unit}
            storageLocation={storageItem.storageLocation}
            isEdit={true}
            categories={storageItem.categories}
            packageQuantity={String(storageItem.packageQuantity)}
            packageUnit={storageItem.packageUnit}
            nutrients={storageItem.nutrients}
            icon={storageItem.icon}
        />
    )
}
