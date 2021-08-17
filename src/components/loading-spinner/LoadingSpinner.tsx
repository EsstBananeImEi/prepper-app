import React, { ReactElement } from 'react'

interface Props {
    message: string
}

export default function LoadingSpinner(props: Props): ReactElement {

    return (
        <div className="ui active inverted dimmer">
            <div className="ui text loader massive">{props.message}</div>
        </div>
    )
}
