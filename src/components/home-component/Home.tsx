import { Alert, Avatar, List, Skeleton } from 'antd'
import React, { ReactElement, useEffect } from 'react'
import { Message } from 'semantic-ui-react'
import { useStorageApi } from '../../hooks/StorageApi'
import { useStore } from '../../store/Store'
import LoadingSpinner from '../loading-spinner/LoadingSpinner'
import { StorageModel } from '../storage-components/StorageModel'

export default function Home(): ReactElement {
    return (
        <>
            <Message className='blue'
                icon='cogs'
                header='Coming Soon...'
                content='Hier entsteht gerade das Prepper Dashboard'
            />
        </>
    )
}
