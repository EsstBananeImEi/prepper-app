import React from 'react'
import { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { useStorageApi } from '../../../hooks/StorageApi'
import LoadingSpinner from '../../loading-spinner/LoadingSpinner'
import StorageFormComponent from '../storage-form/StorageForm'
import { StorageModel } from '../StorageModel'

export default function StorageEditItem(): ReactElement {
    const { id } = useParams<{ id: string }>()
    const [storageItem, , axiosResponse] = useStorageApi<StorageModel>('GET', `/storeditems/${id}`)

    if (!storageItem) { return <LoadingSpinner message={`load storage item ${id}`} /> }


    return (
        <StorageFormComponent
            id={storageItem.id}
            name={storageItem.name}
            amount={String(storageItem.amount)}
            lowestAmount={String(storageItem.lowestAmount)}
            midAmount={String(storageItem.midAmount)}
            unit={storageItem.unit}
            isEdit={true}
            packageQuantity={String(storageItem.packageQuantity)}
            packageUnit={storageItem.packageUnit}
            nutrients={storageItem.nutrients}
            icon={storageItem.icon}
        />
    )
}
