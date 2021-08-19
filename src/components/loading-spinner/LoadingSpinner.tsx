import { Layout, Spin } from 'antd'
import React, { ReactElement } from 'react'

interface Props {
    message: string
}

export default function LoadingSpinner(props: Props): ReactElement {
    const { Content } = Layout
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spin size='large' tip={props.message}>

            </Spin>
        </div>

    )
}
