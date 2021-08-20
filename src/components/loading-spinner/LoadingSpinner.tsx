import { Spin } from 'antd'
import React, { ReactElement } from 'react'
import { useDemensions } from '../../hooks/StorageApi'

interface Props {
    message: string
}

export default function LoadingSpinner(props: Props): ReactElement {
    const [dimensions] = useDemensions(() => 1, 0)
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: `${dimensions.height - 64}px`, minHeight: '100%' }}>
            <Spin size='large' tip={props.message}>

            </Spin>
        </div>

    )
}
