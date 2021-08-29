import { Button, Result } from 'antd';
import React, { ReactElement } from 'react';
import { useHistory } from 'react-router-dom';
import { homeRoute } from '../../shared/Constants';

export default function MyErrorMessage(): ReactElement {
    const history = useHistory();

    const onGoToHome = () => {
        history.push(homeRoute);
    }

    return (
        <Result
            status="error"
            title='An error occurred, please try again later'
            subTitle="if the problem persists, please contact your administrator!"
            extra={[
                <Button onClick={onGoToHome} type="ghost" key="home">
                    Home
                </Button>,

            ]}
        >

        </Result>
    )
}

