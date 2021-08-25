import { Alert, Avatar, List, Skeleton } from 'antd'
import React, { ReactElement } from 'react'
import { Message } from 'semantic-ui-react'

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
